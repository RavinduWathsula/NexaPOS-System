import prisma from '../config/prisma.js'
import { ApiError } from '../utils/apiError.js'
import { logAudit } from './audit.service.js'

/**
 * 1. Invoice Lookup for Return Eligibility
 */
export async function lookupSaleForReturn(query) {
  if (!query || !query.trim()) {
    throw ApiError.badRequest('Invoice number or sale ID is required')
  }

  const q = query.trim()
  const sale = await prisma.sale.findFirst({
    where: {
      OR: [
        { invoiceNumber: { equals: q } },
        { invoiceNumber: { contains: q } },
        { id: { equals: q } },
      ],
    },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true } },
      payments: true,
      items: {
        include: {
          product: {
            include: { brand: true, category: true },
          },
          devices: {
            include: {
              device: {
                include: { variant: true },
              },
            },
          },
        },
      },
      returns: {
        where: { status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] } },
        include: {
          items: true,
        },
      },
    },
  })

  if (!sale) {
    throw ApiError.notFound(`No sales invoice found matching '${q}'`)
  }

  if (sale.saleStatus === 'CANCELLED') {
    throw ApiError.badRequest('Cannot process returns on a CANCELLED invoice')
  }

  // Calculate return eligibility for each item
  const alreadyReturnedDevices = new Set()
  const returnedQtyByItem = {}

  for (const ret of sale.returns) {
    for (const retItem of ret.items) {
      returnedQtyByItem[retItem.saleItemId] =
        (returnedQtyByItem[retItem.saleItemId] || 0) + retItem.quantity
      if (retItem.deviceId) {
        alreadyReturnedDevices.add(retItem.deviceId)
      }
    }
  }

  const itemsEligibility = sale.items.map((item) => {
    const alreadyReturned = returnedQtyByItem[item.id] || 0
    const availableQuantity = Math.max(0, item.quantity - alreadyReturned)

    // Check individual serialized devices
    const eligibleDevices = (item.devices || [])
      .map((d) => d.device)
      .filter(Boolean)
      .map((dev) => ({
        id: dev.id,
        imei1: dev.imei1,
        imei2: dev.imei2,
        serialNumber: dev.serialNumber,
        status: dev.status,
        isEligible: !alreadyReturnedDevices.has(dev.id),
      }))

    return {
      saleItemId: item.id,
      productId: item.productId,
      productName: item.product?.name,
      variantName: item.variant?.name || null,
      sku: item.product?.sku,
      isSerialized: item.product?.isSerialized || false,
      originalQuantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount || 0),
      totalPrice: Number(item.subtotal ?? item.totalPrice ?? 0),
      alreadyReturnedQuantity: alreadyReturned,
      availableForReturn: availableQuantity,
      eligibleDevices,
    }
  })

  return {
    sale: {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      saleDate: sale.createdAt,
      totalAmount: Number(sale.totalAmount),
      paidAmount: Number(sale.paidAmount),
      paymentStatus: sale.paymentStatus,
      customer: sale.customer,
      cashier: sale.cashier,
      payments: sale.payments,
    },
    items: itemsEligibility,
    totalPriorReturns: sale.returns.length,
  }
}

/**
 * 2. Register a New Return (Mandatory: PENDING approval by default)
 */
