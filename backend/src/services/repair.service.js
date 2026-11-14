import prisma from '../config/prisma.js'
import { ApiError } from '../utils/apiError.js'

/**
 * List repair jobs with filters, pagination, and status metrics
 */
export async function listRepairs({
  search,
  status,
  technicianId,
  customerId,
  priority,
  page = 1,
  limit = 20,
}) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (technicianId && technicianId !== 'ALL') {
    where.technicianId = technicianId
  }

  if (customerId) {
    where.customerId = customerId
  }

  if (priority && priority !== 'ALL') {
    where.priority = priority
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { ticketNumber: { contains: q } },
      { deviceModel: { contains: q } },
      { imei: { contains: q } },
      { serialNumber: { contains: q } },
      { customer: { name: { contains: q } } },
      { customer: { phone: { contains: q } } },
    ]
  }

  const [total, items, statusCounts] = await Promise.all([
    prisma.repairJob.count({ where }),
    prisma.repairJob.findMany({
      where,
      skip,
      take,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parts: true,
        payments: true,
      },
      orderBy: { receivedAt: 'desc' },
    }),
    prisma.repairJob.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])

  const countsMap = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status
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
      total: await prisma.repairJob.count(),
      received: countsMap.RECEIVED || 0,
      diagnosing: countsMap.DIAGNOSING || 0,
      waitingForParts: countsMap.WAITING_FOR_PARTS || 0,
      repairing: (countsMap.REPAIRING || 0) + (countsMap.IN_PROGRESS || 0),
      readyForPickup: countsMap.READY_FOR_PICKUP || 0,
      completed: countsMap.COMPLETED || 0,
      delivered: countsMap.DELIVERED || 0,
      cancelled: countsMap.CANCELLED || 0,
    },
  }
}

/**
 * Get repair job by ID with full details
 */
export async function getRepairById(id) {
  const repair = await prisma.repairJob.findUnique({
    where: { id },
    include: {
      customer: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      parts: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
  })

  if (!repair) {
    throw ApiError.notFound('Repair job not found')
  }

  // Calculate balance due
  const totalPartsCost = repair.parts.reduce(
    (sum, p) => sum + Number(p.unitPrice) * p.quantity,
    0
  )
  const currentFinalCost =
    repair.finalCost !== null
      ? Number(repair.finalCost)
      : Number(repair.laborCost || 0) + totalPartsCost

  const totalPayments = repair.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )
  const balanceDue = Math.max(0, currentFinalCost - totalPayments)

  return {
    ...repair,
    calculated: {
      partsTotal: totalPartsCost,
      finalCost: currentFinalCost,
      totalPaid: totalPayments,
      balanceDue,
    },
  }
}

/**
 * Create a new repair ticket
 */
export async function createRepairTicket(data, userId) {
  const {
    customerId,
    deviceModel,
    imei,
    serialNumber,
    passcode,
    physicalCondition,
    accessoriesReceived,
    issueDescription,
    technicianId,
    priority = 'NORMAL',
    estimatedCost = 0,
    advancePaid = 0,
    advancePaymentMethod = 'CASH',
    expectedCompletionDate,
    warrantyClaimId,
  } = data

  // Validate customer
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })
  if (!customer) {
    throw ApiError.badRequest('Valid customer is required')
  }

  // Generate unique ticket number
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const ticketNumber = `REP-${dateStr}-${randomSuffix}`

  return prisma.$transaction(async (tx) => {
    const repairJob = await tx.repairJob.create({
      data: {
        ticketNumber,
        customerId,
        technicianId: technicianId || null,
        deviceModel,
        imei: imei?.trim() || null,
        serialNumber: serialNumber?.trim() || null,
        passcode: passcode?.trim() || null,
        physicalCondition: physicalCondition?.trim() || 'No visible damage noted',
        accessoriesReceived: accessoriesReceived?.trim() || 'Device only',
        issueDescription: issueDescription.trim(),
        priority,
        estimatedCost,
        laborCost: 0,
        advancePaid: advancePaid > 0 ? advancePaid : 0,
        status: 'RECEIVED',
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
        warrantyClaimId: warrantyClaimId || null,
      },
      include: {
        customer: true,
        technician: true,
      },
    })

    // If advance paid, record as an initial payment
    if (advancePaid > 0) {
      await tx.payment.create({
        data: {
          repairJobId: repairJob.id,
          amount: advancePaid,
          method: advancePaymentMethod,
          notes: `Advance deposit for ticket #${ticketNumber}`,
        },
      })
    }

    // Record audit log
    if (userId) {
      await tx.auditLog.create({
        data: {
          performedById: userId,
          action: 'CREATE_REPAIR_TICKET',
          entity: 'RepairJob',
          entityId: repairJob.id,
          details: JSON.stringify({ ticketNumber, customerId, deviceModel, estimatedCost, advancePaid }),
        },
      })
    }

    return repairJob
  })
}

