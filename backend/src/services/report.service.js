import prisma from '../config/prisma.js'

/**
 * Helper to resolve start & end Date objects
 */
function resolveDateRange(startDate, endDate, period = '30days') {
  const now = new Date()

  if (startDate && endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  switch (period) {
    case 'today':
      break
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      break
    case '7days':
      start.setDate(start.getDate() - 6)
      break
    case '30days':
      start.setDate(start.getDate() - 29)
      break
    case 'month':
      start.setDate(1)
      break
    case 'year':
      start.setMonth(0, 1)
      break
    default:
      start.setDate(start.getDate() - 29)
  }

  return { start, end }
}

/**
 * 1. Sales Analytics Engine
 */
export async function getSalesAnalytics({ startDate, endDate, period, cashierId }) {
  const { start, end } = resolveDateRange(startDate, endDate, period)

  // Today range
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // 7 days range
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // Current month range
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const whereBase = {
    saleStatus: { not: 'CANCELLED' },
  }
  if (cashierId) {
    whereBase.cashierId = cashierId
  }

  // Fetch KPI revenues
  const [
    todaySales,
    weeklySales,
    monthlySales,
    periodSales,
    periodPayments,
    allSaleItems,
  ] = await Promise.all([
    // Today
    prisma.sale.aggregate({
      where: { ...whereBase, createdAt: { gte: todayStart } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    // Weekly
    prisma.sale.aggregate({
      where: { ...whereBase, createdAt: { gte: sevenDaysAgo } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    // Monthly
    prisma.sale.aggregate({
      where: { ...whereBase, createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),
    // Period sales details
    prisma.sale.findMany({
      where: {
        ...whereBase,
        createdAt: { gte: start, lte: end },
      },
      include: {
        cashier: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, phone: true } },
        payments: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    // Period payments by method
    prisma.payment.findMany({
      where: {
        saleId: { not: null },
        paymentDate: { gte: start, lte: end },
      },
    }),
    // Sale items in period for best-sellers
    prisma.saleItem.findMany({
      where: {
        sale: {
          ...whereBase,
          createdAt: { gte: start, lte: end },
        },
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    }),
  ])

  // Aggregate Period KPI metrics
  const totalTransactions = periodSales.length
  const periodTotalRevenue = periodSales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const averageTransactionValue = totalTransactions > 0 ? periodTotalRevenue / totalTransactions : 0

  // Best Selling Products & Brands
  const productMap = {}
  const brandMap = {}
  const categoryMap = {}

  for (const item of allSaleItems) {
    const pId = item.productId
    const pName = item.product?.name || 'Unknown Product'
    const brandName = item.product?.brand?.name || 'General Brand'
    const catName = item.product?.category?.name || 'Uncategorized'
    const qty = Number(item.quantity)
    const rev = Number(item.totalPrice)

    // Product
    if (!productMap[pId]) {
      productMap[pId] = {
        id: pId,
        name: pName,
        sku: item.product?.sku || 'N/A',
        brand: brandName,
        quantitySold: 0,
        revenue: 0,
      }
    }
    productMap[pId].quantitySold += qty
    productMap[pId].revenue += rev

    // Brand
    if (!brandMap[brandName]) {
      brandMap[brandName] = { name: brandName, quantitySold: 0, revenue: 0 }
    }
    brandMap[brandName].quantitySold += qty
    brandMap[brandName].revenue += rev

    // Category
    if (!categoryMap[catName]) {
      categoryMap[catName] = { name: catName, value: 0 }
    }
    categoryMap[catName].value += rev
  }

  const bestSellingProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const bestSellingBrands = Object.values(brandMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const categoryDistribution = Object.values(categoryMap).sort((a, b) => b.value - a.value)

  // Sales by Cashier
  const cashierMap = {}
  for (const s of periodSales) {
    const cId = s.cashierId || 'unassigned'
    const cName = s.cashier?.name || 'Store Cashier'
    if (!cashierMap[cId]) {
      cashierMap[cId] = { cashierId: cId, name: cName, transactions: 0, totalRevenue: 0 }
    }
    cashierMap[cId].transactions += 1
    cashierMap[cId].totalRevenue += Number(s.totalAmount)
  }
  const salesByCashier = Object.values(cashierMap).sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Sales by Payment Method
  const paymentMethodMap = {
    CASH: 0,
    CARD: 0,
    BANK_TRANSFER: 0,
    CHEQUE: 0,
  }
  for (const p of periodPayments) {
    if (paymentMethodMap[p.method] !== undefined) {
      paymentMethodMap[p.method] += Number(p.amount)
    } else {
      paymentMethodMap[p.method] = Number(p.amount)
    }
  }
  const salesByPaymentMethod = Object.entries(paymentMethodMap).map(([method, amount]) => ({
    method,
    amount,
  }))

  // Daily Trend for Recharts Line/Bar Chart
  const dailyMap = {}
  // initialize days in range
  const curr = new Date(start)
  while (curr <= end) {
    const dStr = curr.toISOString().split('T')[0]
    dailyMap[dStr] = { date: dStr, revenue: 0, transactions: 0 }
    curr.setDate(curr.getDate() + 1)
  }

  for (const s of periodSales) {
    const dStr = new Date(s.createdAt).toISOString().split('T')[0]
    if (dailyMap[dStr]) {
      dailyMap[dStr].revenue += Number(s.totalAmount)
      dailyMap[dStr].transactions += 1
    }
  }
  const salesTimeline = Object.values(dailyMap)

  return {
    kpis: {
      todayRevenue: Number(todaySales._sum.totalAmount || 0),
      todayTransactions: todaySales._count.id || 0,
      weeklyRevenue: Number(weeklySales._sum.totalAmount || 0),
      weeklyTransactions: weeklySales._count.id || 0,
      monthlyRevenue: Number(monthlySales._sum.totalAmount || 0),
      monthlyTransactions: monthlySales._count.id || 0,
      periodRevenue: periodTotalRevenue,
      periodTransactions: totalTransactions,
      averageTransactionValue,
    },
    bestSellingProducts,
    bestSellingBrands,
    categoryDistribution,
    salesByCashier,
    salesByPaymentMethod,
    salesTimeline,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  }
}

/**
 * 2. Profit Analysis & P&L Statement Engine
 * Uses historical transaction-level unitCost, returns, discounts, and operating expenses
 */
export async function getProfitAnalysis({ startDate, endDate, period }) {
  const { start, end } = resolveDateRange(startDate, endDate, period)

  const [sales, returns, expenses, payments] = await Promise.all([
    // Sales with line items
    prisma.sale.findMany({
      where: {
        saleStatus: { not: 'CANCELLED' },
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: true,
      },
    }),
    // Returns in date range
    prisma.return.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: true,
      },
    }),
    // Expenses in date range
    prisma.expense.findMany({
      where: {
        expenseDate: { gte: start, lte: end },
      },
    }),
    // All payments on sales
    prisma.payment.findMany({
      where: {
        saleId: { not: null },
        paymentDate: { gte: start, lte: end },
      },
    }),
  ])

  let grossSales = 0
  let invoiceDiscounts = 0
  let lineDiscounts = 0
  let costOfGoodsSold = 0
  let totalBilledRevenue = 0

  for (const s of sales) {
    totalBilledRevenue += Number(s.totalAmount)
    invoiceDiscounts += Number(s.discount || 0)

    for (const item of s.items) {
      const itemGross = Number(item.unitPrice) * item.quantity
      grossSales += itemGross
      lineDiscounts += Number(item.discount || 0) * item.quantity
      // HISTORICAL TRANSACTION-LEVEL COGS
      costOfGoodsSold += Number(item.unitCost || 0) * item.quantity
    }
  }

  const totalDiscounts = invoiceDiscounts + lineDiscounts
  const totalReturnsRefunded = returns.reduce((sum, r) => sum + Number(r.totalRefund), 0)
  const netSalesRevenue = Math.max(0, grossSales - totalDiscounts - totalReturnsRefunded)
  const grossProfit = netSalesRevenue - costOfGoodsSold
  const grossMarginPercent = netSalesRevenue > 0 ? (grossProfit / netSalesRevenue) * 100 : 0

  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netOperatingProfit = grossProfit - totalOperatingExpenses
  const netMarginPercent = netSalesRevenue > 0 ? (netOperatingProfit / netSalesRevenue) * 100 : 0

  // Cash Flow Integrity: Actual Received Cash vs Unpaid Customer Balances
  const actualCashReceived = payments
    .filter((p) => p.method === 'CASH')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalSettledPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const unpaidCustomerBalances = Math.max(0, totalBilledRevenue - totalSettledPayments)

  // Expense breakdown by category
  const expenseByCategoryMap = {}
  for (const exp of expenses) {
    const cat = exp.category || 'General'
    expenseByCategoryMap[cat] = (expenseByCategoryMap[cat] || 0) + Number(exp.amount)
  }
  const expenseBreakdown = Object.entries(expenseByCategoryMap).map(([category, amount]) => ({
    category,
    amount,
  }))

  // Monthly/Daily Profit Timeline for Recharts
  const timelineMap = {}
  const curr = new Date(start)
  while (curr <= end) {
    const dStr = curr.toISOString().split('T')[0]
    timelineMap[dStr] = {
      date: dStr,
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      expenses: 0,
      netProfit: 0,
    }
    curr.setDate(curr.getDate() + 1)
  }

  for (const s of sales) {
    const dStr = new Date(s.createdAt).toISOString().split('T')[0]
    if (timelineMap[dStr]) {
      timelineMap[dStr].revenue += Number(s.totalAmount)
      for (const item of s.items) {
        const itemCogs = Number(item.unitCost || 0) * item.quantity
        timelineMap[dStr].cogs += itemCogs
      }
      timelineMap[dStr].grossProfit = timelineMap[dStr].revenue - timelineMap[dStr].cogs
    }
  }

  for (const exp of expenses) {
    const dStr = new Date(exp.expenseDate).toISOString().split('T')[0]
    if (timelineMap[dStr]) {
      timelineMap[dStr].expenses += Number(exp.amount)
    }
  }

  for (const d of Object.values(timelineMap)) {
    d.netProfit = d.grossProfit - d.expenses
  }

  return {
    summary: {
      grossSales,
      discounts: totalDiscounts,
      returns: totalReturnsRefunded,
      netSales: netSalesRevenue,
      cogs: costOfGoodsSold,
      grossProfit,
      grossMarginPercent,
      operatingExpenses: totalOperatingExpenses,
      netOperatingProfit,
      netMarginPercent,
      actualCashReceived,
      totalSettledPayments,
      unpaidCustomerBalances,
    },
    expenseBreakdown,
    profitTimeline: Object.values(timelineMap),
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  }
}

/**
 * 3. Inventory Valuation & Stock Reports Engine
 */
export async function getInventoryReports() {
  const [products, inventoryRecords, damagedDevices, recentMovements] = await Promise.all([
    prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        inventory: true,
        devices: {
          select: { id: true, status: true, purchaseCost: true },
        },
      },
    }),
    prisma.inventory.findMany({
      include: {
        product: {
          include: { brand: true, category: true },
        },
      },
    }),
    prisma.device.findMany({
      where: { status: 'DAMAGED' },
      include: {
        product: true,
      },
    }),
    prisma.stockMovement.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    }),
  ])

  let totalItemsInStock = 0
  let totalCostValuation = 0
  let totalRetailValuation = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  const lowStockProducts = []
  const outOfStockProducts = []

  for (const p of products) {
    const invQty = p.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0
    const reorder = p.inventory?.[0]?.reorderLevel || 5
    const cost = Number(p.costPrice || 0)
    const retail = Number(p.retailPrice || 0)

    totalItemsInStock += invQty
    totalCostValuation += invQty * cost
    totalRetailValuation += invQty * retail

    if (invQty === 0) {
      outOfStockCount += 1
      outOfStockProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name || 'N/A',
        category: p.category?.name || 'N/A',
        costPrice: cost,
        retailPrice: retail,
      })
    } else if (invQty <= reorder) {
      lowStockCount += 1
      lowStockProducts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: invQty,
        reorderLevel: reorder,
        brand: p.brand?.name || 'N/A',
        category: p.category?.name || 'N/A',
      })
    }
  }

  // Count serialized devices in stock
  const inStockDevices = await prisma.device.count({
    where: { status: 'IN_STOCK' },
  })

  return {
    summary: {
      totalItemsInStock,
      totalSerializedInStock: inStockDevices,
      totalCostValuation,
      totalRetailValuation,
      potentialGrossProfit: Math.max(0, totalRetailValuation - totalCostValuation),
      valuationMarginPercent:
        totalRetailValuation > 0
          ? ((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100
          : 0,
      lowStockCount,
      outOfStockCount,
      damagedCount: damagedDevices.length,
    },
    lowStockProducts: lowStockProducts.slice(0, 15),
    outOfStockProducts: outOfStockProducts.slice(0, 15),
    damagedInventory: damagedDevices.map((d) => ({
      id: d.id,
      imei: d.imei1,
      serialNumber: d.serialNumber,
      productName: d.product?.name,
      purchaseCost: Number(d.purchaseCost),
      notes: d.notes,
    })),
    recentStockMovements: recentMovements.map((m) => ({
      id: m.id,
      productName: m.product?.name || 'General Product',
      sku: m.product?.sku,
      type: m.type,
      quantity: m.quantity,
      previousQty: m.previousQty,
      newQty: m.newQty,
      reference: m.reference,
      date: m.createdAt,
    })),
  }
}

/**
 * 4. Purchase & Supplier Reports Engine
 */
export async function getPurchaseReports({ startDate, endDate, period }) {
  const { start, end } = resolveDateRange(startDate, endDate, period)

  const [purchases, suppliers, purchasePayments] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: start, lte: end },
      },
      include: {
        supplier: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supplier.findMany({
      include: {
        purchases: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        purchaseId: { not: null },
        paymentDate: { gte: start, lte: end },
      },
    }),
  ])

  const totalPurchasesCount = purchases.length
  const totalPurchaseVolume = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0)
  const totalPaidToSuppliers = purchasePayments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Calculate grand total outstanding supplier payables
  let totalOutstandingSupplierPayables = 0
  const supplierBreakdown = suppliers.map((sup) => {
    let supTotalSpent = 0
    let supTotalPaid = 0

    for (const po of sup.purchases) {
      supTotalSpent += Number(po.totalAmount)
      supTotalPaid += Number(po.paidAmount)
    }

    const outstanding = Math.max(0, supTotalSpent - supTotalPaid)
    totalOutstandingSupplierPayables += outstanding

    return {
      id: sup.id,
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      totalOrders: sup.purchases.length,
      totalSpent: supTotalSpent,
      totalPaid: supTotalPaid,
      outstandingBalance: outstanding,
    }
  })

  return {
    summary: {
      totalOrders: totalPurchasesCount,
      totalPurchasesVolume: totalPurchaseVolume,
      totalPaidToSuppliers,
      totalOutstandingPayables: totalOutstandingSupplierPayables,
      averageOrderValue: totalPurchasesCount > 0 ? totalPurchaseVolume / totalPurchasesCount : 0,
    },
    supplierBreakdown: supplierBreakdown.sort((a, b) => b.totalSpent - a.totalSpent),
    recentPurchases: purchases.slice(0, 15).map((p) => ({
      id: p.id,
      poNumber: p.purchaseOrderNumber,
      supplierName: p.supplier?.name,
      totalAmount: Number(p.totalAmount),
      paidAmount: Number(p.paidAmount),
      balanceDue: Math.max(0, Number(p.totalAmount) - Number(p.paidAmount)),
      status: p.status,
      paymentStatus: p.paymentStatus,
      date: p.createdAt,
    })),
  }
}
