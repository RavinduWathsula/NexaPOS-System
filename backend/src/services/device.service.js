import { prisma } from '../config/prisma.js'

export async function listDevices(filters = {}) {
  const {
    productId,
    status,
    search,
    page = 1,
    limit = 50,
  } = filters

  const where = {}

  if (productId) {
    where.productId = productId
  }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { imei1: { contains: search } },
      { imei2: { contains: search } },
      { serialNumber: { contains: search } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const [total, devices] = await Promise.all([
    prisma.device.count({ where }),
    prisma.device.findMany({
      where,
      skip,
      take,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            retailPrice: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
        variant: true,
        saleItemDevice: {
          include: {
            saleItem: {
              include: {
                sale: {
                  select: {
                    invoiceNumber: true,
                    createdAt: true,
                    customer: { select: { name: true, phone: true } },
                  },
                },
              },
            },
          },
        },
        warranties: {
          select: {
            warrantyCode: true,
            status: true,
            endDate: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    items: devices,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / take),
    },
  }
}

export async function getDeviceById(id) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      product: {
        include: { category: true, brand: true },
      },
      variant: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      saleItemDevice: {
        include: {
          saleItem: {
            include: {
              sale: {
                include: { customer: true, cashier: true },
              },
            },
          },
        },
      },
      warranties: {
        include: { claims: true },
      },
    },
  })

  if (!device) {
    const error = new Error('Device not found.')
    error.statusCode = 404
    throw error
  }

  return device
}

/**
 * Fast verification lookup by IMEI (e.g. for POS billing or warranty intake)
 */
