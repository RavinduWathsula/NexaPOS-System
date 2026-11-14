import prisma from '../config/prisma.js'
import { ApiError } from '../utils/apiError.js'

/**
 * Sync expired warranties
 */
async function syncWarrantyExpiry() {
  const now = new Date()
  await prisma.warranty.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    data: {
      status: 'EXPIRED',
    },
  })
}

/**
 * List warranties with search and filter
 */
export async function listWarranties({ search, status, customerId, page = 1, limit = 20 }) {
  await syncWarrantyExpiry()

  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}

  if (customerId) {
    where.customerId = customerId
  }

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { warrantyCode: { contains: q } },
      { customer: { name: { contains: q } } },
      { customer: { phone: { contains: q } } },
      { device: { imei1: { contains: q } } },
      { device: { imei2: { contains: q } } },
      { device: { serialNumber: { contains: q } } },
      { sale: { invoiceNumber: { contains: q } } },
    ]
  }

  const [total, items, activeCount, expiredCount, claimedCount] = await Promise.all([
    prisma.warranty.count({ where }),
    prisma.warranty.findMany({
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
        device: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            variant: true,
          },
        },
        sale: {
          select: {
            id: true,
            invoiceNumber: true,
            saleDate: true,
            totalAmount: true,
          },
        },
        claims: {
          orderBy: { claimDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.warranty.count({ where: { status: 'ACTIVE' } }),
    prisma.warranty.count({ where: { status: 'EXPIRED' } }),
    prisma.warranty.count({ where: { status: 'CLAIMED' } }),
  ])

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / take),
    },
    summary: {
      total,
      active: activeCount,
      expired: expiredCount,
      claimed: claimedCount,
    },
  }
}

/**
 * Fast Lookup by IMEI, Serial, Invoice Number, or Warranty Code
 */
export async function lookupWarranty(query) {
  if (!query || !query.trim()) {
    throw ApiError.badRequest('Query term (IMEI, Serial, Invoice, or Warranty Code) is required')
  }

  await syncWarrantyExpiry()
  const q = query.trim()

  const warranties = await prisma.warranty.findMany({
    where: {
      OR: [
        { warrantyCode: { equals: q } },
        { warrantyCode: { contains: q } },
        { device: { imei1: { equals: q } } },
        { device: { imei2: { equals: q } } },
        { device: { serialNumber: { equals: q } } },
        { sale: { invoiceNumber: { equals: q } } },
        { customer: { phone: { equals: q } } },
      ],
    },
    include: {
      customer: true,
      device: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
          variant: true,
        },
      },
      sale: {
        include: {
          items: true,
          payments: true,
        },
      },
      claims: {
        orderBy: { claimDate: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return warranties
}

/**
 * Get warranty by ID
 */
export async function getWarrantyById(id) {
  await syncWarrantyExpiry()

  const warranty = await prisma.warranty.findUnique({
    where: { id },
    include: {
      customer: true,
      device: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
          variant: true,
        },
      },
      sale: {
        include: {
          items: true,
          payments: true,
        },
      },
      claims: {
        orderBy: { claimDate: 'desc' },
      },
    },
  })

  if (!warranty) {
    throw ApiError.notFound('Warranty not found')
  }

  // Also fetch any repairs done on this device or customer
  let relatedRepairs = []
  if (warranty.device?.imei1 || warranty.customerId) {
    relatedRepairs = await prisma.repairJob.findMany({
      where: {
        OR: [
          warranty.device?.imei1 ? { imei: warranty.device.imei1 } : undefined,
          warranty.customerId ? { customerId: warranty.customerId } : undefined,
        ].filter(Boolean),
      },
      take: 10,
      orderBy: { receivedAt: 'desc' },
      include: {
        technician: {
          select: { id: true, name: true },
        },
      },
    })
  }

  return {
    ...warranty,
    relatedRepairs,
  }
}

/**
 * Create a new warranty claim (Mandatory rule: PENDING by default, never auto-approved)
 */
export async function createWarrantyClaim({ warrantyId, issueReported }) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
    include: { customer: true, device: true },
  })

  if (!warranty) {
    throw ApiError.notFound('Warranty not found')
  }

  if (warranty.status === 'VOIDED') {
    throw ApiError.badRequest('Cannot file a claim on a VOIDED warranty')
  }

  const claim = await prisma.warrantyClaim.create({
    data: {
      warrantyId,
      issueReported,
      status: 'PENDING', // NEVER AUTO-APPROVED
    },
  })

  // Update warranty status to CLAIMED
  await prisma.warranty.update({
    where: { id: warrantyId },
    data: { status: 'CLAIMED' },
  })

  return claim
}

/**
 * Review warranty claim (Super Admin / Manager authorized review)
 */
export async function reviewWarrantyClaim(claimId, { status, resolutionNotes, createRepairJob = false, technicianId, estimatedCost = 0 }) {
  const claim = await prisma.warrantyClaim.findUnique({
    where: { id: claimId },
    include: {
      warranty: {
        include: {
          customer: true,
          device: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
    },
  })

  if (!claim) {
    throw ApiError.notFound('Warranty claim not found')
  }

  let repairJob = null

  // If approved and requested to create repair job
  if (status === 'APPROVED' && createRepairJob) {
    const customerId = claim.warranty.customerId
    if (!customerId) {
      throw ApiError.badRequest('Cannot create repair job without an associated customer')
    }

    const deviceModel =
      claim.warranty.device?.product?.name ||
      claim.warranty.device?.variant?.name ||
      'Customer Device'
    const imei = claim.warranty.device?.imei1 || null
    const serialNumber = claim.warranty.device?.serialNumber || null

    const ticketNumber = `REP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`

    repairJob = await prisma.repairJob.create({
      data: {
        ticketNumber,
        customerId,
        technicianId: technicianId || null,
        deviceModel,
        imei,
        serialNumber,
        physicalCondition: 'Intact / Under Warranty',
        accessoriesReceived: 'Handset Only',
        issueDescription: `[Warranty Claim Approved] ${claim.issueReported}`,
        diagnosis: `Warranty Claim #${claim.id}: ${resolutionNotes}`,
        estimatedCost: estimatedCost || 0,
        laborCost: 0,
        advancePaid: 0,
        status: 'RECEIVED',
        priority: 'HIGH',
        warrantyClaimId: claim.id,
      },
    })
  }

  // Update claim
  const updatedClaim = await prisma.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status,
      resolutionNotes,
      resolvedAt: new Date(),
    },
  })

  return {
    claim: updatedClaim,
    repairJob,
  }
}

/**
 * Create manual warranty (optional)
 */
export async function createWarranty({ deviceId, customerId, saleId, durationMonths, terms }) {
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + durationMonths)

  const warrantyCode = `WAR-${Date.now().toString().slice(-7)}-${Math.floor(100 + Math.random() * 900)}`

  return prisma.warranty.create({
    data: {
      warrantyCode,
      deviceId: deviceId || null,
      customerId: customerId || null,
      saleId: saleId || null,
      startDate,
      endDate,
      terms: terms || `${durationMonths} Months NexaPOS Extended Hardware Warranty`,
      status: 'ACTIVE',
    },
    include: {
      customer: true,
      device: true,
    },
  })
}