/**
 * Update repair status and workshop notes
 */
export async function updateRepairStatus(id, data, userId) {
  const { status, diagnosis, serviceNotes, technicianId } = data

  const existing = await prisma.repairJob.findUnique({
    where: { id },
  })
  if (!existing) {
    throw ApiError.notFound('Repair job not found')
  }

  const updateData = {}

  if (status) {
    updateData.status = status
    if (status === 'COMPLETED' && !existing.completedAt) {
      updateData.completedAt = new Date()
    }
    if (status === 'DELIVERED' && !existing.deliveredAt) {
      updateData.deliveredAt = new Date()
      if (!existing.completedAt) {
        updateData.completedAt = new Date()
      }
    }
  }

  if (diagnosis !== undefined) {
    updateData.diagnosis = diagnosis
  }

  if (serviceNotes !== undefined) {
    updateData.serviceNotes = serviceNotes
  }

  if (technicianId !== undefined) {
    updateData.technicianId = technicianId || null
  }

  const updated = await prisma.repairJob.update({
    where: { id },
    data: updateData,
    include: {
      customer: true,
      technician: {
        select: { id: true, name: true, email: true },
      },
      parts: true,
      payments: true,
    },
  })

  if (userId) {
    await prisma.auditLog.create({
      data: {
        performedById: userId,
        action: 'UPDATE_REPAIR_STATUS',
        entity: 'RepairJob',
        entityId: id,
        details: JSON.stringify({
          oldStatus: existing.status,
          newStatus: updated.status,
          technicianId: updated.technicianId,
        }),
      },
    })
  }

  return updated
}

/**
 * Add a spare part to a repair job with inventory deduction
 */
export async function addSparePart(repairJobId, partData, userId) {
  const { productId, partName, quantity = 1, unitCost = 0, unitPrice } = partData

  const repairJob = await prisma.repairJob.findUnique({
    where: { id: repairJobId },
    include: { parts: true },
  })
  if (!repairJob) {
    throw ApiError.notFound('Repair job not found')
  }

  return prisma.$transaction(async (tx) => {
    let resolvedPartName = partName
    let resolvedUnitCost = unitCost

    // If an inventory product is selected, check stock and deduct
    if (productId) {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { inventory: true },
      })

      if (!product) {
        throw ApiError.badRequest('Inventory part product not found')
      }

      resolvedPartName = partName || product.name

      // Check inventory
      const invRecord = product.inventory?.[0]
      const currentStock = invRecord?.quantity || 0
      if (currentStock < quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.name}". Available: ${currentStock}, required: ${quantity}`
        )
      }

      // Deduct inventory
      const updatedInv = await tx.inventory.update({
        where: { id: invRecord.id },
        data: { quantity: currentStock - quantity },
      })

      // Record stock movement
      await tx.stockMovement.create({
        data: {
          productId,
          type: 'REPAIR_CONSUMPTION',
          quantity: -quantity,
          previousQty: currentStock,
          newQty: updatedInv.quantity,
          unitCost: unitCost || 0,
          reference: `TICKET-${repairJob.ticketNumber}`,
          notes: `Part consumption for repair #${repairJob.ticketNumber}`,
          createdById: userId,
        },
      })
    }

    // Create RepairPart record
    const createdPart = await tx.repairPart.create({
      data: {
        repairJobId,
        productId: productId || null,
        partName: resolvedPartName,
        quantity,
        unitCost: resolvedUnitCost,
        unitPrice,
      },
    })

    // Update repair finalCost
    const allParts = await tx.repairPart.findMany({
      where: { repairJobId },
    })
    const totalPartsCost = allParts.reduce(
      (sum, p) => sum + Number(p.unitPrice) * p.quantity,
      0
    )
    const newFinalCost = Number(repairJob.laborCost || 0) + totalPartsCost

    await tx.repairJob.update({
      where: { id: repairJobId },
      data: {
        finalCost: newFinalCost,
      },
    })

    return createdPart
  })
}

/**
 * Remove a spare part and restore inventory if linked
 */