export async function createReturn(data, userId) {
  const { saleId, type = 'REFUND', refundMethod = 'CASH', reason, items } = data

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      items: {
        include: {
          devices: true,
        },
      },
      returns: {
        where: { status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] } },
        include: { items: true },
      },
    },
  })

  if (!sale) {
    throw ApiError.notFound('Original sale not found')
  }

  if (sale.saleStatus === 'CANCELLED') {
    throw ApiError.badRequest('Cannot return items from a cancelled sale')
  }

  // Calculate prior returns on each saleItem
  const returnedQtyByItem = {}
  const alreadyReturnedDevices = new Set()
  for (const r of sale.returns) {
    for (const ri of r.items) {
      returnedQtyByItem[ri.saleItemId] = (returnedQtyByItem[ri.saleItemId] || 0) + ri.quantity
      if (ri.deviceId) alreadyReturnedDevices.add(ri.deviceId)
    }
  }

  // Validate each return item
  let calculatedTotalRefund = 0
  const validatedItems = []

  for (const reqItem of items) {
    const saleItem = sale.items.find((si) => si.id === reqItem.saleItemId)
    if (!saleItem) {
      throw ApiError.badRequest(`Item #${reqItem.saleItemId} does not belong to this invoice`)
    }

    const priorReturned = returnedQtyByItem[saleItem.id] || 0
    const maxReturnable = saleItem.quantity - priorReturned

    if (reqItem.quantity > maxReturnable) {
      throw ApiError.badRequest(
        `Cannot return ${reqItem.quantity} units for item "${saleItem.id}". Eligible quantity is ${maxReturnable}.`
      )
    }

    // If serialized device specified, validate it was sold on this line item
    if (reqItem.deviceId) {
      const soldDeviceIds = saleItem.devices.map((d) => d.deviceId)
      if (!soldDeviceIds.includes(reqItem.deviceId)) {
        throw ApiError.badRequest(
          `Device ID ${reqItem.deviceId} was not sold as part of this line item.`
        )
      }
      if (alreadyReturnedDevices.has(reqItem.deviceId)) {
        throw ApiError.badRequest(
          `Device ID ${reqItem.deviceId} has already been returned previously.`
        )
      }
    }

    calculatedTotalRefund += Number(reqItem.refundAmount)
    validatedItems.push({
      saleItemId: reqItem.saleItemId,
      deviceId: reqItem.deviceId || null,
      quantity: reqItem.quantity,
      refundAmount: reqItem.refundAmount,
      condition: reqItem.condition || 'RESELLABLE',
    })
  }

  // Generate return number
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const returnNumber = `RET-${dateStr}-${randomSuffix}`

  return prisma.$transaction(async (tx) => {
    const returnRecord = await tx.return.create({
      data: {
        returnNumber,
        saleId,
        customerId: sale.customerId || null,
        type,
        status: 'PENDING', // Requires authorized manager approval
        totalRefund: calculatedTotalRefund,
        reason: reason.trim(),
        refundMethod,
        createdById: userId,
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    // If serialized devices were returned, set them to RETURNED quarantine status awaiting inspection
    for (const vItem of validatedItems) {
      if (vItem.deviceId) {
        await tx.device.update({
          where: { id: vItem.deviceId },
          data: { status: 'RETURNED' },
        })

        await tx.deviceStatusHistory.create({
          data: {
            deviceId: vItem.deviceId,
            fromStatus: 'SOLD',
            toStatus: 'RETURNED',
            reason: `Returned on ticket #${returnNumber}. Condition: ${vItem.condition}`,
            referenceId: returnRecord.id,
            changedById: userId,
          },
        })
      }
    }

    await logAudit({
      action: 'CREATE_RETURN',
      entity: 'Return',
      entityId: returnRecord.id,
      performedById: userId,
      details: {
        returnNumber,
        invoiceNumber: sale.invoiceNumber,
        totalRefund: calculatedTotalRefund,
        itemsCount: validatedItems.length,
      },
    })

    return returnRecord
  })
}

/**
 * 3. Authorize & Approve Return (Manager / Admin Approval)
 * Inspects device condition and restocks sellable inventory
 */
export async function approveReturn(returnId, { restockSellable = true, inspectionNotes }, userId) {
  const returnRecord = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      sale: true,
      items: {
        include: {
          saleItem: {
            include: { product: { include: { inventory: true } } },
          },
          device: true,
        },
      },
    },
  })

  if (!returnRecord) {
    throw ApiError.notFound('Return ticket not found')
  }

  if (returnRecord.status !== 'PENDING') {
    throw ApiError.badRequest(`Cannot approve return with status '${returnRecord.status}'`)
  }

  return prisma.$transaction(async (tx) => {
    for (const item of returnRecord.items) {
      const product = item.saleItem.product
      const isResellable = item.condition === 'RESELLABLE'

      // Restocking non-serialized items
      if (!product.isSerialized && restockSellable && isResellable) {
        const invRecord = product.inventory?.[0]
        if (invRecord) {
          const newQty = invRecord.quantity + item.quantity
          await tx.inventory.update({
            where: { id: invRecord.id },
            data: { quantity: newQty },
          })

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: 'RETURN',
              quantity: item.quantity,
              previousQty: invRecord.quantity,
              newQty,
              unitCost: item.saleItem.unitCost,
              reference: `RET-${returnRecord.returnNumber}`,
              notes: `Customer return restocked into inventory`,
              createdById: userId,
            },
          })
        }

        await tx.returnItem.update({
          where: { id: item.id },
          data: { isRestocked: true, restockedAt: new Date() },
        })
      }

      // Restocking or marking serialized devices
      if (item.deviceId) {
        if (restockSellable && isResellable) {
          await tx.device.update({
            where: { id: item.deviceId },
            data: { status: 'IN_STOCK' },
          })

          await tx.deviceStatusHistory.create({
            data: {
              deviceId: item.deviceId,
              fromStatus: 'RETURNED',
              toStatus: 'IN_STOCK',
              reason: `Device inspected and marked RESELLABLE under return #${returnRecord.returnNumber}`,
              referenceId: returnRecord.id,
              changedById: userId,
            },
          })

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: 'RETURN',
              quantity: 1,
              previousQty: 0,
              newQty: 1,
              unitCost: item.saleItem.unitCost,
              reference: `RET-${returnRecord.returnNumber}`,
              notes: `Returned serialized device (IMEI: ${item.device?.imei1}) restocked to inventory`,
              createdById: userId,
            },
          })

          await tx.returnItem.update({
            where: { id: item.id },
            data: { isRestocked: true, restockedAt: new Date() },
          })
        } else {
          // Defective or damaged device
          await tx.device.update({
            where: { id: item.deviceId },
            data: { status: 'DAMAGED' },
          })

          await tx.deviceStatusHistory.create({
            data: {
              deviceId: item.deviceId,
              fromStatus: 'RETURNED',
              toStatus: 'DAMAGED',
              reason: `Device inspected: Condition is ${item.condition}. Moved to quarantine/damaged.`,
              referenceId: returnRecord.id,
              changedById: userId,
            },
          })
        }
      }
    }

    // Update return status to COMPLETED
    const updatedReturn = await tx.return.update({
      where: { id: returnId },
      data: {
        status: 'COMPLETED',
        approvedById: userId,
        approvedAt: new Date(),
        inspectionNotes: inspectionNotes?.trim() || 'Return inspected and authorized by store manager',
      },
      include: {
        items: true,
        customer: true,
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    })

    await logAudit({
      action: 'APPROVE_RETURN',
      entity: 'Return',
      entityId: returnRecord.id,
      performedById: userId,
      details: {
        returnNumber: returnRecord.returnNumber,
        totalRefund: returnRecord.totalRefund,
        inspectionNotes,
      },
    })

    return updatedReturn
  })
}

