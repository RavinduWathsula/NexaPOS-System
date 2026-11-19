import { prisma } from '../config/prisma.js'

export async function getInventoryDashboard() {
  const [
    products,
    inStockDevicesCount,
    damagedDevicesCount,
    inventoryRecords,
  ] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        brand: { select: { name: true } },
        isSerialized: true,
        costPrice: true,
        retailPrice: true,
        inventory: {
          select: { quantity: true, reorderLevel: true },
        },
        _count: {
          select: {
            devices: { where: { status: 'IN_STOCK' } },
          },
        },
      },
    }),
    prisma.device.count({
      where: { status: 'IN_STOCK' },
    }),
    prisma.device.count({
      where: { status: { in: ['DEFECTIVE', 'DAMAGED'] } },
    }),
    prisma.inventory.findMany({
      select: { quantity: true },
    }),
  ])

  let totalStockUnits = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  let totalCostValuation = 0
  let totalRetailValuation = 0
  const lowStockProducts = []

  for (const p of products) {
    const qty = p.isSerialized
      ? p._count.devices
      : p.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

    const reorder = p.inventory[0]?.reorderLevel || 5
    const cost = Number(p.costPrice) || 0
    const retail = Number(p.retailPrice) || 0

    totalStockUnits += qty
    totalCostValuation += qty * cost
    totalRetailValuation += qty * retail

    if (qty === 0) {
      outOfStockCount++
      lowStockProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name || 'General',
        currentStock: 0,
        reorderLevel: reorder,
        isSerialized: p.isSerialized,
      })
    } else if (qty <= reorder) {
      lowStockCount++
      lowStockProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name || 'General',
        currentStock: qty,
        reorderLevel: reorder,
        isSerialized: p.isSerialized,
      })
    }
  }

  const potentialProfit = Math.max(0, totalRetailValuation - totalCostValuation)

  return {
    totalStockUnits,
    totalSerializedDevices: inStockDevicesCount,
    lowStockCount,
    outOfStockCount,
    damagedCount: damagedDevicesCount,
    totalProductsCount: products.length,
    lowStockProducts: lowStockProducts.slice(0, 10),
    valuation: {
      totalCostValuation,
      totalRetailValuation,
      potentialProfit,
      marginPercentage:
        totalRetailValuation > 0
          ? ((potentialProfit / totalRetailValuation) * 100).toFixed(1)
          : 0,
    },
  }
}