export async function verifyIMEI(imei) {
  const cleanIMEI = imei.trim()

  const device = await prisma.device.findFirst({
    where: {
      OR: [{ imei1: cleanIMEI }, { imei2: cleanIMEI }, { serialNumber: cleanIMEI }],
    },
    include: {
      product: {
        include: { category: true, brand: true },
      },
      saleItemDevice: {
        include: {
          saleItem: {
            include: {
              sale: {
                include: { customer: true },
              },
            },
          },
        },
      },
      warranties: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!device) {
    return {
      exists: false,
      message: `No device found with IMEI / Serial '${cleanIMEI}' in store database.`,
      imei: cleanIMEI,
    }
  }

  const isSold = device.status === 'SOLD'
  const isAvailableForSale = device.status === 'IN_STOCK'
  const activeWarranty = device.warranties?.[0]
  const isWarrantyValid =
    activeWarranty &&
    activeWarranty.status === 'ACTIVE' &&
    new Date(activeWarranty.endDate) > new Date()

  return {
    exists: true,
    device: {
      id: device.id,
      imei1: device.imei1,
      imei2: device.imei2,
      serialNumber: device.serialNumber,
      status: device.status,
      color: device.color,
      storage: device.storage,
      batteryHealth: device.batteryHealth,
      purchaseCost: device.purchaseCost,
      sellingPrice: device.sellingPrice || device.product.retailPrice,
      product: {
        id: device.product.id,
        name: device.product.name,
        sku: device.product.sku,
        brand: device.product.brand?.name,
        category: device.product.category.name,
      },
      availability: {
        isAvailableForSale,
        isSold,
        reason: isAvailableForSale
          ? 'Device is in stock and available for sale'
          : `Device cannot be sold: status is '${device.status}'`,
      },
      saleInfo: isSold && device.saleItemDevice
        ? {
            invoiceNumber: device.saleItemDevice.saleItem.sale.invoiceNumber,
            saleDate: device.saleItemDevice.saleItem.sale.createdAt,
            customer: device.saleItemDevice.saleItem.sale.customer?.name,
            customerPhone: device.saleItemDevice.saleItem.sale.customer?.phone,
          }
        : null,
      warrantyInfo: activeWarranty
        ? {
            warrantyCode: activeWarranty.warrantyCode,
            status: activeWarranty.status,
            endDate: activeWarranty.endDate,
            isValid: isWarrantyValid,
          }
        : null,
    },
  }
}

/**
 * Register a single serialized device
 */
export async function registerDevice(data, userId) {
  const cleanIMEI1 = data.imei1.trim()

  // 1. Check duplicate IMEI in database
  const existingDevice = await prisma.device.findUnique({
    where: { imei1: cleanIMEI1 },
  })

  if (existingDevice) {
    const error = new Error(`Device with IMEI 1 '${cleanIMEI1}' is already registered in the system.`)
    error.statusCode = 409
    throw error
  }

  // 2. Check duplicate Serial Number if provided
  if (data.serialNumber) {
    const existingSerial = await prisma.device.findUnique({
      where: { serialNumber: data.serialNumber.trim() },
    })
    if (existingSerial) {
      const error = new Error(`Device with Serial Number '${data.serialNumber}' already exists.`)
      error.statusCode = 409
      throw error
    }
  }

  // 3. Check product exists and is serialized
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (!product.isSerialized) {
    const error = new Error(
      `Product '${product.name}' is marked as non-serialized. Cannot assign individual IMEI.`
    )
    error.statusCode = 400
    throw error
  }

  // Transaction: Create Device, Log History, Update Inventory
  return await prisma.$transaction(async (tx) => {
    const device = await tx.device.create({
      data: {
        productId: data.productId,
        variantId: data.variantId || null,
        imei1: cleanIMEI1,
        imei2: data.imei2?.trim() || null,
        serialNumber: data.serialNumber?.trim() || null,
        color: data.color || null,
        storage: data.storage || null,
        batteryHealth: data.batteryHealth || 100,
        purchaseCost: data.purchaseCost || product.costPrice,
        sellingPrice: data.sellingPrice || product.retailPrice,
        status: 'IN_STOCK',
        notes: data.notes || null,
      },
      include: {
        product: true,
      },
    })

    // Log Device Status History
    await tx.deviceStatusHistory.create({
      data: {
        deviceId: device.id,
        fromStatus: 'IN_STOCK',
        toStatus: 'IN_STOCK',
        changedById: userId,
        reason: 'Device registered / stock intake',
      },
    })

    // Increment inventory count for this product
    await tx.inventory.upsert({
      where: { productId_branch: { productId: product.id, branch: 'Colombo Main' } },
      update: { quantity: { increment: 1 } },
      create: {
        productId: product.id,
        quantity: 1,
        reorderLevel: 5,
        location: 'Store Floor',
        branch: 'Colombo Main',
      },
    })

    return device
  })
}

/**
 * Bulk intake serialized devices (e.g. from optical barcode scanner during shipment arrival)
 */
export async function bulkRegisterDevices(data, userId) {
  const { productId, purchaseCost, sellingPrice, color, storage, devices } = data

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    const error = new Error('Product not found.')
    error.statusCode = 404
    throw error
  }

  if (!product.isSerialized) {
    const error = new Error('Cannot assign IMEIs to a non-serialized product.')
    error.statusCode = 400
    throw error
  }

  // Check internal duplicates in payload
  const imeiList = devices.map((d) => d.imei1.trim())
  const uniqueIMEIs = new Set(imeiList)
  if (uniqueIMEIs.size !== imeiList.length) {
    const error = new Error('Duplicate IMEIs detected within the submitted batch.')
    error.statusCode = 400
    throw error
  }

  // Check existing IMEIs in database
  const existingInDb = await prisma.device.findMany({
    where: {
      imei1: { in: imeiList },
    },
    select: { imei1: true },
  })

  if (existingInDb.length > 0) {
    const conflictList = existingInDb.map((d) => d.imei1).join(', ')
    const error = new Error(`The following IMEIs are already registered in the system: ${conflictList}`)
    error.statusCode = 409
    throw error
  }

  // Execute in transaction
  return await prisma.$transaction(async (tx) => {
    const createdDevices = []

    for (const item of devices) {
      const dev = await tx.device.create({
        data: {
          productId,
          imei1: item.imei1.trim(),
          imei2: item.imei2?.trim() || null,
          serialNumber: item.serialNumber?.trim() || null,
          color: color || null,
          storage: storage || null,
          purchaseCost: purchaseCost || product.costPrice,
          sellingPrice: sellingPrice || product.retailPrice,
          status: 'IN_STOCK',
        },
      })

      await tx.deviceStatusHistory.create({
        data: {
          deviceId: dev.id,
          fromStatus: 'IN_STOCK',
          toStatus: 'IN_STOCK',
          changedById: userId,
          reason: `Bulk shipment intake (${devices.length} units)`,
        },
      })

      createdDevices.push(dev)
    }

    // Increment inventory quantity by batch size
    await tx.inventory.upsert({
      where: { productId_branch: { productId, branch: 'Colombo Main' } },
      update: { quantity: { increment: devices.length } },
      create: {
        productId,
        quantity: devices.length,
        reorderLevel: 5,
        location: 'Store Floor',
        branch: 'Colombo Main',
      },
    })

    return {
      count: createdDevices.length,
      productId,
      productName: product.name,
      devices: createdDevices,
    }
  })
}

/**
 * Update device lifecycle status (e.g. mark DEFECTIVE or UNDER_REPAIR)
 */
export async function updateDeviceStatus(id, newStatus, reason, referenceId, userId) {
  const device = await prisma.device.findUnique({
    where: { id },
  })

  if (!device) {
    const error = new Error('Device not found.')
    error.statusCode = 404
    throw error
  }

  if (device.status === newStatus) {
    return device
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.device.update({
      where: { id },
      data: { status: newStatus },
    })

    await tx.deviceStatusHistory.create({
      data: {
        deviceId: id,
        fromStatus: device.status,
        toStatus: newStatus,
        reason,
        referenceId,
        changedById: userId,
      },
    })

    // If device was in stock and is now marked DEFECTIVE or UNDER_REPAIR, decrement available stock
    if (device.status === 'IN_STOCK' && newStatus !== 'IN_STOCK') {
      await tx.inventory.updateMany({
        where: { productId: device.productId, quantity: { gt: 0 } },
        data: { quantity: { decrement: 1 } },
      })
    } else if (device.status !== 'IN_STOCK' && newStatus === 'IN_STOCK') {
      // Re-entering stock (e.g. repaired or returned to shelf)
      await tx.inventory.updateMany({
        where: { productId: device.productId },
        data: { quantity: { increment: 1 } },
      })
    }

    return updated
  })
}
