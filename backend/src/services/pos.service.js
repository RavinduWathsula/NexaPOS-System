import { prisma } from '../config/prisma.js'

/**
 * Fast POS Catalog Retrieval
 * Optimized for terminal card grid and instant search
 */
export async function getPOSCatalog(filters = {}) {
  const { categoryId, brandId, search } = filters

  const where = {}

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (brandId) {
    where.brandId = brandId
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { barcode: { contains: search } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      variants: true,
      images: { orderBy: { isPrimary: 'desc' }, take: 1 },
      inventory: true,
      devices: {
        where: { status: 'IN_STOCK' },
        select: {
          id: true,
          imei1: true,
          imei2: true,
          serialNumber: true,
          color: true,
          storage: true,
          sellingPrice: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    take: 100,
  })

  return products.map((p) => {
    const inv = p.inventory[0] || { quantity: 0, location: 'Store Floor' }
    const availableDevices = p.devices || []
    const availableStock = p.isSerialized ? availableDevices.length : inv.quantity

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category?.name || 'Uncategorized',
      categoryId: p.categoryId,
      brand: p.brand?.name || 'N/A',
      brandId: p.brandId,
      isSerialized: p.isSerialized,
      costPrice: Number(p.costPrice),
      retailPrice: Number(p.retailPrice),
      minPrice: p.minPrice ? Number(p.minPrice) : null,
      defaultWarrantyMonths: p.defaultWarrantyMonths || 0,
      image: p.images[0]?.url || null,
      availableStock,
      availableDevices,
      variants: p.variants,
    }
  })
}

/**
 * Optical Barcode Scanner Direct IMEI Lookup
 */
export async function lookupByIMEI(imei) {
  const clean = imei.trim()
  const device = await prisma.device.findFirst({
    where: {
      OR: [{ imei1: clean }, { imei2: clean }, { serialNumber: clean }],
    },
    include: {
      product: {
        include: { category: true, brand: true, images: { where: { isPrimary: true }, take: 1 } },
      },
      variant: true,
    },
  })

  if (!device) {
    const error = new Error(`No device found with IMEI / Serial '${clean}'.`)
    error.statusCode = 404
    throw error
  }

  if (device.status !== 'IN_STOCK') {
    const error = new Error(
      `Device ${device.imei1} cannot be sold: Current status is '${device.status}'.`
    )
    error.statusCode = 400
    throw error
  }

  return {
    device: {
      id: device.id,
      imei1: device.imei1,
      imei2: device.imei2,
      serialNumber: device.serialNumber,
      color: device.color,
      storage: device.storage,
      sellingPrice: Number(device.sellingPrice || device.product.retailPrice),
    },
    product: {
      id: device.product.id,
      name: device.product.name,
      sku: device.product.sku,
      isSerialized: true,
      retailPrice: Number(device.product.retailPrice),
      defaultWarrantyMonths: device.product.defaultWarrantyMonths,
      category: device.product.category?.name,
      brand: device.product.brand?.name,
      image: device.product.images[0]?.url || null,
    },
  }
}

/**
 * Process POS Sale Transaction (Billing Engine)
 * Atomically validates stock/IMEIs, creates invoice, updates inventory, marks devices SOLD, and creates warranties.
 */
export async function processSale(data, cashierId) {
  const { customerId, items, discount = 0, tax = 0, payments, cashReceived, notes } = data

  if (!items || items.length === 0) {
    const error = new Error('Cannot process empty cart.')
    error.statusCode = 400
    throw error
  }

  // 1. Pre-validate products & devices
  const allDeviceIds = []
  for (const item of items) {
    if (item.deviceIds && item.deviceIds.length > 0) {
      if (item.deviceIds.length !== item.quantity) {
        const error = new Error(
          `Item requires ${item.quantity} individual IMEI devices, but ${item.deviceIds.length} were selected.`
        )
        error.statusCode = 400
        throw error
      }
      allDeviceIds.push(...item.deviceIds)
    }
  }

  // Check internal duplicate device IDs
  const uniqueDevIds = new Set(allDeviceIds)
  if (uniqueDevIds.size !== allDeviceIds.length) {
    const error = new Error('Duplicate device detected within cart items.')
    error.statusCode = 400
    throw error
  }

  // If serialized devices selected, verify they exist and are IN_STOCK
  if (allDeviceIds.length > 0) {
    const devicesInDb = await prisma.device.findMany({
      where: { id: { in: allDeviceIds } },
      select: { id: true, imei1: true, status: true },
    })

    for (const dev of devicesInDb) {
      if (dev.status !== 'IN_STOCK') {
        const error = new Error(
          `Device with IMEI '${dev.imei1}' is not available for sale (status: ${dev.status}).`
        )
        error.statusCode = 409
        throw error
      }
    }

    if (devicesInDb.length !== allDeviceIds.length) {
      const error = new Error('One or more selected devices could not be found in inventory.')
      error.statusCode = 404
      throw error
    }
  }

  // 2. Financial calculation
  let subtotal = 0
  for (const item of items) {
    const lineTotal = item.quantity * item.unitPrice - (Number(item.discount) || 0)
    subtotal += Math.max(0, lineTotal)
  }

  const invoiceDiscount = Number(discount) || 0
  const invoiceTax = Number(tax) || 0
  const totalAmount = Math.max(0, subtotal - invoiceDiscount + invoiceTax)

  const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const isFullyPaid = paidAmount >= totalAmount - 0.01

  // If walk-in customer (no customerId), cannot allow credit / partial sale
  if (!customerId && !isFullyPaid) {
    const error = new Error(
      `Walk-in customer must settle invoice in full. Paid: Rs. ${paidAmount.toLocaleString()}, Due: Rs. ${totalAmount.toLocaleString()}`
    )
    error.statusCode = 400
    throw error
  }

  const changeAmount = cashReceived && Number(cashReceived) > totalAmount
    ? Number(cashReceived) - totalAmount
    : 0

  const paymentStatus = isFullyPaid ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID'
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`

  // 3. Execute atomic database transaction
  return await prisma.$transaction(async (tx) => {
    // A. Create Sale record
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId: customerId || null,
        cashierId,
        subtotal,
        discount: invoiceDiscount,
        tax: invoiceTax,
        totalAmount,
        paidAmount,
        changeAmount,
        paymentStatus,
        saleStatus: 'COMPLETED',
        notes: notes?.trim() || null,
      },
    })

    // B. Process items
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { inventory: { where: { branch: 'Colombo Main' } } },
      })

      if (!product) {
        throw new Error(`Product ID ${item.productId} not found.`)
      }

      const lineTotal = item.quantity * item.unitPrice - (Number(item.discount) || 0)

      // Create SaleItem
      const saleItem = await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: product.id,
          quantity: item.quantity,
          unitCost: product.costPrice,
          unitPrice: item.unitPrice,
          discount: Number(item.discount) || 0,
          subtotal: Math.max(0, lineTotal),
          warrantyMonths: product.defaultWarrantyMonths || 0,
        },
      })

      if (product.isSerialized) {
        // Serialized phone processing
        for (const devId of item.deviceIds || []) {
          // Link device to sale item
          await tx.saleItemDevice.create({
            data: {
              saleItemId: saleItem.id,
              deviceId: devId,
            },
          })

          // Mark device as SOLD
          const soldDev = await tx.device.update({
            where: { id: devId },
            data: { status: 'SOLD' },
          })

          // Audit status history
          await tx.deviceStatusHistory.create({
            data: {
              deviceId: devId,
              fromStatus: 'IN_STOCK',
              toStatus: 'SOLD',
              changedById: cashierId,
              reason: `Retail POS Sale on Invoice #${invoiceNumber}`,
              referenceId: invoiceNumber,
            },
          })

          // Create warranty if product offers warranty
          if (product.defaultWarrantyMonths > 0) {
            const startDate = new Date()
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + product.defaultWarrantyMonths)

            const warrantyCode = `WAR-${Date.now().toString().slice(-7)}-${Math.floor(100 + Math.random() * 900)}`

            await tx.warranty.create({
              data: {
                warrantyCode,
                deviceId: devId,
                customerId: customerId || null,
                saleId: sale.id,
                startDate,
                endDate,
                status: 'ACTIVE',
                terms: `${product.defaultWarrantyMonths} Months NexaPOS Comprehensive Hardware Warranty.`,
              },
            })
          }
        }

        // Decrement serialized inventory quantity
        await tx.inventory.updateMany({
          where: { productId: product.id, branch: 'Colombo Main', quantity: { gt: 0 } },
          data: { quantity: { decrement: item.quantity } },
        })

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: item.quantity,
            previousQty: 0,
            newQty: 0,
            unitCost: product.costPrice,
            reference: invoiceNumber,
            notes: `Retail Sale #${invoiceNumber} (${item.quantity} units)`,
            createdById: cashierId,
          },
        })
      } else {
        // Non-serialized item processing (Accessories, Chargers, Cases)
        const currentInv = product.inventory[0] || { quantity: 0 }
        if (currentInv.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for '${product.name}': Requested ${item.quantity}, but only ${currentInv.quantity} available.`
          )
        }

        const previousQty = currentInv.quantity
        const newQty = previousQty - item.quantity

        await tx.inventory.update({
          where: { productId_branch: { productId: product.id, branch: 'Colombo Main' } },
          data: { quantity: newQty },
        })

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'SALE',
            quantity: item.quantity,
            previousQty,
            newQty,
            unitCost: product.costPrice,
            reference: invoiceNumber,
            notes: `Retail Sale #${invoiceNumber}`,
            createdById: cashierId,
          },
        })

        // Create warranty for accessory if applicable
        if (product.defaultWarrantyMonths > 0) {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + product.defaultWarrantyMonths)

          await tx.warranty.create({
            data: {
              warrantyCode: `WAR-ACC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
              customerId: customerId || null,
              saleId: sale.id,
              startDate,
              endDate,
              status: 'ACTIVE',
              terms: `${product.defaultWarrantyMonths} Months Accessory Warranty.`,
            },
          })
        }
      }
    }

    // C. Record Payment entries
    for (const p of payments) {
      await tx.payment.create({
        data: {
          saleId: sale.id,
          amount: p.amount,
          method: p.method,
          cardLastFour: p.cardLastFour || null,
          transactionRef: p.transactionRef || null,
          notes: p.notes || null,
          paymentDate: new Date(),
        },
      })
    }

    // D. Award loyalty points to registered customer (1 pt per 1000 LKR)
    if (customerId) {
      const pointsEarned = Math.floor(totalAmount / 1000)
      if (pointsEarned > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { increment: pointsEarned } },
        })
      }
    }

    // Return complete sale data with full relations
    return await tx.sale.findUnique({
      where: { id: sale.id },
      include: {
        customer: true,
        cashier: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                isSerialized: true,
                category: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
            devices: {
              include: {
                device: {
                  select: { id: true, imei1: true, imei2: true, serialNumber: true, color: true, storage: true },
                },
              },
            },
          },
        },
        payments: true,
        warranties: true,
      },
    })
  })
}

/**
 * Fetch Sale by ID or Invoice Number for Thermal Receipt
 */
export async function getSaleReceipt(idOrInvoice) {
  const sale = await prisma.sale.findFirst({
    where: {
      OR: [{ id: idOrInvoice }, { invoiceNumber: idOrInvoice }],
    },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              isSerialized: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
          devices: {
            include: {
              device: {
                select: { id: true, imei1: true, imei2: true, serialNumber: true, color: true, storage: true },
              },
            },
          },
        },
      },
      payments: true,
      warranties: true,
    },
  })

  if (!sale) {
    const error = new Error('Invoice not found.')
    error.statusCode = 404
    throw error
  }

  return sale
}

/**
 * List Historical Sales & Invoices
 */
export async function listSalesHistory(filters = {}) {
  const {
    search,
    startDate,
    endDate,
    cashierId,
    customerId,
    paymentStatus,
    page = 1,
    limit = 20,
  } = filters

  const where = {}

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { phone: { contains: search } } },
    ]
  }

  if (cashierId) {
    where.cashierId = cashierId
  }

  if (customerId) {
    where.customerId = customerId
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus
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

  const [total, sales, metricsData] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      skip,
      take,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        cashier: { select: { id: true, name: true } },
        payments: true,
        items: {
          select: {
            id: true,
            quantity: true,
            product: { select: { name: true, isSerialized: true } },
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sale.aggregate({
      where,
      _sum: { totalAmount: true, paidAmount: true },
      _count: true,
    }),
  ])

  return {
    items: sales,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
    metrics: {
      totalSalesCount: metricsData._count,
      totalRevenue: Number(metricsData._sum.totalAmount || 0),
      totalCollected: Number(metricsData._sum.paidAmount || 0),
      totalOutstanding: Math.max(
        0,
        Number(metricsData._sum.totalAmount || 0) - Number(metricsData._sum.paidAmount || 0)
      ),
    },
  }
}

/**
 * List / Search Customers for POS
 */
export async function listCustomers(search) {
  const where = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ]
  }
  return await prisma.customer.findMany({
    where,
    take: 50,
    orderBy: { name: 'asc' },
  })
}

/**
 * Quick Customer Registration from POS
 */
export async function quickCreateCustomer(data) {
  const existing = await prisma.customer.findUnique({
    where: { phone: data.phone.trim() },
  })

  if (existing) {
    return existing
  }

  return await prisma.customer.create({
    data: {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      nic: data.nic?.trim() || null,
      address: data.address?.trim() || null,
    },
  })
}
