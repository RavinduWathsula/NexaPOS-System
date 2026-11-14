import prisma from '../config/prisma.js'
import { ApiError } from '../utils/apiError.js'

/**
 * Get the currently active OPEN cash session for a cashier
 */
export async function getCurrentSession(userId) {
  const session = await prisma.cashSession.findFirst({
    where: {
      cashierId: userId,
      status: 'OPEN',
    },
    include: {
      cashier: { select: { id: true, name: true, email: true } },
      sales: {
        include: {
          payments: true,
        },
      },
    },
    orderBy: { openedAt: 'desc' },
  })

  if (!session) {
    return null
  }

  // Calculate live cash sales
  let cashSales = 0
  for (const sale of session.sales) {
    if (sale.saleStatus !== 'CANCELLED') {
      for (const pmt of sale.payments) {
        if (pmt.method === 'CASH') {
          cashSales += Number(pmt.amount)
        }
      }
    }
  }

  // Calculate cash refunds during session period
  const returns = await prisma.return.findMany({
    where: {
      createdAt: { gte: session.openedAt },
      refundMethod: 'CASH',
    },
  })
  const cashRefunds = returns.reduce((sum, r) => sum + Number(r.totalRefund), 0)

  const openingFloat = Number(session.openingBalance)
  const expectedClosingBalance = openingFloat + cashSales - cashRefunds

  return {
    ...session,
    metrics: {
      openingFloat,
      cashSales,
      cashRefunds,
      expectedClosingBalance,
      transactionsCount: session.sales.length,
    },
  }
}

/**
 * Open a new cash drawer session
 */
export async function openSession({ openingBalance = 0, notes }, userId) {
  const existing = await prisma.cashSession.findFirst({
    where: {
      cashierId: userId,
      status: 'OPEN',
    },
  })

  if (existing) {
    throw ApiError.badRequest('You already have an active open cash session. Please close it before opening a new one.')
  }

  const session = await prisma.cashSession.create({
    data: {
      cashierId: userId,
      openingBalance: Number(openingBalance),
      status: 'OPEN',
      notes: notes?.trim() || null,
      openedAt: new Date(),
    },
    include: {
      cashier: { select: { id: true, name: true, email: true } },
    },
  })

  await prisma.auditLog.create({
    data: {
      performedById: userId,
      action: 'OPEN_CASH_SESSION',
      entity: 'CashSession',
      entityId: session.id,
      details: JSON.stringify({ openingBalance, notes }),
    },
  })

  return session
}

/**
 * Close and reconcile an active cash session
 */
export async function closeSession(sessionId, { closingBalance, notes }, userId) {
  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
    include: {
      sales: {
        include: {
          payments: true,
        },
      },
    },
  })

  if (!session) {
    throw ApiError.notFound('Cash session not found')
  }

  if (session.status === 'CLOSED') {
    throw ApiError.badRequest('This cash session has already been closed and reconciled')
  }

  // Calculate total cash sales in this session
  let cashSales = 0
  for (const sale of session.sales) {
    if (sale.saleStatus !== 'CANCELLED') {
      for (const pmt of sale.payments) {
        if (pmt.method === 'CASH') {
          cashSales += Number(pmt.amount)
        }
      }
    }
  }

  // Calculate cash refunds
  const returns = await prisma.return.findMany({
    where: {
      createdAt: { gte: session.openedAt },
      refundMethod: 'CASH',
    },
  })
  const cashRefunds = returns.reduce((sum, r) => sum + Number(r.totalRefund), 0)

  const openingFloat = Number(session.openingBalance)
  const actualClosing = Number(closingBalance)
  const expectedBalance = openingFloat + cashSales - cashRefunds
  const difference = actualClosing - expectedBalance // negative: shortage, positive: surplus

  const closed = await prisma.cashSession.update({
    where: { id: sessionId },
    data: {
      status: 'CLOSED',
      closingBalance: actualClosing,
      expectedBalance,
      difference,
      closedAt: new Date(),
      notes: notes !== undefined ? notes?.trim() || null : session.notes,
    },
    include: {
      cashier: { select: { id: true, name: true, email: true } },
    },
  })

  await prisma.auditLog.create({
    data: {
      performedById: userId,
      action: 'CLOSE_CASH_SESSION',
      entity: 'CashSession',
      entityId: session.id,
      details: JSON.stringify({
        openingBalance: openingFloat,
        cashSales,
        cashRefunds,
        expectedBalance,
        actualClosing,
        difference,
      }),
    },
  })

  return {
    ...closed,
    reconciliation: {
      openingFloat,
      cashSales,
      cashRefunds,
      expectedBalance,
      actualClosing,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
      isShortage: difference < -0.01,
      isSurplus: difference > 0.01,
    },
  }
}

/**
 * List all cash sessions with filters and pagination
 */
export async function listSessions({ cashierId, status, page = 1, limit = 20 }) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}
  if (cashierId && cashierId !== 'ALL') {
    where.cashierId = cashierId
  }
  if (status && status !== 'ALL') {
    where.status = status
  }

  const [total, items] = await Promise.all([
    prisma.cashSession.count({ where }),
    prisma.cashSession.findMany({
      where,
      skip,
      take,
      include: {
        cashier: { select: { id: true, name: true, email: true } },
        _count: { select: { sales: true } },
      },
      orderBy: { openedAt: 'desc' },
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
  }
}

/**
 * Get cash session details by ID
 */
export async function getSessionById(sessionId) {
  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
    include: {
      cashier: { select: { id: true, name: true, email: true } },
      sales: {
        include: {
          customer: { select: { id: true, name: true } },
          payments: true,
        },
      },
    },
  })

  if (!session) {
    throw ApiError.notFound('Cash session not found')
  }

  return session
}

