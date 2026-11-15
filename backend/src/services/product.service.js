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
        variants: true,
        images: {
          orderBy: { isPrimary: 'desc' },
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
      images: {
        orderBy: { isPrimary: 'desc' },
      },
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

    // Create primary image if provided
    if (data.imageUrl) {
      await tx.productImage.create({
        data: {
          productId: product.id,
          url: data.imageUrl,
          isPrimary: true,
        },
      })
    } else if (Array.isArray(data.images) && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        await tx.productImage.create({
          data: {
            productId: product.id,
            url: data.images[i],
            isPrimary: i === 0,
          },
        })
      }
    }

    // Create Variants if provided
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      for (const v of data.variants) {
        if (!v.sku) continue
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku.trim(),
            barcode: v.barcode?.trim() || null,
            model: v.model?.trim() || null,
            color: v.color?.trim() || null,
            storage: v.storage?.trim() || null,
            ram: v.ram?.trim() || null,
            costPrice: v.costPrice || data.costPrice,
            retailPrice: v.retailPrice || data.retailPrice,
          },
        })
      }
    }

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

    return await tx.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        brand: true,
        variants: true,
        images: true,
        inventory: true,
      },
    })
  })
}

export async function updateProduct(id, data, userId) {
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

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
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
        images: true,
        variants: true,
      },
    })

    // Update inventory record (reorderLevel, location, quantity)
    if (
      data.reorderLevel !== undefined ||
      data.location !== undefined ||
      data.initialStock !== undefined ||
      data.quantity !== undefined
    ) {
      const existingInv = await tx.inventory.findFirst({
        where: { productId: id },
      })

      const newReorder = data.reorderLevel !== undefined ? Number(data.reorderLevel) : (existingInv?.reorderLevel ?? 5)
      const newLoc = data.location !== undefined ? data.location : (existingInv?.location || 'Store Floor')
      const targetQty = data.quantity !== undefined 
        ? Number(data.quantity) 
        : (data.initialStock !== undefined ? Number(data.initialStock) : undefined)

      if (existingInv) {
        const updateFields = {
          reorderLevel: newReorder,
          location: newLoc,
        }

        if (targetQty !== undefined && !updated.isSerialized) {
          const prevQty = existingInv.quantity
          updateFields.quantity = Math.max(0, targetQty)

          if (targetQty !== prevQty) {
            const diff = targetQty - prevQty
            await tx.stockMovement.create({
              data: {
                productId: id,
                type: diff > 0 ? 'STOCK_IN' : 'ADJUSTMENT',
                quantity: Math.abs(diff),
                previousQty: prevQty,
                newQty: targetQty,
                unitCost: updated.costPrice,
                reference: diff > 0 ? `RESTOCK-${Date.now().toString().slice(-6)}` : `ADJ-${Date.now().toString().slice(-6)}`,
                notes: diff > 0 ? 'Manual Stock Restock / Update' : 'Stock level updated via Product Edit',
                createdById: userId || null,
              },
            })
          }
        }

        await tx.inventory.update({
          where: { id: existingInv.id },
          data: updateFields,
        })
      } else {
        const initialQty = (!updated.isSerialized && targetQty !== undefined) ? Math.max(0, targetQty) : 0
        await tx.inventory.create({
          data: {
            productId: id,
            quantity: initialQty,
            reorderLevel: newReorder,
            location: newLoc,
            branch: 'Colombo Main',
          },
        })
      }
    }

    // Update or set primary image
    if (data.imageUrl !== undefined) {
      const trimmedUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : ''
      if (trimmedUrl) {
        const primaryImg = await tx.productImage.findFirst({
          where: { productId: id, isPrimary: true },
        })
        if (primaryImg) {
          await tx.productImage.update({
            where: { id: primaryImg.id },
            data: { url: trimmedUrl },
          })
        } else {
          await tx.productImage.updateMany({
            where: { productId: id },
            data: { isPrimary: false },
          })
          await tx.productImage.create({
            data: {
              productId: id,
              url: trimmedUrl,
              isPrimary: true,
            },
          })
        }
      } else {
        await tx.productImage.deleteMany({
          where: { productId: id },
        })
      }
    }

    return await tx.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventory: true,
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        variants: true,
      },
    })
  })
}

// ==============================
// Product Variants Operations
// ==============================

export async function addProductVariant(productId, variantData) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  // Check unique SKU for variant
  const existingSku = await prisma.productVariant.findUnique({
    where: { sku: variantData.sku },
  })
  if (existingSku) {
    const error = new Error(`Variant SKU '${variantData.sku}' already exists.`)
    error.statusCode = 409
    throw error
  }

  return await prisma.productVariant.create({
    data: {
      productId,
      sku: variantData.sku.trim(),
      barcode: variantData.barcode?.trim() || null,
      model: variantData.model?.trim() || null,
      color: variantData.color?.trim() || null,
      storage: variantData.storage?.trim() || null,
      ram: variantData.ram?.trim() || null,
      costPrice: variantData.costPrice || product.costPrice,
      retailPrice: variantData.retailPrice || product.retailPrice,
    },
  })
}

export async function updateProductVariant(variantId, variantData) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } })
  if (!existing) {
    const error = new Error('Product variant not found.')
    error.statusCode = 404
    throw error
  }

  if (variantData.sku && variantData.sku !== existing.sku) {
    const dup = await prisma.productVariant.findUnique({ where: { sku: variantData.sku } })
    if (dup) {
      const error = new Error(`Variant SKU '${variantData.sku}' is already in use.`)
      error.statusCode = 409
      throw error
    }
  }

  return await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku: variantData.sku,
      barcode: variantData.barcode,
      model: variantData.model,
      color: variantData.color,
      storage: variantData.storage,
      ram: variantData.ram,
      costPrice: variantData.costPrice,
      retailPrice: variantData.retailPrice,
    },
  })
}

export async function deleteProductVariant(variantId) {
  const devicesCount = await prisma.device.count({ where: { variantId } })
  if (devicesCount > 0) {
    const error = new Error(`Cannot delete variant: ${devicesCount} devices are assigned to this variant.`)
    error.statusCode = 400
    throw error
  }

  return await prisma.productVariant.delete({ where: { id: variantId } })
}

// ==============================
// Product Images Operations
// ==============================

export async function addProductImage(productId, { url, isPrimary = false }) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    })
  }

  return await prisma.productImage.create({
    data: {
      productId,
      url,
      isPrimary,
    },
  })
}

export async function deleteProductImage(imageId) {
  return await prisma.productImage.delete({ where: { id: imageId } })
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

