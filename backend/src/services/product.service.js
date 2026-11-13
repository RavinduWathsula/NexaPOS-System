import { prisma } from '../config/prisma.js'

export async function listProducts(filters = {}) {
  const {
    search,
    categoryId,
    brandId,
    isSerialized,
    page = 1,
    limit = 50,
  } = filters

  const where = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { barcode: { contains: search } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (brandId) {
    where.brandId = brandId
  }

  if (isSerialized !== undefined && isSerialized !== '') {
    where.isSerialized = isSerialized === 'true' || isSerialized === true
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        inventory: {
          select: { quantity: true, reorderLevel: true, location: true, branch: true },
        },
        _count: {
          select: {
            devices: {
              where: { status: 'IN_STOCK' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Normalize current stock: for serialized, it's devices count; for non-serialized, it's inventory quantity
  const items = products.map((p) => {
    const totalQty = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
    const inStockDevices = p._count.devices
    return {
      ...p,
      stockCount: p.isSerialized ? inStockDevices : totalQty,
      inStockDevices,
    }
  })

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      variants: true,
      images: true,
      inventory: true,
      devices: {
        where: { status: 'IN_STOCK' },
        take: 20,
      },
      _count: {
        select: {
          devices: true,
          saleItems: true,
        },
      },
    },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  return product
}

export async function createProduct(data, userId) {
  // Check unique SKU
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  })

  if (existingSku) {
    const error = new Error(`Product with SKU '${data.sku}' already exists.`)
    error.statusCode = 409
    throw error
  }

  // Check unique Barcode if provided
  if (data.barcode) {
    const existingBarcode = await prisma.product.findUnique({
      where: { barcode: data.barcode },
    })
    if (existingBarcode) {
      const error = new Error(`Product with Barcode '${data.barcode}' already exists.`)
      error.statusCode = 409
      throw error
    }
  }

  // Execute inside transaction to guarantee atomic inventory setup
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        isSerialized: Boolean(data.isSerialized),
        costPrice: data.costPrice,
        retailPrice: data.retailPrice,
        minPrice: data.minPrice || null,
        defaultWarrantyMonths: data.defaultWarrantyMonths || 0,
      },
      include: {
        category: true,
        brand: true,
      },
    })

    // Initialize Inventory record
    const initialQty = data.isSerialized ? 0 : data.initialStock || 0
    await tx.inventory.create({
      data: {
        productId: product.id,
        quantity: initialQty,
        reorderLevel: data.reorderLevel || 5,
        location: data.location || 'Store Floor',
        branch: 'Colombo Main',
      },
    })

    // If initial stock was provided for non-serialized item, record stock movement
    if (initialQty > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'STOCK_IN',
          quantity: initialQty,
          previousQty: 0,
          newQty: initialQty,
          unitCost: data.costPrice,
          reference: 'INITIAL_STOCK',
          notes: 'Initial inventory setup',
          createdById: userId,
        },
      })
    }

    return product
  })
}

export async function updateProduct(id, data) {
  // Check unique SKU if updating
  if (data.sku) {
    const existing = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        NOT: { id },
      },
    })
    if (existing) {
      const error = new Error(`Product with SKU '${data.sku}' already exists.`)
      error.statusCode = 409
      throw error
    }
  }

  return await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId,
      costPrice: data.costPrice,
      retailPrice: data.retailPrice,
      minPrice: data.minPrice,
      defaultWarrantyMonths: data.defaultWarrantyMonths,
    },
    include: {
      category: true,
      brand: true,
      inventory: true,
    },
  })
}

export async function deleteProduct(id) {
  // Check if product has sales or registered devices
  const [deviceCount, saleCount] = await Promise.all([
    prisma.device.count({ where: { productId: id } }),
    prisma.saleItem.count({ where: { productId: id } }),
  ])

  if (deviceCount > 0 || saleCount > 0) {
    const error = new Error(
      `Cannot delete product: It is linked to ${deviceCount} serialized devices and ${saleCount} sale records.`
    )
    error.statusCode = 400
    throw error
  }

  // Delete inventory and movements, then product
  return await prisma.$transaction(async (tx) => {
    await tx.inventory.deleteMany({ where: { productId: id } })
    await tx.stockMovement.deleteMany({ where: { productId: id } })
    return await tx.product.delete({ where: { id } })
  })
}