/**
 * 4. Reject Return
 */
export async function rejectReturn(returnId, { rejectionReason }, userId) {
  const returnRecord = await prisma.return.findUnique({
    where: { id: returnId },
    include: { items: true },
  })

  if (!returnRecord) {
    throw ApiError.notFound('Return ticket not found')
  }

  if (returnRecord.status !== 'PENDING') {
    throw ApiError.badRequest(`Cannot reject return with status '${returnRecord.status}'`)
  }

  return prisma.$transaction(async (tx) => {
    // If serialized devices were set to RETURNED, revert to SOLD
    for (const item of returnRecord.items) {
      if (item.deviceId) {
        await tx.device.update({
          where: { id: item.deviceId },
          data: { status: 'SOLD' },
        })

        await tx.deviceStatusHistory.create({
          data: {
            deviceId: item.deviceId,
            fromStatus: 'RETURNED',
            toStatus: 'SOLD',
            reason: `Return rejected: ${rejectionReason}`,
            referenceId: returnRecord.id,
            changedById: userId,
          },
        })
      }
    }

    const updated = await tx.return.update({
      where: { id: returnId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        customer: true,
        approvedBy: { select: { id: true, name: true } },
      },
    })

    await logAudit({
      action: 'REJECT_RETURN',
      entity: 'Return',
      entityId: returnId,
      performedById: userId,
      details: { returnNumber: returnRecord.returnNumber, rejectionReason },
    })

    return updated
  })
}

/**
 * 5. List Returns with Filters
 */
export async function listReturns({ status, search, startDate, endDate, page = 1, limit = 20 }) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      const s = new Date(startDate)
      s.setHours(0, 0, 0, 0)
      where.createdAt.gte = s
    }
    if (endDate) {
      const e = new Date(endDate)
      e.setHours(23, 59, 59, 999)
      where.createdAt.lte = e
    }
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { returnNumber: { contains: q } },
      { sale: { invoiceNumber: { contains: q } } },
      { customer: { name: { contains: q } } },
      { customer: { phone: { contains: q } } },
    ]
  }

  const [total, items, statusCounts] = await Promise.all([
    prisma.return.count({ where }),
    prisma.return.findMany({
      where,
      skip,
      take,
      include: {
        customer: true,
        sale: { select: { id: true, invoiceNumber: true, totalAmount: true } },
        approvedBy: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            saleItem: { include: { product: true } },
            device: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.return.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])

  const countsMap = statusCounts.reduce((acc, c) => {
    acc[c.status] = c._count.status
    return acc
  }, {})

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / take),
    },
    metrics: {
      total,
      pending: countsMap.PENDING || 0,
      approved: countsMap.APPROVED || 0,
      completed: countsMap.COMPLETED || 0,
      rejected: countsMap.REJECTED || 0,
    },
  }
}

/**
 * 6. Get Return Details by ID
 */
export async function getReturnById(id) {
  const returnRecord = await prisma.return.findUnique({
    where: { id },
    include: {
      customer: true,
      sale: {
        include: {
          cashier: { select: { id: true, name: true } },
          payments: true,
        },
      },
      approvedBy: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          saleItem: { include: { product: { include: { brand: true } } } },
          device: true,
        },
      },
    },
  })

  if (!returnRecord) {
    throw ApiError.notFound('Return record not found')
  }

  return returnRecord
}
