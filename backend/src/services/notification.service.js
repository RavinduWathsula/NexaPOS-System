import { prisma } from '../config/prisma.js'

/**
 * Gather live real-time system alerts & events from database
 */
export async function getSystemNotifications(user) {
  const notifications = []

  // 1. Live Inventory Alerts (Out of stock & low stock)
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    })

    for (const inv of inventories) {
      if (!inv.product) continue
      const qty = Number(inv.quantity)
      const threshold = Number(inv.reorderLevel)

      if (qty === 0) {
        notifications.push({
          id: `stock_out_${inv.id}`,
          title: 'Out of Stock Alert',
          message: `${inv.product.name} is completely out of stock (0 units remaining).`,
          type: 'danger',
          category: 'inventory',
          timestamp: inv.updatedAt,
          actionUrl: '/inventory',
        })
      } else if (qty <= threshold) {
        notifications.push({
          id: `stock_low_${inv.id}`,
          title: 'Low Stock Alert',
          message: `${inv.product.name} is down to ${qty} units (Reorder limit: ${threshold}).`,
          type: 'warning',
          category: 'inventory',
          timestamp: inv.updatedAt,
          actionUrl: '/inventory',
        })
      }
    }
  } catch (err) {
    console.error('Error fetching inventory notifications:', err)
  }

  // 2. Real Recent Sales & Invoices
  try {
    const recentSales = await prisma.sale.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        cashier: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    })

    for (const sale of recentSales) {
      const cashierName = sale.cashier?.name || 'Cashier'
      const customerName = sale.customer?.name || 'Walk-in Customer'
      const amount = Number(sale.totalAmount).toLocaleString()

      notifications.push({
        id: `sale_${sale.id}`,
        title: 'Sale Completed',
        message: `${cashierName} completed Invoice #${sale.invoiceNumber} for Rs. ${amount} (${customerName}).`,
        type: 'success',
        category: 'sales',
        timestamp: sale.createdAt,
        actionUrl: '/sales-invoices',
      })
    }
  } catch (err) {
    console.error('Error fetching sales notifications:', err)
  }

  // 3. Real Active & Completed Device Repairs
  try {
    const recentRepairs = await prisma.repairJob.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })

    for (const repair of recentRepairs) {
      const cust = repair.customer?.name ? ` for ${repair.customer.name}` : ''
      if (repair.status === 'READY_FOR_PICKUP' || repair.status === 'COMPLETED') {
        notifications.push({
          id: `repair_${repair.id}`,
          title: 'Device Repair Ready',
          message: `Repair #${repair.ticketNumber} (${repair.deviceModel})${cust} is completed and ready for pickup.`,
          type: 'success',
          category: 'repairs',
          timestamp: repair.updatedAt,
          actionUrl: '/repair-management',
        })
      } else if (repair.status === 'IN_PROGRESS') {
        notifications.push({
          id: `repair_${repair.id}`,
          title: 'Repair In Progress',
          message: `Repair #${repair.ticketNumber} (${repair.deviceModel})${cust} is currently being serviced.`,
          type: 'info',
          category: 'repairs',
          timestamp: repair.updatedAt,
          actionUrl: '/repair-management',
        })
      }
    }
  } catch (err) {
    console.error('Error fetching repair notifications:', err)
  }

  // 4. Real Warranties
  try {
    const recentWarranties = await prisma.warranty.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })

    for (const w of recentWarranties) {
      const cust = w.customer?.name ? ` for ${w.customer.name}` : ''
      notifications.push({
        id: `warranty_${w.id}`,
        title: 'Warranty Registered',
        message: `Warranty Certificate #${w.warrantyCode}${cust} is active until ${new Date(w.endDate).toLocaleDateString()}.`,
        type: 'info',
        category: 'warranty',
        timestamp: w.createdAt,
        actionUrl: '/warranty-management',
      })
    }
  } catch (err) {
    console.error('Error fetching warranty notifications:', err)
  }

  // 5. Real Purchases & Restocks
  try {
    const recentPurchases = await prisma.purchase.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: { select: { id: true, name: true } },
      },
    })

    for (const p of recentPurchases) {
      const supp = p.supplier?.name ? ` from ${p.supplier.name}` : ''
      notifications.push({
        id: `purchase_${p.id}`,
        title: 'Supplier Purchase Order',
        message: `Purchase #${p.purchaseNumber}${supp} (${p.status.toLowerCase()}).`,
        type: 'info',
        category: 'purchases',
        timestamp: p.createdAt,
        actionUrl: '/purchases',
      })
    }
  } catch (err) {
    console.error('Error fetching purchase notifications:', err)
  }

  // Sort descending by timestamp (newest first)
  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return notifications
}

