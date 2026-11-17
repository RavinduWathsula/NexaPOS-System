import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * List Trade-Ins with filters, metrics, and pagination
 */
export async function listTradeIns(filters = {}) {
  const {
    search,
    status,
    conditionGrade,
    startDate,
    endDate,
    page = 1,
    limit = 15,
  } = filters

  const where = {}

  if (search && search.trim()) {
    const term = search.trim()
    where.OR = [
      { tradeInNumber: { contains: term } },
      { brand: { contains: term } },
      { modelName: { contains: term } },
      { imei1: { contains: term } },
      { customer: { name: { contains: term } } },
      { customer: { phone: { contains: term } } },
    ]
  }

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (conditionGrade && conditionGrade !== 'ALL') {
    where.conditionGrade = conditionGrade
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) {
      const eDate = new Date(endDate)
      eDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = eDate
    }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, items, metricsAggregate, inStockCount, resoldCount] = await Promise.all([
    prisma.tradeIn.count({ where }),
    prisma.tradeIn.findMany({
      where,
      skip,
      take,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true, nic: true },
        },
        cashier: {
          select: { id: true, name: true, email: true },
        },
        sale: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            createdAt: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tradeIn.aggregate({
      where,
      _sum: { tradeInValue: true, resalePrice: true },
      _count: true,
    }),
    prisma.tradeIn.count({
      where: {
        status: { in: ['RECEIVED', 'INSPECTED', 'REFURBISHING', 'READY_FOR_RESALE'] },
      },
    }),
    prisma.tradeIn.count({
      where: {
        status: 'RESOLD',
      },
    }),
  ])

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take) || 1,
    },
    metrics: {
      totalTradeIns: metricsAggregate._count || 0,
      totalAllowanceValue: Number(metricsAggregate._sum.tradeInValue || 0),
      totalResaleValue: Number(metricsAggregate._sum.resalePrice || 0),
      inStockCount,
      resoldCount,
    },
  }
}

/**
 * Get single Trade-In by ID
 */
export async function getTradeInById(id) {
  const item = await prisma.tradeIn.findUnique({
    where: { id },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true, email: true } },
      sale: {
        include: {
          items: {
            include: {
              product: { select: { name: true, sku: true } },
            },
          },
          payments: true,
        },
      },
    },
  })

  if (!item) {
    const error = new Error('Trade-in record not found.')
    error.statusCode = 404
    throw error
  }

  return item
}

/**
 * Update Trade-In status, resale price, or notes
 */
export async function updateTradeInStatus(id, updateData, userId) {
  const existing = await prisma.tradeIn.findUnique({
    where: { id },
  })

  if (!existing) {
    const error = new Error('Trade-in record not found.')
    error.statusCode = 404
    throw error
  }

  const { status, resalePrice, notes } = updateData

  const data = {}
  if (status !== undefined) data.status = status
  if (resalePrice !== undefined) data.resalePrice = resalePrice ? Number(resalePrice) : null
  if (notes !== undefined) data.notes = notes

  const updated = await prisma.tradeIn.update({
    where: { id },
    data,
    include: {
      customer: true,
      cashier: { select: { id: true, name: true, email: true } },
      sale: { select: { id: true, invoiceNumber: true } },
    },
  })

  return updated
}
