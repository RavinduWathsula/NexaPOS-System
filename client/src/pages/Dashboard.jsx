import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Package,
  AlertTriangle,
  Coins,
  Wrench,
  Smartphone,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Filter,
  ShieldCheck,
  ChevronRight,
  Eye,
  ScanLine,
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
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { formatLKR, formatCompactLKR } from '@/utils/currency'
import { useAuthStore, ROLE_LABELS } from '@/stores/authStore'

// Realistic sample data for Electronics & Mobile POS
const weeklySalesData = [
  { day: 'Mon', sales: 340000, profit: 82000, orders: 28 },
  { day: 'Tue', sales: 420000, profit: 98000, orders: 36 },
  { day: 'Wed', sales: 290000, profit: 64000, orders: 22 },
  { day: 'Thu', sales: 510000, profit: 125000, orders: 41 },
  { day: 'Fri', sales: 630000, profit: 148000, orders: 54 },
  { day: 'Sat', sales: 890000, profit: 215000, orders: 78 },
  { day: 'Sun', sales: 740000, profit: 178000, orders: 62 },
]

const monthlyRevenueData = [
  { month: 'Jan', revenue: 7800000, cost: 6100000, profit: 1700000 },
  { month: 'Feb', revenue: 8400000, cost: 6500000, profit: 1900000 },
  { month: 'Mar', revenue: 9200000, cost: 7100000, profit: 2100000 },
  { month: 'Apr', revenue: 8900000, cost: 6900000, profit: 2000000 },
  { month: 'May', revenue: 10400000, cost: 8000000, profit: 2400000 },
  { month: 'Jun', revenue: 12200000, cost: 9300000, profit: 2900000 },
]

const recentTransactions = [
  {
    id: 'INV-2024-10492',
    customer: 'Kamal Jayawardena',
    phone: '077 123 4567',
    items: 'iPhone 15 Pro (256GB Titanium) + 20W Adapter',
    paymentMethod: 'Split (Cash + Card)',
    status: 'Completed',
    amount: 435000,
    time: '12 mins ago',
    cashier: 'Chamari',
    imeiCount: 1,
  },
  {
    id: 'INV-2024-10491',
    customer: 'Nadeeka Senanayake',
    phone: '071 889 2311',
    items: 'Samsung Galaxy S24 Ultra (512GB Grey)',
    paymentMethod: 'Credit Card (Visa)',
    status: 'Completed',
    amount: 465000,
    time: '45 mins ago',
    cashier: 'Chamari',
    imeiCount: 1,
  },
  {
    id: 'INV-2024-10490',
    customer: 'Dilan Ranasinghe',
    phone: '076 443 1928',
    items: 'Apple AirPods Pro (Gen 2 USB-C) + MagSafe Case',
    paymentMethod: 'Cash',
    status: 'Completed',
    amount: 88500,
    time: '1 hour ago',
    cashier: 'Chamari',
    imeiCount: 1,
  },
  {
    id: 'INV-2024-10489',
    customer: 'Sanjaya Rathnayake',
    phone: '072 901 8832',
    items: 'Anker PowerCore 20000mAh + Type-C Braided Cable',
    paymentMethod: 'Bank Transfer',
    status: 'Completed',
    amount: 24500,
    time: '2 hours ago',
    cashier: 'Chamari',
    imeiCount: 0,
  },
  {
    id: 'INV-2024-10488',
    customer: 'Pasan Weerasinghe',
    phone: '075 512 3490',
    items: 'Xiaomi Redmi Note 13 Pro (8GB/256GB Black)',
    paymentMethod: 'Card (Mastercard)',
    status: 'Completed',
    amount: 89000,
    time: '3 hours ago',
    cashier: 'Chamari',
    imeiCount: 1,
  },
]

