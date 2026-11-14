import { prisma } from '../config/prisma.js'

export async function listPurchases(filters = {}) {
  const {
    supplierId,
    status,
    paymentStatus,
    search,
    page = 1,
    limit = 50,
  } = filters

  const where = {}

  if (supplierId) {
    where.supplierId = supplierId
  }

  if (status) {
    where.status = status
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus
  }

  if (search) {
    where.OR = [
      { poNumber: { contains: search } },
      { supplierInvoiceNumber: { contains: search } },
      { supplier: { name: { contains: search } } },
      { supplier: { company: { contains: search } } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      skip,
      take,
      include: {
        supplier: { select: { id: true, name: true, company: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, isSerialized: true } },
          },
        },
        _count: {
          select: { devices: true, payments: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    }),
  ])

  return {
    items: purchases,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function getPurchaseById(id) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: {
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
      },
      devices: {
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  })

  if (!purchase) {
    const error = new Error('Purchase order not found.')
    error.statusCode = 404
    throw error
  }

  const remainingBalance = Math.max(0, Number(purchase.totalAmount) - Number(purchase.paidAmount))

  return {
    ...purchase,
    remainingBalance,
  }
}

export async function createPurchaseOrder(data, userId) {
  const {
    supplierId,
    supplierInvoiceNumber,
    orderDate,
    deliveryDate,
    tax = 0,
    notes,
    receiveImmediately = false,
    items,
  } = data

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
  if (!supplier) {
    const error = new Error('Supplier not found.')
    error.statusCode = 404
    throw error
  }

  // Calculate Subtotal & Total
  let subtotal = 0
  for (const item of items) {
    subtotal += item.quantity * item.unitCost
  }
  const totalAmount = subtotal + Number(tax || 0)

  // Generate unique PO number e.g. PO-2411-XXXX
  const poNumber = `PO-${Date.now().toString().slice(-8)}`

  return await prisma.$transaction(async (tx) => {
    // 1. Create Purchase Order header
    const purchase = await tx.purchase.create({
      data: {
        poNumber,
        supplierInvoiceNumber: supplierInvoiceNumber?.trim() || null,
        supplierId,
        createdById: userId,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        deliveryDate: receiveImmediately ? new Date() : deliveryDate ? new Date(deliveryDate) : null,
        subtotal,
        tax: Number(tax || 0),
        totalAmount,
        paidAmount: 0,
        paymentStatus: 'UNPAID',
        status: receiveImmediately ? 'RECEIVED' : 'ORDERED',
        notes: notes?.trim() || null,
      },
    })

    // 2. Create Purchase line items
    for (const item of items) {
      const lineSubtotal = item.quantity * item.unitCost
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: lineSubtotal,
        },
      })
    }

    // 3. If receiveImmediately is true, update inventory & register serialized devices now
    if (receiveImmediately) {
      await processGoodsReceiving(tx, purchase.id, poNumber, items, userId)
    }

    return await tx.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        supplier: true,
        items: { include: { product: true } },
        devices: true,
      },
    })
  })
}

/**
 * Confirm Goods Received (GRN)
 * Updates inventory levels and registers IMEIs atomically.
 */
export async function confirmGoodsReceived(purchaseId, receivingData = {}, userId) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      items: {
        include: { product: true },
      },
    },
  })

  if (!purchase) {
    const error = new Error('Purchase order not found.')
    error.statusCode = 404
    throw error
  }

  if (purchase.status === 'RECEIVED') {
    const error = new Error('This purchase order has already been marked as RECEIVED and inventoried.')
    error.statusCode = 400
    throw error
  }

  if (purchase.status === 'CANCELLED') {
    const error = new Error('Cannot receive a cancelled purchase order.')
    error.statusCode = 400
    throw error
  }

  return await prisma.$transaction(async (tx) => {
    // Prepare items list with devices if passed in receivingData
    const items = purchase.items.map((pi) => {
      const passedDevices = receivingData.devices?.filter((d) => d.productId === pi.productId)
      return {
        productId: pi.productId,
        quantity: pi.quantity,
        unitCost: Number(pi.unitCost),
        devices: passedDevices || [],
      }
    })

    await processGoodsReceiving(tx, purchase.id, purchase.poNumber, items, userId)

    // Update Purchase header status
    const updatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'RECEIVED',
        deliveryDate: new Date(),
        notes: receivingData.notes
          ? `${purchase.notes ? `${purchase.notes} | ` : ''}${receivingData.notes}`
          : purchase.notes,
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
        devices: true,
      },
    })

    return updatedPurchase
  })
}

/**
 * Internal helper to atomically update inventory and register serialized devices
 */