export async function getInventoryStockList(filters = {}) {
  const {
    search,
    categoryId,
    brandId,
    stockStatus,
    isSerialized,
    page = 1,
    limit = 20,
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
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        inventory: true,
        _count: {
          select: {
            devices: { where: { status: 'IN_STOCK' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const items = products.map((p) => {
    const inv = p.inventory[0] || { quantity: 0, reorderLevel: 5, location: 'Store Floor', branch: 'Colombo Main' }
    const currentStock = p.isSerialized ? p._count.devices : inv.quantity
    const reorderLevel = inv.reorderLevel || 5
    const cost = Number(p.costPrice) || 0
    const retail = Number(p.retailPrice) || 0

    let status = 'IN_STOCK'
    if (currentStock === 0) {
      status = 'OUT_OF_STOCK'
    } else if (currentStock <= reorderLevel) {
      status = 'LOW_STOCK'
    }

    return {
      productId: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category?.name || 'Uncategorized',
      brand: p.brand?.name || 'N/A',
      isSerialized: p.isSerialized,
      currentStock,
      reorderLevel,
      location: inv.location || 'Store Floor',
      branch: inv.branch || 'Colombo Main',
      costPrice: cost,
      retailPrice: retail,
      totalCostValue: currentStock * cost,
      totalRetailValue: currentStock * retail,
      status,
    }
  })

  // Filter in-memory if stockStatus is specified
  const filteredItems = stockStatus
    ? items.filter((item) => item.status === stockStatus)
    : items

  return {
    items: filteredItems,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function adjustStock(data, userId) {
  const { productId, type, quantity, reason, notes, branch = 'Colombo Main' } = data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: { where: { branch } } },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (product.isSerialized) {
    const error = new Error(
      'Stock adjustments for serialized products must be performed via IMEI status transitions in the IMEI Registry.'
    )
    error.statusCode = 400
    throw error
  }

  const currentInventory = product.inventory[0] || { quantity: 0 }
  const previousQty = currentInventory.quantity
  let newQty = previousQty

  if (type === 'ADD') {
    newQty = previousQty + quantity
  } else if (type === 'SUBTRACT') {
    newQty = Math.max(0, previousQty - quantity)
  } else if (type === 'SET') {
    newQty = quantity
  }

  const diff = newQty - previousQty
  const referenceNumber = `ADJ-${Date.now().toString().slice(-6)}`

  return await prisma.$transaction(async (tx) => {
    // 1. Upsert Inventory
    const updatedInventory = await tx.inventory.upsert({
      where: { productId_branch: { productId, branch } },
      update: { quantity: newQty },
      create: {
        productId,
        quantity: newQty,
        reorderLevel: 5,
        location: 'Store Floor',
        branch,
      },
    })

    // 2. Create StockAdjustment record
    const adjustment = await tx.stockAdjustment.create({
      data: {
        referenceNumber,
        productId,
        quantity: diff,
        previousQty,
        newQty,
        type,
        reason,
        notes: notes || null,
        adjustedById: userId || 'SYSTEM',
        status: 'COMPLETED',
      },
    })

    // 3. Create StockMovement record
    await tx.stockMovement.create({
      data: {
        productId,
        type: 'ADJUSTMENT',
        quantity: Math.abs(diff),
        previousQty,
        newQty,
        unitCost: product.costPrice,
        reference: referenceNumber,
        notes: `Adjustment (${type}): ${reason}`,
        createdById: userId,
      },
    })

    return {
      adjustment,
      productName: product.name,
      previousQty,
      newQty,
      difference: diff,
    }
  })
}

export async function manualStockIn(data, userId) {
  const { productId, quantity, unitCost, reference, notes, branch = 'Colombo Main' } = data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: { where: { branch } } },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (product.isSerialized) {
    const error = new Error(
      'Serialized products cannot use manual quantity stock-in. Please use IMEI Device Intake.'
    )
    error.statusCode = 400
    throw error
  }

  const currentInventory = product.inventory[0] || { quantity: 0 }
  const previousQty = currentInventory.quantity
  const newQty = previousQty + quantity
  const ref = reference || `IN-${Date.now().toString().slice(-6)}`

  return await prisma.$transaction(async (tx) => {
    await tx.inventory.upsert({
      where: { productId_branch: { productId, branch } },
      update: { quantity: newQty },
      create: {
        productId,
        quantity: newQty,
        reorderLevel: 5,
        location: 'Store Floor',
        branch,
      },
    })

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type: 'STOCK_IN',
        quantity,
        previousQty,
        newQty,
        unitCost: unitCost || product.costPrice,
        reference: ref,
        notes: notes || 'Manual Stock Intake',
        createdById: userId,
      },
    })

    return {
      productId,
      productName: product.name,
      previousQty,
      newQty,
      movement,
    }
  })
}

export async function manualStockOut(data, userId) {
  const { productId, quantity, reason, reference, notes, branch = 'Colombo Main' } = data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: { where: { branch } } },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (product.isSerialized) {
    const error = new Error(
      'Serialized products must be managed via IMEI status changes (e.g., DAMAGED or SOLD).'
    )
    error.statusCode = 400
    throw error
  }

  const currentInventory = product.inventory[0] || { quantity: 0 }
  const previousQty = currentInventory.quantity

  if (previousQty < quantity) {
    const error = new Error(
      `Cannot stock out ${quantity} units: Only ${previousQty} units available in stock.`
    )
    error.statusCode = 400
    throw error
  }

  const newQty = previousQty - quantity
  const ref = reference || `OUT-${Date.now().toString().slice(-6)}`

  return await prisma.$transaction(async (tx) => {
    await tx.inventory.update({
      where: { productId_branch: { productId, branch } },
      data: { quantity: newQty },
    })

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type: 'STOCK_OUT',
        quantity,
        previousQty,
        newQty,
        unitCost: product.costPrice,
        reference: ref,
        notes: `${reason}${notes ? ` - ${notes}` : ''}`,
        createdById: userId,
      },
    })

    return {
      productId,
      productName: product.name,
      previousQty,
      newQty,
      movement,
    }
  })
}

export async function getStockMovements(filters = {}) {
  const { productId, type, search, page = 1, limit = 50 } = filters

  const where = {}

  if (productId) {
    where.productId = productId
  }

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { reference: { contains: search } },
      { notes: { contains: search } },
      { product: { name: { contains: search } } },
      { product: { sku: { contains: search } } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, movements] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take,
      include: {
        product: {
          select: { id: true, name: true, sku: true, isSerialized: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    items: movements,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function updateStockThreshold(productId, data) {
  const { reorderLevel, location, branch = 'Colombo Main' } = data

  return await prisma.inventory.upsert({
    where: { productId_branch: { productId, branch } },
    update: {
      reorderLevel,
      location: location || undefined,
    },
    create: {
      productId,
      quantity: 0,
      reorderLevel,
      location: location || 'Store Floor',
      branch,
    },
  })
}

export async function getStockAdjustments(filters = {}) {
  const { page = 1, limit = 30 } = filters
  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, adjustments] = await Promise.all([
    prisma.stockAdjustment.count(),
    prisma.stockAdjustment.findMany({
      skip,
      take,
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    items: adjustments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

