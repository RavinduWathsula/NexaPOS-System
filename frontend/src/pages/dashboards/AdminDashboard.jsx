import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Package,
  AlertTriangle,
  Coins,
  Smartphone,
  ScanLine,
  ArrowRight,
  Inbox,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLKR, formatCompactLKR } from '@/utils/currency'
import { ROLE_LABELS } from '@/stores/authStore'
import { reportsAPI, posAPI, inventoryAPI } from '@/services/api'

export function AdminDashboard({ user }) {
  const navigate = useNavigate()
  const [chartView, setChartView] = useState('weekly')
  const [isLoading, setIsLoading] = useState(true)

  // Live KPI Data
  const [kpis, setKpis] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    grossProfit: 0,
    profitMargin: 0,
    lowStockCount: 0,
  })

  const [salesTrend, setSalesTrend] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [lowStockAlerts, setLowStockAlerts] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Sales Analytics
      const salesRes = await reportsAPI.salesAnalytics({ period: '7days' }).catch(() => null)
      if (salesRes?.data?.data) {
        const d = salesRes.data.data
        setKpis((prev) => ({
          ...prev,
          todayRevenue: d.summary?.todayRevenue || 0,
          todayOrders: d.summary?.todayOrders || 0,
          grossProfit: d.summary?.grossProfit || 0,
          profitMargin: d.summary?.profitMargin || 0,
        }))
        if (Array.isArray(d.salesTrend)) {
          setSalesTrend(d.salesTrend)
        }
      }

      // 2. Fetch Inventory Dashboard (low stock count & items)
      const invRes = await inventoryAPI.dashboard().catch(() => null)
      if (invRes?.data?.data) {
        const d = invRes.data.data
        setKpis((prev) => ({
          ...prev,
          lowStockCount: d.lowStockCount || d.lowStockProducts?.length || 0,
        }))
        if (Array.isArray(d.lowStockProducts)) {
          setLowStockAlerts(d.lowStockProducts.slice(0, 5))
        }
      }

      // 3. Fetch Recent Sales / Invoices
      const txRes = await posAPI.sales({ limit: 5 }).catch(() => null)
      if (txRes?.data?.data?.sales) {
        setRecentTransactions(txRes.data.data.sales)
      } else if (Array.isArray(txRes?.data?.data)) {
        setRecentTransactions(txRes.data.data.slice(0, 5))
      }
    } catch (e) {
      console.warn('Dashboard live sync note:', e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const customTooltipFormatter = (value) => [formatLKR(value), '']

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {ROLE_LABELS[user?.role] || 'Admin Access'}
            </span>
            <span className="text-xs text-slate-400">Executive Store Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time store operations, live financials, and inventory alerts in Sri Lankan Rupees (LKR).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports-analytics')}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Financial Reports
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/pos')}
            leftIcon={<Smartphone className="w-4 h-4" />}
          >
            Launch POS Terminal
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Revenue</p>
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatLKR(kpis.todayRevenue, false)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Live sales collected today</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Orders</p>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {kpis.todayOrders} Invoices
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Processed today</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gross Profit</p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatLKR(kpis.grossProfit, false)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Based on historical COGS</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Low Stock Warnings</p>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {kpis.lowStockCount} Products
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Below safety stock threshold</p>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <CardTitle>Sales & Revenue Performance</CardTitle>
            <CardDescription>Daily sales volume and revenue trend</CardDescription>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full flex items-center justify-center">
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactLKR(v)} />
                <Tooltip formatter={customTooltipFormatter} />
                <Area type="monotone" dataKey="revenue" name="Revenue (LKR)" stroke="#2563eb" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No sales transactions recorded yet</p>
              <p className="text-xs text-slate-400">Sales revenue graphs will appear here automatically when transactions occur.</p>
              <Button variant="outline" size="xs" onClick={() => navigate('/pos')} className="mt-2">
                Go to POS Terminal
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Grid: Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Store Transactions</CardTitle>
                <CardDescription>Live POS checkout invoices</CardDescription>
              </div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/sales-invoices')}>
                View All Invoices
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                          {tx.invoiceNumber || tx.id}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {tx.customer?.name || 'Walk-in Customer'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.items?.map((i) => i.productName || i.product?.name).join(', ') || 'Retail Sale'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">{tx.paymentMethod || 'CASH'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs">
                          {formatLKR(tx.finalAmount || tx.grandTotal || tx.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 px-4 text-center">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No transactions recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Start scanning products and issuing invoices from the POS Terminal.</p>
                  <Button variant="outline" size="xs" onClick={() => navigate('/pos')} className="mt-3">
                    Open POS Terminal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Critical Reorders */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Inventory Reorders
              </CardTitle>
              <CardDescription>Items at or below safety stock threshold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockAlerts.length > 0 ? (
                <>
                  {lowStockAlerts.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Brand: {item.brand?.name || item.brand || 'General'} | Safety Level: {item.lowStockThreshold || item.reorderLevel || 5}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="danger" size="sm">
                          {item.currentStock || item.stock || 0} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate('/inventory')}
                  >
                    Go to Inventory Management
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Inventory levels healthy</p>
                  <p className="text-[11px] text-slate-400 mt-1">No items currently below safety reorder threshold.</p>
                  <Button variant="outline" size="xs" onClick={() => navigate('/products')} className="mt-3">
                    Add Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