const topSellingProducts = [
  {
    id: 'prod_1',
    name: 'Apple iPhone 15 Pro (256GB)',
    category: 'Smartphones',
    brand: 'Apple',
    unitsSold: 42,
    revenue: 18270000,
    stock: 8,
    isSerialized: true,
  },
  {
    id: 'prod_2',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Smartphones',
    brand: 'Samsung',
    unitsSold: 35,
    revenue: 16275000,
    stock: 5,
    isSerialized: true,
  },
  {
    id: 'prod_3',
    name: 'Apple 20W USB-C Power Adapter',
    category: 'Accessories',
    brand: 'Apple',
    unitsSold: 128,
    revenue: 1088000,
    stock: 45,
    isSerialized: false,
  },
  {
    id: 'prod_4',
    name: 'Anker 313 Fast Charger 45W',
    category: 'Accessories',
    brand: 'Anker',
    unitsSold: 94,
    revenue: 799000,
    stock: 22,
    isSerialized: false,
  },
  {
    id: 'prod_5',
    name: 'Baseus 9H Tempered Glass for iPhone 15',
    category: 'Protection',
    brand: 'Baseus',
    unitsSold: 210,
    revenue: 525000,
    stock: 85,
    isSerialized: false,
  },
]

const lowStockAlerts = [
  {
    id: 'prod_ls_1',
    name: 'Apple iPhone 15 Pro Max (256GB Titanium)',
    brand: 'Apple',
    currentStock: 2,
    reorderLevel: 5,
    status: 'Critical',
    isSerialized: true,
  },
  {
    id: 'prod_ls_2',
    name: 'Sony WH-1000XM5 Noise Cancelling',
    brand: 'Sony',
    currentStock: 1,
    reorderLevel: 3,
    status: 'Critical',
    isSerialized: true,
  },
  {
    id: 'prod_ls_3',
    name: 'Samsung 25W Fast Wall Charger',
    brand: 'Samsung',
    currentStock: 4,
    reorderLevel: 15,
    status: 'Low',
    isSerialized: false,
  },
  {
    id: 'prod_ls_4',
    name: 'Spigen Ultra Hybrid Case iPhone 15',
    brand: 'Spigen',
    currentStock: 3,
    reorderLevel: 10,
    status: 'Low',
    isSerialized: false,
  },
]

