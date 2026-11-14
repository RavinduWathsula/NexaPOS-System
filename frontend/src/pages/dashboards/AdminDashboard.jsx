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
import { ROLE_LABELS } from '@/stores/authStore'

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
]

export function AdminDashboard({ user }) {
  const navigate = useNavigate()
  const [chartView, setChartView] = useState('weekly')

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
            Store operations overview, consolidated financials, and inventory alerts in Sri Lankan Rupees (LKR).
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

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Orders</p>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">48 Invoices</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8.5%
              </span>
              <span className="text-[11px] text-slate-400">avg Rs. 10,109/bill</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated Gross Profit</p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatLKR(112400, false)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">23.1%</span>
              <span className="text-[11px]">COGS margin</span>
            </div>
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
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">14 Products</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600">
              <span className="font-semibold">4 Critical</span>
              <span className="text-[11px] text-slate-400">needs PO reorder</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <CardTitle>Sales & Revenue Performance</CardTitle>
            <CardDescription>Daily sales volume and profit trends for Colombo Branch</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartView === 'weekly' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setChartView('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={chartView === 'monthly' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setChartView('monthly')}
            >
              Monthly P&L
            </Button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'weekly' ? (
              <AreaChart data={weeklySalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactLKR(v)} />
                <Tooltip formatter={customTooltipFormatter} />
                <Area type="monotone" dataKey="sales" name="Sales (LKR)" stroke="#2563eb" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            ) : (
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactLKR(v)} />
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
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
                <CardDescription>Live POS checkout invoices processed today</CardDescription>
              </div>
              <Button variant="ghost" size="xs" onClick={() => navigate('/sales-invoices')}>
                View All Invoices
              </Button>
            </CardHeader>
            <CardContent className="p-0">
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
                        {tx.id}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">{tx.customer}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{tx.items}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" size="sm">{tx.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs">
                        {formatLKR(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      Brand: {item.brand} | Safety Level: {item.reorderLevel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={item.status === 'Critical' ? 'danger' : 'warning'} size="sm">
                      {item.currentStock} left
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

