import { prisma } from '../config/prisma.js'

function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] || 'Customer'
  const lastName = parts.slice(1).join(' ') || ''
  return { firstName, lastName }
}

export async function listCustomers(filters = {}) {
  const { search, page = 1, limit = 50 } = filters

  const where = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { nic: { contains: search } },
      { address: { contains: search } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, customers, allCustomersForSummary] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take,
      include: {
        sales: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            paymentStatus: true,
            saleStatus: true,
          },
        },
        _count: {
          select: {
            warranties: { where: { status: 'ACTIVE' } },
            repairJobs: { where: { status: { notIn: ['COMPLETED', 'DELIVERED', 'CANCELLED'] } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      select: {
        sales: {
          select: {
            totalAmount: true,
            paidAmount: true,
            saleStatus: true,
          },
        },
      },
    }),
  ])

  // Calculate grand total outstanding across all customers
  let grandTotalOutstanding = 0
  for (const c of allCustomersForSummary) {
    let spent = 0
    let paid = 0
    for (const s of c.sales) {
      if (s.saleStatus !== 'CANCELLED') {
        spent += Number(s.totalAmount) || 0
        paid += Number(s.paidAmount) || 0
      }
    }
    grandTotalOutstanding += Math.max(0, spent - paid)
  }

  const items = customers.map((c) => {
    let totalSpent = 0
    let totalPaid = 0

    for (const s of c.sales) {
      if (s.saleStatus !== 'CANCELLED') {
        totalSpent += Number(s.totalAmount) || 0
        totalPaid += Number(s.paidAmount) || 0
      }
    }

    const outstandingBalance = Math.max(0, totalSpent - totalPaid)
    const { firstName, lastName } = splitName(c.name)

    return {
      id: c.id,
      name: c.name,
      firstName,
      lastName,
      phone: c.phone,
      email: c.email,
      nic: c.nic,
      address: c.address,
      city: c.address,
      loyaltyTier: c.loyaltyTier,
      loyaltyPoints: c.loyaltyPoints,
      totalSalesCount: c.sales.length,
      _count: {
        sales: c.sales.length,
        warranties: c._count.warranties,
        repairs: c._count.repairJobs,
      },
      totalSpent,
      totalPaid,
      outstandingBalance,
      activeWarrantiesCount: c._count.warranties,
      activeRepairsCount: c._count.repairJobs,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }
  })

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
    summary: {
      totalCustomers: total,
      totalOutstandingBalance: grandTotalOutstanding,
    },
  }
}

export async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, isSerialized: true } },
              devices: {
                include: {
                  device: { select: { imei1: true, serialNumber: true, color: true, storage: true } },
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      warranties: {
        include: {
          device: {
            include: {
              product: { select: { name: true, sku: true } },
              variant: true,
            },
          },
          claims: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      repairJobs: {
        include: {
          technician: { select: { id: true, name: true } },
          parts: true,
          payments: true,
        },
        orderBy: { receivedAt: 'desc' },
      },
    },
  })

  if (!customer) {
    const error = new Error('Customer not found.')
    error.statusCode = 404
    throw error
  }

  let totalSpent = 0
  let totalPaid = 0

  for (const s of customer.sales) {
    if (s.saleStatus !== 'CANCELLED') {
      totalSpent += Number(s.totalAmount) || 0
      totalPaid += Number(s.paidAmount) || 0
    }
  }

  const outstandingBalance = Math.max(0, totalSpent - totalPaid)
  const { firstName, lastName } = splitName(customer.name)

  return {
    ...customer,
    firstName,
    lastName,
    outstandingBalance,
    totalSpent,
    totalPaid,
    repairs: customer.repairJobs,
    ledger: {
      totalSpent,
      totalPaid,
      outstandingBalance,
      totalSalesCount: customer.sales.length,
      activeWarrantiesCount: customer.warranties.filter((w) => w.status === 'ACTIVE').length,
      activeRepairsCount: customer.repairJobs.filter(
        (r) => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(r.status)
      ).length,
    },
  }
}

export async function createCustomer(data) {
  const resolvedName =
    data.name?.trim() ||
    `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
    'Customer'

  const existing = await prisma.customer.findUnique({
    where: { phone: data.phone.trim() },
  })

  if (existing) {
    const error = new Error(`Customer with phone '${data.phone}' already exists.`)
    error.statusCode = 409
    throw error
  }

  const created = await prisma.customer.create({
    data: {
      name: resolvedName,
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      nic: data.nic?.trim() || null,
      address: data.address?.trim() || data.city?.trim() || null,
      loyaltyTier: data.loyaltyTier || 'STANDARD',
      loyaltyPoints: 0,
    },
  })

  const { firstName, lastName } = splitName(created.name)
  return {
    ...created,
    firstName,
    lastName,
  }
}

export async function updateCustomer(id, data) {
  const existing = await prisma.customer.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('Customer not found.')
    error.statusCode = 404
    throw error
  }

  if (data.phone && data.phone !== existing.phone) {
    const duplicate = await prisma.customer.findUnique({
      where: { phone: data.phone.trim() },
    })
    if (duplicate) {
      const error = new Error(`Customer with phone '${data.phone}' already exists.`)
      error.statusCode = 409
      throw error
    }
  }

  const resolvedName =
    data.name?.trim() ||
    (data.firstName
      ? `${data.firstName || ''} ${data.lastName || ''}`.trim()
      : existing.name)

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      name: resolvedName,
      phone: data.phone ? data.phone.trim() : existing.phone,
      email: data.email !== undefined ? data.email?.trim() || null : existing.email,
      nic: data.nic !== undefined ? data.nic?.trim() || null : existing.nic,
      address:
        data.address !== undefined
          ? data.address?.trim() || null
          : data.city !== undefined
          ? data.city?.trim() || null
          : existing.address,
      loyaltyTier: data.loyaltyTier || existing.loyaltyTier,
    },
  })

  const { firstName, lastName } = splitName(updated.name)
  return {
    ...updated,
    firstName,
    lastName,
  }
}

export async function deleteCustomer(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          sales: true,
          warranties: true,
          repairJobs: true,
        },
      },
    },
  })

  if (!customer) {
    const error = new Error('Customer not found.')
    error.statusCode = 404
    throw error
  }

  if (
    customer._count.sales > 0 ||
    customer._count.warranties > 0 ||
    customer._count.repairJobs > 0
  ) {
    const error = new Error(
      `Cannot delete customer '${customer.name}' because they have associated records (${customer._count.sales} sales, ${customer._count.warranties} warranties, ${customer._count.repairJobs} repairs).`
    )
    error.statusCode = 400
    throw error
  }

  await prisma.customer.delete({ where: { id } })
  return { message: `Customer '${customer.name}' deleted successfully.` }
}
