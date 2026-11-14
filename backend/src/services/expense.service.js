import prisma from '../config/prisma.js'
import { ApiError } from '../utils/apiError.js'

export async function listExpenses({
  startDate,
  endDate,
  category,
  paymentMethod,
  search,
  page = 1,
  limit = 20,
}) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit))
  const take = Math.max(1, Number(limit))

  const where = {}

  if (category && category !== 'ALL') {
    where.category = category
  }

  if (paymentMethod && paymentMethod !== 'ALL') {
    where.paymentMethod = paymentMethod
  }

  if (startDate || endDate) {
    where.expenseDate = {}
    if (startDate) {
      const s = new Date(startDate)
      s.setHours(0, 0, 0, 0)
      where.expenseDate.gte = s
    }
    if (endDate) {
      const e = new Date(endDate)
      e.setHours(23, 59, 59, 999)
      where.expenseDate.lte = e
    }
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { title: { contains: q } },
      { category: { contains: q } },
      { notes: { contains: q } },
    ]
  }

  const [total, items, aggregate, categoryGroups] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip,
      take,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
    }),
  ])

  const categoryBreakdown = categoryGroups.map((g) => ({
    category: g.category,
    amount: Number(g._sum.amount || 0),
  }))

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / take),
    },
    summary: {
      totalAmount: Number(aggregate._sum.amount || 0),
      totalCount: total,
      categoryBreakdown,
    },
  }
}

export async function createExpense(data, userId) {
  const { title, category, amount, paymentMethod = 'CASH', expenseDate, notes } = data

  if (!userId) {
    throw ApiError.unauthorized('Authenticated user required to record expense')
  }

  const expense = await prisma.expense.create({
    data: {
      title: title.trim(),
      category: category.trim(),
      amount: Number(amount),
      paymentMethod,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      notes: notes?.trim() || null,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  await prisma.auditLog.create({
    data: {
      performedById: userId,
      action: 'RECORD_EXPENSE',
      entity: 'Expense',
      entityId: expense.id,
      details: JSON.stringify({ title, category, amount, paymentMethod }),
    },
  })

  return expense
}

export async function updateExpense(id, data) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Expense record not found')
  }

  return prisma.expense.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
      paymentMethod: data.paymentMethod || existing.paymentMethod,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : existing.expenseDate,
      notes: data.notes !== undefined ? data.notes?.trim() || null : existing.notes,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function deleteExpense(id) {
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) {
    throw ApiError.notFound('Expense record not found')
  }

  await prisma.expense.delete({ where: { id } })
  return { message: 'Expense deleted successfully' }
}

export async function getExpenseCategories() {
  const categories = await prisma.expense.findMany({
    select: { category: true },
    distinct: ['category'],
  })
  const defaultCategories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Workshop Tools',
    'Maintenance',
    'Office Supplies',
    'Advertising',
    'Petty Cash',
    'Miscellaneous',
  ]
  const existingSet = new Set(categories.map((c) => c.category))
  for (const def of defaultCategories) {
    existingSet.add(def)
  }
  return Array.from(existingSet)
}

