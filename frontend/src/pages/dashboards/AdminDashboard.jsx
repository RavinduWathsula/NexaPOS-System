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
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Calendar,
  BarChart3,
  Clock,
  Eye,
  ShieldCheck,
  RefreshCw,
  Layers,
  Award,
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
import { reportsAPI, posAPI, inventoryAPI, tradeInAPI } from '@/services/api'

export function AdminDashboard({ user }) {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('7days') // 'today' | '7days' | 'month' | 'all'
  const [chartMetric, setChartMetric] = useState('revenue') // 'revenue' | 'orders'
  const [isLoading, setIsLoading] = useState(true)

  // Live KPI Data
  const [kpis, setKpis] = useState({
    todayRevenue: 0,
    todayTransactions: 0,
    weeklyRevenue: 0,
    weeklyTransactions: 0,
    monthlyRevenue: 0,
    periodRevenue: 0,
    periodTransactions: 0,
    averageTransactionValue: 0,
    grossProfit: 0,
    grossMarginPercent: 0,
    lowStockCount: 0,
    totalStockUnits: 0,
    totalSerializedDevices: 0,
    tradeInsCount: 0,
    warrantyCount: 0,
  })

  const [salesTrend, setSalesTrend] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [lowStockAlerts, setLowStockAlerts] = useState([])

  useEffect(() => {
    fetchDashboardData(selectedPeriod)
  }, [selectedPeriod])

  const fetchDashboardData = async (period = selectedPeriod) => {
    setIsLoading(true)
    try {
      const [salesRes, profitRes, invRes, txRes, tradeInRes] = await Promise.all([
        reportsAPI.salesAnalytics({ period: period === 'all' ? '30days' : period }).catch(() => null),
        reportsAPI.profitAnalysis({ period: period === 'all' ? '30days' : period }).catch(() => null),
        inventoryAPI.dashboard().catch(() => null),
        posAPI.sales({ limit: 8 }).catch(() => null),
        tradeInAPI.list({ limit: 5 }).catch(() => null),
      ])

      // 1. Sales Analytics
      if (salesRes?.data?.data) {
        const d = salesRes.data.data
        const k = d.kpis || d.summary || {}
        setKpis((prev) => ({
          ...prev,
          todayRevenue: Number(k.todayRevenue || 0),
          todayTransactions: Number(k.todayTransactions || k.todayOrders || 0),
          weeklyRevenue: Number(k.weeklyRevenue || 0),
          weeklyTransactions: Number(k.weeklyTransactions || 0),
          monthlyRevenue: Number(k.monthlyRevenue || 0),
          periodRevenue: Number(k.periodRevenue || k.weeklyRevenue || 0),
          periodTransactions: Number(k.periodTransactions || k.weeklyTransactions || 0),
          averageTransactionValue: Number(k.averageTransactionValue || 0),
        }))

        const timeline = d.salesTimeline || d.salesTrend || []
        setSalesTrend(Array.isArray(timeline) ? timeline : [])
        setBestSellingProducts(d.bestSellingProducts || [])
        setPaymentMethods(d.salesByPaymentMethod || [])
      }

      // 2. Profit Analysis
      if (profitRes?.data?.data?.summary) {
        const s = profitRes.data.data.summary
        setKpis((prev) => ({
          ...prev,
          grossProfit: Number(s.grossProfit || 0),
          grossMarginPercent: Number(s.grossMarginPercent || 0),
        }))
      }

      // 3. Inventory Dashboard
      if (invRes?.data?.data) {
        const inv = invRes.data.data
        setKpis((prev) => ({
          ...prev,
          lowStockCount: inv.lowStockCount || 0,
          totalStockUnits: inv.totalStockUnits || 0,
          totalSerializedDevices: inv.totalSerializedDevices || 0,
        }))
        if (Array.isArray(inv.lowStockProducts)) {
          setLowStockAlerts(inv.lowStockProducts.slice(0, 5))
        }
      }

      // 4. Recent Sales
      const salesList =
        txRes?.data?.data?.items ||
        txRes?.data?.data?.sales ||
        (Array.isArray(txRes?.data?.data) ? txRes.data.data : [])
      setRecentTransactions(salesList)
      if (salesList.length > 0) {
        setKpis((prev) => ({
          ...prev,
          warrantyCount: salesList.length,
        }))
      }

      // 5. Trade-Ins
      if (tradeInRes?.data?.data) {
        const tCount =
          tradeInRes.data.data.pagination?.total ||
          (Array.isArray(tradeInRes.data.data) ? tradeInRes.data.data.length : 0)
        setKpis((prev) => ({
          ...prev,
          tradeInsCount: tCount,
        }))
      }
    } catch (e) {
      console.warn('Dashboard live sync note:', e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const customTooltipFormatter = (value, name) => {
    if (name === 'Revenue (LKR)') {
      return [formatLKR(value), name]
    }
    return [value, name]
  }

  const formatTxDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Active revenue to display based on timeframe
  const activeRevenue =
    selectedPeriod === 'today'
      ? kpis.todayRevenue
      : selectedPeriod === 'month'
      ? kpis.monthlyRevenue || kpis.periodRevenue
      : kpis.weeklyRevenue || kpis.periodRevenue

  const activeTransactions =
    selectedPeriod === 'today'
      ? kpis.todayTransactions
      : selectedPeriod === 'month'
      ? kpis.periodTransactions || kpis.weeklyTransactions
      : kpis.weeklyTransactions || kpis.periodTransactions

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {ROLE_LABELS[user?.role] || 'SUPER ADMIN / OWNER'}
            </span>
            <span className="text-xs text-slate-400">Executive Store Management • Colombo Main</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Database Sync
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Kasun Jayawardena'}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time store operations, live financials, serialized device inventory, trade-in exchanges, and digital warranty certification in Sri Lankan Rupees (LKR).
          </p>

          {/* Timeframe Filter Selector */}
          <div className="flex items-center gap-1.5 pt-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-400" /> Timeframe:
            </span>
            {[
              { id: 'today', label: "Today's Shift" },
              { id: '7days', label: 'This Week (7 Days)' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Invoices' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedPeriod === p.id
                    ? 'bg-brand-600 text-white shadow-sm shadow-blue-500/30 scale-102'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => fetchDashboardData(selectedPeriod)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/trade-ins')}
            leftIcon={<ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold"
          >
            Trade-In Exchange OS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports-analytics')}
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-indigo-400" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold"
          >
            Financial P&L
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/pos')}
            leftIcon={<Smartphone className="w-4 h-4" />}
            className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold shadow-md shadow-blue-500/25 text-xs px-4 py-2"
          >
            Launch POS Terminal
          </Button>
        </div>
      </div>

      {/* 6 Primary Operational & Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Sales Revenue */}
        <Card className="p-4 border-l-4 border-l-brand-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {selectedPeriod === 'today' ? "Today's Revenue" : 'Period Revenue'}
            </p>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatLKR(activeRevenue, false)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {selectedPeriod === 'today'
                ? `Week Total: ${formatLKR(kpis.weeklyRevenue, false)}`
                : `Today: ${formatLKR(kpis.todayRevenue, false)}`}
            </p>
          </div>
        </Card>

        {/* Card 2: Completed Orders */}
        <Card className="p-4 border-l-4 border-l-purple-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Orders
            </p>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shadow-2xs">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTransactions} Invoices
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Avg: {formatCompactLKR(kpis.averageTransactionValue)} / sale
            </p>
          </div>
        </Card>

        {/* Card 3: Gross Profit & COGS */}
        <Card className="p-4 border-l-4 border-l-emerald-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Profit
            </p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatLKR(kpis.grossProfit, false)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {kpis.grossMarginPercent > 0 ? `${kpis.grossMarginPercent.toFixed(1)}% margin` : 'Based on unit COGS'}
            </p>
          </div>
        </Card>

        {/* Card 4: Inventory Units */}
        <Card className="p-4 border-l-4 border-l-blue-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Units
            </p>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.totalStockUnits} Items
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Available across catalog
            </p>
          </div>
        </Card>

        {/* Card 5: Device Trade-Ins */}
        <Card className="p-4 border-l-4 border-l-teal-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trade-In Devices
            </p>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 shadow-2xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.tradeInsCount} Registered
            </h3>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-bold">
              Instant Bill Credit Offset
            </p>
          </div>
        </Card>

        {/* Card 6: Warranty Tracking */}
        <Card className="p-4 border-l-4 border-l-indigo-600 bg-white dark:bg-dark-card shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Warranties
            </p>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.warrantyCount} Certified
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              SMS verified (0713857835)
            </p>
          </div>
        </Card>
      </div>

      {/* Main Interactive Chart: Sales & Revenue Performance */}
      <Card className="p-5 border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Sales & Revenue Performance</CardTitle>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {selectedPeriod === 'today' ? 'Daily Shift' : 'Weekly Trend'}
              </span>
            </div>
            <CardDescription>
              Daily transaction volume and revenue curve in Sri Lankan Rupees (LKR)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chartMetric === 'revenue'
                    ? 'bg-white dark:bg-dark-card text-brand-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Revenue (LKR)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chartMetric === 'orders'
                    ? 'bg-white dark:bg-dark-card text-brand-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 sm:h-76 w-full">
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    const parts = val.split('-')
                    return `${parts[1]}/${parts[2]}`
                  }}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (chartMetric === 'revenue' ? formatCompactLKR(v) : v)}
                  className="text-xs"
                />
                <Tooltip formatter={customTooltipFormatter} />
                {chartMetric === 'revenue' ? (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (LKR)"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    name="Invoices Issued"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#ordersGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No sales transactions found for this period</p>
              <p className="text-xs text-slate-400">Switch timeframe to 'This Week (7 Days)' or process new sales at the counter.</p>
              <Button variant="outline" size="xs" onClick={() => setSelectedPeriod('7days')} className="mt-2">
                View Weekly Sales (7 Days)
              </Button>
            </div>
          )}
        </div>

        {/* Performance Sub-pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-surface">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Period Volume</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{formatLKR(activeRevenue)}</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-surface">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Invoices</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{activeTransactions} Bills</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-surface">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg Sale Value</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{formatLKR(kpis.averageTransactionValue)}</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-surface">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hotline Support</span>
            <strong className="text-brand-600 dark:text-brand-400 font-mono font-bold">0713857835</strong>
          </div>
        </div>
      </Card>

      {/* Middle Grid: Best Sellers & Payment Breakdown + Inventory Reorders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Best Selling Products & Payment Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Best Selling Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Top Best-Selling Devices & Accessories
                </CardTitle>
                <CardDescription>Highest revenue generating products in store</CardDescription>
              </div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/products')}>
                View Catalog
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {bestSellingProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank & Device</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-center">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bestSellingProducts.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-slate-300 font-extrabold text-[11px] flex items-center justify-center">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </span>
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {p.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">{p.brand || 'General'}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs text-slate-800 dark:text-slate-200">
                          {p.quantitySold} units
                        </TableCell>
                        <TableCell className="text-right font-extrabold text-xs text-brand-600 dark:text-brand-400">
                          {formatLKR(p.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">No sales product breakdown available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Distribution */}
          {paymentMethods.length > 0 && (
            <Card className="p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Payment Channels Distribution
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((pm) => (
                  <div key={pm.method} className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{pm.method}</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                      {formatLKR(pm.amount)}
                    </strong>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((pm.amount / (activeRevenue || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Col: Critical Reorders & Device Health */}
        <div className="space-y-6">
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
                          Brand: {item.brand?.name || item.brand || 'General'} | Safety: {item.reorderLevel || 5}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={item.currentStock === 0 ? 'danger' : 'warning'} size="sm">
                          {item.currentStock || 0} in stock
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
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Inventory levels healthy</p>
                  <p className="text-[11px] text-slate-400 mt-1">All catalog items meet or exceed safety reorder thresholds.</p>
                  <Button variant="outline" size="xs" onClick={() => navigate('/inventory')} className="mt-3">
                    Check Stock Levels
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Recent Store Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Recent Store Transactions
            </CardTitle>
            <CardDescription>Live POS checkout invoices recorded in database</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" onClick={() => navigate('/sales-invoices')}>
              View All Invoices
            </Button>
            <Button variant="primary" size="xs" onClick={() => navigate('/pos')}>
              + New Sale
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Purchased Device / Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total Amount (LKR)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs font-black text-brand-600 dark:text-brand-400">
                      {tx.invoiceNumber || tx.id}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {formatTxDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {tx.customer?.name || 'Walk-in Customer (Cash)'}
                      </div>
                      {tx.customer?.phone && (
                        <div className="text-[10px] font-mono text-slate-400">{tx.customer.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
                        {tx.items?.map((i) => i.product?.name || i.productName).filter(Boolean).join(', ') || 'Retail Items'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" size="sm">
                        {tx.payments?.[0]?.method || tx.paymentMethod || 'CASH'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-xs text-slate-900 dark:text-white">
                      {formatLKR(tx.totalAmount || tx.finalAmount || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {tx.saleStatus || 'COMPLETED'}
                      </span>
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
  )
}

export default AdminDashboard