const recentActivities = [
  {
    id: 'act_1',
    action: 'New Device Sold & Warranty Generated',
    details: 'iPhone 15 Pro (IMEI: 354892019482910) sold to Kamal Jayawardena. 1-Year Apple Care warranty initialized.',
    time: '12 mins ago',
    icon: ShieldCheck,
    color: 'text-purpleAccent-500 bg-purpleAccent-50 dark:bg-purpleAccent-950/40',
  },
  {
    id: 'act_2',
    action: 'Repair Marked as Completed',
    details: 'Technician Dinesh completed display replacement for Samsung S23 Ultra (#REP-2024-089).',
    time: '35 mins ago',
    icon: Wrench,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'act_3',
    action: 'IMEI Verification & Stock Intake',
    details: 'Stock keeper Roshan scanned & registered 25 new iPhone 16 devices from PO #8821.',
    time: '2 hours ago',
    icon: ScanLine,
    color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
  },
  {
    id: 'act_4',
    action: 'Supplier Invoice Settled',
    details: 'Singer Sri Lanka payment of Rs. 1,250,000 recorded via Commercial Bank Transfer.',
    time: '4 hours ago',
    icon: CheckCircle2,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40',
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chartView, setChartView] = useState('weekly') // 'weekly' or 'monthly'

  const customTooltipFormatter = (value) => [formatLKR(value), '']

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-purpleAccent-900 text-white shadow-premium-dark border border-brand-700/40 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-12 w-64 h-64 rounded-full bg-purpleAccent-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
              {ROLE_LABELS[user?.role] || 'Admin Access'}
            </span>
            <span className="text-xs text-brand-200">
              Live Store Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/80 max-w-xl">
            Here is the live retail performance for NexaPOS electronics store today. 
            All values formatted in <strong className="text-white">Sri Lankan Rupees (LKR)</strong>.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/imei-devices')}
            leftIcon={<ScanLine className="w-4 h-4" />}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
          >
            Track IMEI
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/pos')}
            leftIcon={<Smartphone className="w-4 h-4" />}
            className="bg-white text-brand-900 hover:bg-brand-50 shadow-lg font-bold"
          >
            Launch POS
          </Button>
        </div>
      </div>

      {/* 6 Key Performance Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Sales */}
        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Today's Sales
            </p>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {formatLKR(485250, false)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
              </span>
              <span className="text-[11px] text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Total Orders */}
        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Total Orders
            </p>
            <div className="p-2 rounded-xl bg-purpleAccent-50 dark:bg-purpleAccent-950/40 text-purpleAccent-600 dark:text-purpleAccent-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              48 Orders
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8.5%
              </span>
              <span className="text-[11px] text-slate-400">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Total Products */}
        <Card hover className="p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Total Products
            </p>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1,420 SKUs
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-600 dark:text-sky-400">860</span>
              <span className="text-[11px]">IMEI Serialized</span>
            </div>
          </div>
        </Card>

        {/* Card 4: Low Stock Items */}
        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Low Stock Items
            </p>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              14 Items
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500">
              <span className="font-semibold">4 Critical</span>
              <span className="text-[11px] text-slate-400">reorder now</span>
            </div>
          </div>
        </Card>

        {/* Card 5: Estimated Profit */}
        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Estimated Profit
            </p>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {formatLKR(112800, false)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="font-bold">23.2%</span>
              <span className="text-[11px] text-slate-400">avg margin</span>
            </div>
          </div>
        </Card>

        {/* Card 6: Pending Repairs */}
        <Card hover className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Pending Repairs
            </p>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
              8 Devices
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">3 Ready</span>
              <span className="text-[11px] text-slate-400">for pickup</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly / Monthly Revenue Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Sales & Revenue Analytics</CardTitle>
              <CardDescription>
                Live revenue & estimated profit trends in LKR
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-surface p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartView === 'weekly'
                    ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartView === 'monthly'
                    ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly (6M)
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'weekly' ? (
                  <AreaChart
                    data={weeklySalesData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(val) => formatCompactLKR(val)}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={customTooltipFormatter}
                      contentStyle={{
                        backgroundColor: '#111D4A',
                        borderRadius: '12px',
                        border: '1px solid #243258',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Sales Revenue"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Est. Gross Profit"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#profitGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={monthlyRevenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(val) => formatCompactLKR(val)}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={customTooltipFormatter}
                      contentStyle={{
                        backgroundColor: '#111D4A',
                        borderRadius: '12px',
                        border: '1px solid #243258',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Total Revenue"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      name="Net Margin"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Top Selling Devices</CardTitle>
              <CardDescription>Most popular models this week</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/products')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-3.5">
            {topSellingProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-surface/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-dark-surface text-xs font-bold text-slate-500">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{prod.brand}</span>
                      <span>•</span>
                      <span>{prod.unitsSold} units sold</span>
                      {prod.isSerialized && (
                        <span className="px-1 py-0.2 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300 font-medium">
                          IMEI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCompactLKR(prod.revenue)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {prod.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Recent Transactions Table & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest customer sales and split payment invoices
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/sales-invoices')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              All Invoices
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items / Device</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total (LKR)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-semibold text-brand-600 dark:text-brand-400 text-xs">
                      {tx.id}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tx.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-white text-xs">
                      {tx.customer}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {tx.items}
                    </div>
                    {tx.imeiCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-purpleAccent-600 dark:text-purpleAccent-400 font-medium">
                        <ScanLine className="w-3 h-3" /> {tx.imeiCount} Serialized Unit
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {tx.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {formatLKR(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => navigate('/sales-invoices')}
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Low Stock Alerts & Fast Action */}
        <div className="space-y-4">
          <Card className="border-rose-200/60 dark:border-rose-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock Inventory
                </CardTitle>
                <CardDescription>
                  Items below minimum reorder threshold
                </CardDescription>
              </div>
              <Badge variant="danger" size="sm">
                4 Critical
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Reorder level: {item.reorderLevel} units
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                      {item.currentStock} left
                    </span>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/purchases')}
              >
                Create Purchase Order
              </Button>
            </CardContent>
          </Card>

          {/* Quick Repair Status Widget */}
          <Card className="border-amber-200/60 dark:border-amber-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                <Wrench className="w-4 h-4" />
                Service & Repair Queue
              </CardTitle>
              <Badge variant="warning" size="sm">
                8 Active
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                3 devices tested and ready for customer pickup at Colombo store.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate('/repair-management')}
              >
                Manage Repairs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Live System Audit Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Store Operations & Activities</CardTitle>
          <CardDescription>
            Live audit log of IMEI registrations, warranties, sales, and inventory changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {recentActivities.map((act) => {
              const Icon = act.icon
              return (
                <div key={act.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {act.action}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {act.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {act.time}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