async function processGoodsReceiving(tx, purchaseId, poNumber, items, userId) {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
    })

    if (!product) continue

    if (product.isSerialized) {
      // Serialized product: Validate & register each device
      const devices = item.devices || []

      // If user supplied IMEIs
      if (devices.length > 0) {
        const imeiList = devices.map((d) => d.imei1.trim())

        // Check duplicate within payload
        const uniqueSet = new Set(imeiList)
        if (uniqueSet.size !== imeiList.length) {
          const error = new Error(
            `Duplicate IMEI detected within submitted intake list for product '${product.name}'.`
          )
          error.statusCode = 400
          throw error
        }

        // Check duplicate in database
        const existingInDb = await tx.device.findMany({
          where: { imei1: { in: imeiList } },
          select: { imei1: true },
        })

        if (existingInDb.length > 0) {
          const conflictList = existingInDb.map((d) => d.imei1).join(', ')
          const error = new Error(
            `Cannot receive goods: The following IMEIs are already in the database: ${conflictList}`
          )
          error.statusCode = 409
          throw error
        }

        // Create Device records
        for (const dev of devices) {
          const createdDev = await tx.device.create({
            data: {
              productId: product.id,
              purchaseId,
              imei1: dev.imei1.trim(),
              imei2: dev.imei2?.trim() || null,
              serialNumber: dev.serialNumber?.trim() || null,
              color: dev.color || null,
              storage: dev.storage || null,
              purchaseCost: item.unitCost,
              sellingPrice: dev.sellingPrice || product.retailPrice,
              status: 'IN_STOCK',
            },
          })

          // Record Device status history
          await tx.deviceStatusHistory.create({
            data: {
              deviceId: createdDev.id,
              fromStatus: 'IN_STOCK',
              toStatus: 'IN_STOCK',
              changedById: userId,
              reason: `Purchase receipt from ${poNumber}`,
              referenceId: poNumber,
            },
          })
        }
      }

      // Increment inventory quantity by devices count or item.quantity
      const unitsCount = devices.length > 0 ? devices.length : item.quantity
      await tx.inventory.upsert({
        where: { productId_branch: { productId: product.id, branch: 'Colombo Main' } },
        update: { quantity: { increment: unitsCount } },
        create: {
          productId: product.id,
          quantity: unitsCount,
          reorderLevel: 5,
          location: 'Store Floor',
          branch: 'Colombo Main',
        },
      })

      // Record Stock Movement
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'PURCHASE',
          quantity: unitsCount,
          previousQty: 0,
          newQty: unitsCount,
          unitCost: item.unitCost,
          reference: poNumber,
          notes: `Purchase Receipt (GRN): ${unitsCount} serialized units`,
          createdById: userId,
        },
      })
    } else {
      // Non-serialized item (Accessories / Spare parts)
      const currentInv = await tx.inventory.findUnique({
        where: { productId_branch: { productId: product.id, branch: 'Colombo Main' } },
      })
      const previousQty = currentInv?.quantity || 0
      const newQty = previousQty + item.quantity

      await tx.inventory.upsert({
        where: { productId_branch: { productId: product.id, branch: 'Colombo Main' } },
        update: { quantity: { increment: item.quantity } },
        create: {
          productId: product.id,
          quantity: item.quantity,
          reorderLevel: 5,
          location: 'Store Floor',
          branch: 'Colombo Main',
        },
      })

      // Record Stock Movement
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'PURCHASE',
          quantity: item.quantity,
          previousQty,
          newQty,
          unitCost: item.unitCost,
          reference: poNumber,
          notes: `Purchase Receipt (GRN): ${item.quantity} units received`,
          createdById: userId,
        },
      })
    }
  }
}

/**
 * Record Payment against a Purchase Order (Supports Partial Payments)
 */
export async function recordSupplierPayment(purchaseId, paymentData, userId) {
  const { amount, method, transactionRef, notes } = paymentData

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { payments: true },
  })

  if (!purchase) {
    const error = new Error('Purchase order not found.')
    error.statusCode = 404
    throw error
  }

  const currentPaid = Number(purchase.paidAmount) || 0
  const total = Number(purchase.totalAmount)
  const remaining = total - currentPaid

  if (amount > remaining + 0.01) {
    const error = new Error(
      `Payment amount (Rs. ${amount.toLocaleString()}) exceeds the remaining balance (Rs. ${remaining.toLocaleString()}).`
    )
    error.statusCode = 400
    throw error
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create Payment record
    const payment = await tx.payment.create({
      data: {
        purchaseId,
        amount,
        method,
        transactionRef: transactionRef || null,
        notes: notes || null,
        paymentDate: new Date(),
      },
    })

    // 2. Recalculate new total paid
    const newPaidAmount = currentPaid + amount
    let paymentStatus = 'PARTIALLY_PAID'

    if (newPaidAmount >= total - 0.01) {
      paymentStatus = 'PAID'
    } else if (newPaidAmount === 0) {
      paymentStatus = 'UNPAID'
    }

    // 3. Update Purchase header
    const updatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus,
      },
      include: {
        supplier: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    })

    return {
      payment,
      purchase: updatedPurchase,
    }
  })
}

/**
 * Cancel a Purchase Order
 */
export async function cancelPurchaseOrder(purchaseId) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
  })

  if (!purchase) {
    const error = new Error('Purchase order not found.')
    error.statusCode = 404
    throw error
  }

  if (purchase.status === 'RECEIVED') {
    const error = new Error('Cannot cancel a purchase order that has already been received into inventory.')
    error.statusCode = 400
    throw error
  }

  return await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: 'CANCELLED' },
  })
}

