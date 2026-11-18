import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Printer,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Package,
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Layers,
  FileSpreadsheet,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { reportsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

const PIE_COLORS = [
  '#0284c7', // sky
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
]

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('sales') // 'sales', 'profit', 'inventory', 'purchases'
  const [period, setPeriod] = useState('30days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  // Report Data States
  const [salesData, setSalesData] = useState(null)
  const [profitData, setProfitData] = useState(null)
  const [inventoryData, setInventoryData] = useState(null)
  const [purchaseData, setPurchaseData] = useState(null)

  // Load Reports
  const loadReports = async () => {
    try {
      setLoading(true)
      const params = { period }
      if (period === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate
        params.endDate = customEndDate
      }

      const [salesRes, profitRes, invRes, purchaseRes] = await Promise.all([
        reportsAPI.salesAnalytics(params),
        reportsAPI.profitAnalysis(params),
        reportsAPI.inventoryReport(),
        reportsAPI.purchaseReport(params),
      ])

      setSalesData(salesRes.data.data)
      setProfitData(profitRes.data.data)
      setInventoryData(invRes.data.data)
      setPurchaseData(purchaseRes.data.data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [period])

  // Custom Date Submit
  const handleApplyCustomDates = (e) => {
    e.preventDefault()
    if (customStartDate && customEndDate) {
      setPeriod('custom')
      loadReports()
    }
  }

  // Export to CSV / Excel
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    let filename = `NexaPOS_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`

    if (activeTab === 'sales') {
      csvContent += '--- NEXAPOS SALES ANALYTICS REPORT ---\r\n'
      csvContent += `Generated At,${new Date().toLocaleString()}\r\n`
      csvContent += `Period Revenue (LKR),${salesData?.kpis?.periodRevenue || 0}\r\n`
      csvContent += `Total Transactions,${salesData?.kpis?.periodTransactions || 0}\r\n`
      csvContent += `Average Basket Value (LKR),${salesData?.kpis?.averageTransactionValue || 0}\r\n\r\n`

      csvContent += 'Date,Revenue (LKR),Transactions\r\n'
      salesData?.salesTimeline?.forEach((row) => {
        csvContent += `${row.date},${row.revenue},${row.transactions}\r\n`
      })

      csvContent += '\r\nBest Selling Products\r\n'
      csvContent += 'Product Name,SKU,Brand,Quantity Sold,Revenue (LKR)\r\n'
      salesData?.bestSellingProducts?.forEach((p) => {
        csvContent += `"${p.name}","${p.sku}","${p.brand}",${p.quantitySold},${p.revenue}\r\n`
      })
    } else if (activeTab === 'profit') {
      csvContent += '--- NEXAPOS PROFIT & LOSS STATEMENT ---\r\n'
      csvContent += `Generated At,${new Date().toLocaleString()}\r\n`
      csvContent += `Gross Sales (LKR),${profitData?.summary?.grossSales || 0}\r\n`
      csvContent += `Discounts (LKR),${profitData?.summary?.discounts || 0}\r\n`
      csvContent += `Returns (LKR),${profitData?.summary?.returns || 0}\r\n`
      csvContent += `Net Sales (LKR),${profitData?.summary?.netSales || 0}\r\n`
      csvContent += `Cost of Goods Sold (COGS) (LKR),${profitData?.summary?.cogs || 0}\r\n`
      csvContent += `Gross Profit (LKR),${profitData?.summary?.grossProfit || 0}\r\n`
      csvContent += `Operating Expenses (LKR),${profitData?.summary?.operatingExpenses || 0}\r\n`
      csvContent += `Net Operating Profit (LKR),${profitData?.summary?.netOperatingProfit || 0}\r\n`
      csvContent += `Net Profit Margin %,${profitData?.summary?.netMarginPercent?.toFixed(2) || 0}%\r\n`
      csvContent += `Actual Cash Collected (LKR),${profitData?.summary?.actualCashReceived || 0}\r\n`
      csvContent += `Unpaid Customer Credit (LKR),${profitData?.summary?.unpaidCustomerBalances || 0}\r\n`
    } else if (activeTab === 'inventory') {
      csvContent += '--- NEXAPOS INVENTORY VALUATION REPORT ---\r\n'
      csvContent += `Total In-Stock Items,${inventoryData?.summary?.totalItemsInStock || 0}\r\n`
      csvContent += `Total Cost Valuation (LKR),${inventoryData?.summary?.totalCostValuation || 0}\r\n`
      csvContent += `Total Retail Valuation (LKR),${inventoryData?.summary?.totalRetailValuation || 0}\r\n`
      csvContent += `Potential Profit (LKR),${inventoryData?.summary?.potentialGrossProfit || 0}\r\n\r\n`

      csvContent += 'Low Stock Alerts\r\n'
      csvContent += 'Product Name,SKU,Current Stock,Reorder Level,Brand\r\n'
      inventoryData?.lowStockProducts?.forEach((item) => {
        csvContent += `"${item.name}","${item.sku}",${item.currentStock},${item.reorderLevel},"${item.brand}"\r\n`
      })
    } else if (activeTab === 'purchases') {
      csvContent += '--- NEXAPOS PROCUREMENT & SUPPLIER REPORT ---\r\n'
      csvContent += `Total Orders,${purchaseData?.summary?.totalOrders || 0}\r\n`
      csvContent += `Total Spend (LKR),${purchaseData?.summary?.totalPurchasesVolume || 0}\r\n`
      csvContent += `Total Paid (LKR),${purchaseData?.summary?.totalPaidToSuppliers || 0}\r\n`
      csvContent += `Outstanding Payables (LKR),${purchaseData?.summary?.totalOutstandingPayables || 0}\r\n\r\n`

      csvContent += 'Supplier Breakdown\r\n'
      csvContent += 'Supplier Name,Contact,Total Orders,Total Spent (LKR),Paid (LKR),Outstanding Balance (LKR)\r\n'
      purchaseData?.supplierBreakdown?.forEach((s) => {
        csvContent += `"${s.name}","${s.phone || ''}",${s.totalOrders},${s.totalSpent},${s.totalPaid},${s.outstandingBalance}\r\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reports & Business Intelligence
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Audited sales velocity, historical transaction-level P&L, stock valuation, and supplier payables.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
            Export to Excel / CSV
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Date Range Selector Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                period === item.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Form */}
        <form onSubmit={handleApplyCustomDates} className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Custom:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <Button type="submit" size="xs" variant="outline">
            Apply
          </Button>
        </form>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Revenue
            </span>
            <DollarSign className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatLKR(salesData?.kpis?.todayRevenue || 0)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {salesData?.kpis?.todayTransactions || 0} bills today
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Period Net Revenue
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatLKR(salesData?.kpis?.periodRevenue || 0)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {salesData?.kpis?.periodTransactions || 0} completed transactions
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Profit (COGS Deducted)
            </span>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatLKR(profitData?.summary?.grossProfit || 0)}
            </span>
          </div>
          <span className="text-xs text-purple-600 font-semibold mt-1 block dark:text-purple-400">
            {profitData?.summary?.grossMarginPercent?.toFixed(1) || 0}% Gross Margin
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg. Transaction Basket
            </span>
            <ShoppingBag className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {formatLKR(salesData?.kpis?.averageTransactionValue || 0)}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Per customer invoice</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: 'sales', label: 'Sales & Revenue Analytics', icon: BarChart3 },
          { id: 'profit', label: 'Profit & Loss Statement (P&L)', icon: DollarSign },
          { id: 'inventory', label: 'Inventory Valuation & Alerts', icon: Package },
          { id: 'purchases', label: 'Procurement & Payables', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: SALES & REVENUE ANALYTICS */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sales Revenue Trend Line Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Sales Revenue Trend
                </h3>
                <p className="text-xs text-slate-400">
                  Gross billed turnover (LKR) over selected period
                </p>
              </div>
              <Badge variant="purple" size="sm">
                Live DB Aggregate
              </Badge>
            </div>

            <div className="h-72 w-full">
              {salesData?.salesTimeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData.salesTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [formatLKR(val), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#8b5cf6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  No sales transactions recorded in this period.
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods & Cashiers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Payment Method */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Sales by Payment Method
              </h3>

              <div className="space-y-3">
                {salesData?.salesByPaymentMethod?.map((item) => {
                  const total = salesData?.kpis?.periodRevenue || 1
                  const pct = ((item.amount / total) * 100).toFixed(1)
                  return (
                    <div key={item.method} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.method.replace('_', ' ')}
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {formatLKR(item.amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.method === 'CASH'
                              ? 'bg-emerald-500'
                              : item.method === 'CARD'
                              ? 'bg-purple-500'
                              : item.method === 'BANK_TRANSFER'
                              ? 'bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sales by Cashier Performance */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-500" />
                Cashier Sales Performance
              </h3>

              {salesData?.salesByCashier?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No cashier sales recorded.</p>
              ) : (
                <div className="space-y-2">
                  {salesData?.salesByCashier?.map((c, i) => (
                    <div
                      key={c.cashierId}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] dark:bg-slate-700 dark:text-slate-300">
                          #{i + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {c.name}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {c.transactions} bills rung up
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatLKR(c.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Best Selling Products & Brands Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Best-Selling Products
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Product & SKU</th>
                      <th className="p-2.5 text-center">Qty Sold</th>
                      <th className="p-2.5 text-right">Revenue (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salesData?.bestSellingProducts?.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </td>
                        <td className="p-2.5 text-center font-semibold">{p.quantitySold}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatLKR(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Brands */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Best-Selling Brands
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Brand</th>
                      <th className="p-2.5 text-center">Qty Sold</th>
                      <th className="p-2.5 text-right">Revenue (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salesData?.bestSellingBrands?.slice(0, 5).map((b) => (
                      <tr key={b.name}>
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {b.name}
                        </td>
                        <td className="p-2.5 text-center font-semibold">{b.quantitySold}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatLKR(b.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT & LOSS STATEMENT (P&L) */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          {/* P&L Financial Statement Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Audited Profit & Loss Statement (P&L)
                </h3>
                <p className="text-xs text-slate-400">
                  Transaction-level historical COGS matching with operating expenses and discounts
                </p>
              </div>
              <Badge variant="purple" size="sm">
                GAAP / LKR Standards
              </Badge>
            </div>

            {/* P&L Rows */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Gross Sales (Itemized Catalog Volume)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatLKR(profitData?.summary?.grossSales || 0)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
                <span>(-) Authorized Discounts (Invoices & Promotional Lines)</span>
                <span>-{formatLKR(profitData?.summary?.discounts || 0)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
                <span>(-) Customer Returns & Cash Refunds</span>
                <span>-{formatLKR(profitData?.summary?.returns || 0)}</span>
              </div>

              <div className="flex justify-between py-2.5 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-lg font-bold text-slate-900 dark:text-white">
                <span>(=) Net Sales Revenue</span>
                <span>{formatLKR(profitData?.summary?.netSales || 0)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400">
                <span>(-) Cost of Goods Sold (COGS - Historical Purchase Cost)</span>
                <span>-{formatLKR(profitData?.summary?.cogs || 0)}</span>
              </div>

              <div className="flex justify-between py-3 bg-purple-50 dark:bg-purple-950/30 px-3 rounded-lg font-bold text-purple-700 dark:text-purple-300 text-base">
                <span>
                  (=) Gross Operating Profit ({profitData?.summary?.grossMarginPercent?.toFixed(1) || 0}% Margin)
                </span>
                <span>{formatLKR(profitData?.summary?.grossProfit || 0)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
                <span>(-) Total Operational Overheads & Shop Expenses</span>
                <span>-{formatLKR(profitData?.summary?.operatingExpenses || 0)}</span>
              </div>

              <div className="flex justify-between py-4 bg-emerald-50 dark:bg-emerald-950/30 px-4 rounded-xl font-black text-emerald-700 dark:text-emerald-300 text-lg border border-emerald-200 dark:border-emerald-800">
                <span>
                  (=) Estimated Net Operating Profit ({profitData?.summary?.netMarginPercent?.toFixed(1) || 0}% Net Margin)
                </span>
                <span>{formatLKR(profitData?.summary?.netOperatingProfit || 0)}</span>
              </div>
            </div>

            {/* Cash Integrity Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Actual Received Cash Flow
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formatLKR(profitData?.summary?.actualCashReceived || 0)}
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Physical currency collected in registers
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Unpaid Customer Receivables (Credit)
                </span>
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                  {formatLKR(profitData?.summary?.unpaidCustomerBalances || 0)}
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Not counted as cash profit until settled
                </span>
              </div>
            </div>
          </div>

          {/* Revenue vs COGS vs Expenses Timeline Bar Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue, Cost of Goods & Net Profit Timeline
            </h3>

            <div className="h-72 w-full">
              {profitData?.profitTimeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitData.profitTimeline}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val) => formatLKR(val)}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="revenue" name="Sales Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cogs" name="COGS" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netProfit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  No financial data available for this range.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY VALUATION & ALERTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Valuation Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Total Valuation at Cost
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                {formatLKR(inventoryData?.summary?.totalCostValuation || 0)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {inventoryData?.summary?.totalItemsInStock || 0} total stock units
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Total Retail Market Value
              </span>
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1 block">
                {formatLKR(inventoryData?.summary?.totalRetailValuation || 0)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {inventoryData?.summary?.totalSerializedInStock || 0} serialized devices
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Potential Gross Margin
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatLKR(inventoryData?.summary?.potentialGrossProfit || 0)}
              </span>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                {inventoryData?.summary?.valuationMarginPercent?.toFixed(1) || 0}% Projected Return
              </span>
            </div>
          </div>

          {/* Stock Alerts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low-Stock Alerts */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Low-Stock Products ({inventoryData?.lowStockProducts?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">At or below reorder threshold</span>
              </div>

              {inventoryData?.lowStockProducts?.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium py-4">All stock levels are optimal!</p>
              ) : (
                <div className="space-y-2">
                  {inventoryData?.lowStockProducts?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          SKU: {item.sku} • {item.brand}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-700 dark:text-amber-300 block">
                          {item.currentStock} in stock
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Reorder at: {item.reorderLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Out-of-Stock Alerts */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Out-of-Stock Products ({inventoryData?.outOfStockProducts?.length || 0})
                </h3>
                <span className="text-xs text-slate-400">Immediate PO required</span>
              </div>

              {inventoryData?.outOfStockProducts?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">Zero stock-outs recorded.</p>
              ) : (
                <div className="space-y-2">
                  {inventoryData?.outOfStockProducts?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          SKU: {item.sku} • {item.brand}
                        </span>
                      </div>
                      <Badge variant="danger" size="sm">
                        0 Units
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROCUREMENT & SUPPLIER PAYABLES */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          {/* Supplier Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Total Procurement Volume
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                {formatLKR(purchaseData?.summary?.totalPurchasesVolume || 0)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {purchaseData?.summary?.totalOrders || 0} purchase orders placed
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Total Payments Disbursed
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatLKR(purchaseData?.summary?.totalPaidToSuppliers || 0)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Paid via bank / cash</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Outstanding Supplier Payables
              </span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                {formatLKR(purchaseData?.summary?.totalOutstandingPayables || 0)}
              </span>
              <span className="text-xs text-rose-500 font-medium mt-1 block">
                Payable liability to vendors
              </span>
            </div>
          </div>

          {/* Supplier Payables Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Supplier Payables & Purchase Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3 text-center">Orders</th>
                    <th className="p-3 text-right">Total Spent (LKR)</th>
                    <th className="p-3 text-right">Settled (LKR)</th>
                    <th className="p-3 text-right">Outstanding (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchaseData?.supplierBreakdown?.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{sup.name}</td>
                      <td className="p-3 text-slate-500">
                        {sup.contactPerson || 'Vendor Rep'} ({sup.phone || 'N/A'})
                      </td>
                      <td className="p-3 text-center font-semibold">{sup.totalOrders}</td>
                      <td className="p-3 text-right font-medium text-slate-900 dark:text-white">
                        {formatLKR(sup.totalSpent)}
                      </td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">
                        {formatLKR(sup.totalPaid)}
                      </td>
                      <td className="p-3 text-right">
                        {sup.outstandingBalance > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatLKR(sup.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Fully Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default ReportsAnalytics
