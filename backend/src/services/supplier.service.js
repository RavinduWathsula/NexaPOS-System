import { prisma } from '../config/prisma.js'

export async function listSuppliers(filters = {}) {
  const { search, page = 1, limit = 50 } = filters

  const where = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { company: { contains: search } },
      { contactPerson: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, suppliers] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      skip,
      take,
      include: {
        purchases: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            paymentStatus: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Compute financial totals per supplier
  const enriched = suppliers.map((s) => {
    const totalPurchasesCount = s.purchases.length
    let totalPurchased = 0
    let totalPaid = 0

    for (const p of s.purchases) {
      if (p.status !== 'CANCELLED') {
        totalPurchased += Number(p.totalAmount) || 0
        totalPaid += Number(p.paidAmount) || 0
      }
    }

    const outstandingBalance = Math.max(0, totalPurchased - totalPaid)

    return {
      id: s.id,
      name: s.name,
      company: s.company,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      creditDays: s.creditDays,
      totalPurchasesCount,
      totalPurchased,
      totalPaid,
      outstandingBalance,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }
  })

  return {
    items: enriched,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function getSupplierById(id) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, isSerialized: true } },
            },
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
          _count: {
            select: { devices: true },
          },
        },
        orderBy: { orderDate: 'desc' },
      },
    },
  })

  if (!supplier) {
    const error = new Error('Supplier not found.')
    error.statusCode = 404
    throw error
  }

  let totalPurchased = 0
  let totalPaid = 0
  let pendingOrdersCount = 0

  for (const p of supplier.purchases) {
    if (p.status !== 'CANCELLED') {
      totalPurchased += Number(p.totalAmount) || 0
      totalPaid += Number(p.paidAmount) || 0
      if (p.status === 'ORDERED' || p.status === 'PARTIALLY_RECEIVED') {
        pendingOrdersCount++
      }
    }
  }

  const outstandingBalance = Math.max(0, totalPurchased - totalPaid)

  return {
    ...supplier,
    ledger: {
      totalPurchased,
      totalPaid,
      outstandingBalance,
      pendingOrdersCount,
      totalOrdersCount: supplier.purchases.length,
    },
  }
}

export async function createSupplier(data) {
  const existing = await prisma.supplier.findUnique({
    where: { phone: data.phone.trim() },
  })

  if (existing) {
    const error = new Error(`A supplier with phone number '${data.phone}' already exists.`)
    error.statusCode = 409
    throw error
  }

  return await prisma.supplier.create({
    data: {
      name: data.name.trim(),
      company: data.company?.trim() || null,
      contactPerson: data.contactPerson?.trim() || null,
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      creditDays: data.creditDays || 0,
    },
  })
}

export async function updateSupplier(id, data) {
  const existing = await prisma.supplier.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Supplier not found.')
    error.statusCode = 404
    throw error
  }

  if (data.phone && data.phone !== existing.phone) {
    const duplicate = await prisma.supplier.findUnique({
      where: { phone: data.phone.trim() },
    })
    if (duplicate) {
      const error = new Error(`Supplier with phone '${data.phone}' already exists.`)
      error.statusCode = 409
      throw error
    }
  }

  return await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name ? data.name.trim() : undefined,
      company: data.company !== undefined ? data.company?.trim() || null : undefined,
      contactPerson: data.contactPerson !== undefined ? data.contactPerson?.trim() || null : undefined,
      phone: data.phone ? data.phone.trim() : undefined,
      email: data.email !== undefined ? data.email?.trim() || null : undefined,
      address: data.address !== undefined ? data.address?.trim() || null : undefined,
      creditDays: data.creditDays !== undefined ? data.creditDays : undefined,
    },
  })
}

export async function deleteSupplier(id) {
  const purchasesCount = await prisma.purchase.count({ where: { supplierId: id } })
  if (purchasesCount > 0) {
    const error = new Error(
      `Cannot delete supplier: Linked to ${purchasesCount} historical purchase orders.`
    )
    error.statusCode = 400
    throw error
  }

  return await prisma.supplier.delete({ where: { id } })
}