export async function removeSparePart(partId, userId) {
  const part = await prisma.repairPart.findUnique({
    where: { id: partId },
    include: {
      repairJob: true,
      product: { include: { inventory: true } },
    },
  })

  if (!part) {
    throw ApiError.notFound('Repair part not found')
  }

  const { repairJobId, productId, quantity, repairJob } = part

  return prisma.$transaction(async (tx) => {
    // If product was tracked in inventory, restore stock
    const invRecord = part.product?.inventory?.[0]
    if (productId && invRecord) {
      const currentStock = invRecord.quantity
      const updatedInv = await tx.inventory.update({
        where: { id: invRecord.id },
        data: { quantity: currentStock + quantity },
      })

      await tx.stockMovement.create({
        data: {
          productId,
          type: 'ADJUSTMENT',
          quantity: quantity,
          previousQty: currentStock,
          newQty: updatedInv.quantity,
          unitCost: part.unitCost,
          reference: `TICKET-${repairJob.ticketNumber}`,
          notes: `Returned part from repair #${repairJob.ticketNumber}`,
          createdById: userId,
        },
      })
    }

    // Delete part
    await tx.repairPart.delete({
      where: { id: partId },
    })

    // Recalculate final cost
    const remainingParts = await tx.repairPart.findMany({
      where: { repairJobId },
    })
    const totalPartsCost = remainingParts.reduce(
      (sum, p) => sum + Number(p.unitPrice) * p.quantity,
      0
    )
    const newFinalCost = Number(repairJob.laborCost || 0) + totalPartsCost

    await tx.repairJob.update({
      where: { id: repairJobId },
      data: { finalCost: newFinalCost },
    })

    return { message: 'Part removed and inventory updated successfully' }
  })
}

/**
 * Complete repair job with labor cost and final diagnosis
 */
export async function completeRepair(id, data, userId) {
  const { laborCost = 0, finalCost, diagnosis, serviceNotes } = data

  const repairJob = await prisma.repairJob.findUnique({
    where: { id },
    include: { parts: true },
  })

  if (!repairJob) {
    throw ApiError.notFound('Repair job not found')
  }

  const partsTotal = repairJob.parts.reduce(
    (sum, p) => sum + Number(p.unitPrice) * p.quantity,
    0
  )
  const computedFinalCost = finalCost !== undefined ? finalCost : Number(laborCost) + partsTotal

  const updated = await prisma.repairJob.update({
    where: { id },
    data: {
      status: 'READY_FOR_PICKUP',
      laborCost,
      finalCost: computedFinalCost,
      diagnosis: diagnosis !== undefined ? diagnosis : repairJob.diagnosis,
      serviceNotes: serviceNotes !== undefined ? serviceNotes : repairJob.serviceNotes,
      completedAt: new Date(),
    },
    include: {
      customer: true,
      technician: true,
      parts: true,
      payments: true,
    },
  })

  if (userId) {
    await prisma.auditLog.create({
      data: {
        performedById: userId,
        action: 'COMPLETE_REPAIR',
        entity: 'RepairJob',
        entityId: id,
        details: JSON.stringify({ laborCost, finalCost: computedFinalCost, status: 'READY_FOR_PICKUP' }),
      },
    })
  }

  return updated
}

/**
 * Record a payment on a repair job (e.g. final balance settlement or partial payment)
 */
export async function recordRepairPayment(repairJobId, paymentData, userId) {
  const { amount, method, transactionRef, notes } = paymentData

  const repair = await prisma.repairJob.findUnique({
    where: { id: repairJobId },
    include: {
      payments: true,
      parts: true,
    },
  })

  if (!repair) {
    throw ApiError.notFound('Repair job not found')
  }

  const partsTotal = repair.parts.reduce(
    (sum, p) => sum + Number(p.unitPrice) * p.quantity,
    0
  )
  const finalCost =
    repair.finalCost !== null
      ? Number(repair.finalCost)
      : Number(repair.laborCost || 0) + partsTotal

  const totalPaidBefore = repair.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )
  const remainingDue = Math.max(0, finalCost - totalPaidBefore)

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        repairJobId,
        amount,
        method,
        transactionRef: transactionRef || null,
        notes: notes || `Payment for repair #${repair.ticketNumber}`,
      },
    })

    const newTotalPaid = totalPaidBefore + Number(amount)
    const isFullyPaid = newTotalPaid >= finalCost

    // If fully paid and ready for pickup/completed, we can transition to DELIVERED or mark deliveredAt
    let statusUpdate = {}
    if (isFullyPaid && (repair.status === 'READY_FOR_PICKUP' || repair.status === 'COMPLETED')) {
      statusUpdate = {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      }
    }

    const updatedJob = await tx.repairJob.update({
      where: { id: repairJobId },
      data: statusUpdate,
      include: {
        customer: true,
        technician: true,
        parts: true,
        payments: true,
      },
    })

    return {
      payment,
      repairJob: updatedJob,
      remainingDue: Math.max(0, finalCost - newTotalPaid),
      isFullyPaid,
    }
  })
}

/**
 * Get technician's assigned repairs
 */
export async function getTechnicianRepairs(technicianId, filters = {}) {
  return listRepairs({ ...filters, technicianId })
}
