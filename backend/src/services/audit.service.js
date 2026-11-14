import prisma from '../config/prisma.js'

/**
 * Centralized Audit Logger
 */
export async function logAudit({
  action,
  entity,
  entityId,
  details,
  performedById,
  ipAddress,
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: typeof details === 'object' ? JSON.stringify(details) : details ? String(details) : null,
        performedById: performedById || null,
        ipAddress: ipAddress || null,
      },
    })
  } catch (err) {
    // Non-blocking log failure so business operations don't halt
    console.error(`⚠️ Failed to record audit log [${action}]:`, err.message)
    return null
  }
}

/**
 * List audit logs with comprehensive filters
 */
export async function listAuditLogs({
  action,
  entity,
  performedById,
  search,
  startDate,
  endDate,
  page = 1,
  limit = 25,
}) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}

  if (action && action !== 'ALL') {
    where.action = action
  }

  if (entity && entity !== 'ALL') {
    where.entity = entity
  }

  if (performedById && performedById !== 'ALL') {
    where.performedById = performedById
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
      { action: { contains: q } },
      { entity: { contains: q } },
      { details: { contains: q } },
      { performedBy: { name: { contains: q } } },
      { performedBy: { email: { contains: q } } },
    ]
  }

  const [total, items, actionsList] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
    }),
  ])

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / take),
    },
    distinctActions: actionsList.map((a) => a.action),
  }
}

