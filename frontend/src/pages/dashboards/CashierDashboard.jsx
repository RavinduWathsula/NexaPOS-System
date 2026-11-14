import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Smartphone,
  Receipt,
  RotateCcw,
  Users,
  CreditCard,
  Banknote,
  Clock,
  ArrowRight,
  ScanLine,
  CheckCircle2,
  DollarSign,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { formatLKR } from '@/utils/currency'

const cashierRecentBills = [
  {
    id: 'INV-2024-10492',
    customer: 'Kamal Jayawardena',
    time: '12 mins ago',
    items: 'iPhone 15 Pro (256GB Titanium)',
    paymentMethod: 'Split (Cash + Card)',
    amount: 435000,
  },
  {
    id: 'INV-2024-10491',
    customer: 'Nadeeka Senanayake',
    time: '45 mins ago',
    items: 'Samsung Galaxy S24 Ultra',
    paymentMethod: 'Credit Card',
    amount: 465000,
  },
  {
    id: 'INV-2024-10490',
    customer: 'Dilan Ranasinghe',
    time: '1 hour ago',
    items: 'Apple AirPods Pro Gen 2',
    paymentMethod: 'Cash',
    amount: 88500,
  },
  {
    id: 'INV-2024-10489',
    customer: 'Sanjaya Rathnayake',
    time: '2 hours ago',
    items: 'Anker PowerCore 20000mAh',
    paymentMethod: 'Bank Transfer',
    amount: 24500,
  },
]

export function CashierDashboard({ user }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-12">
      {/* Cashier Shift Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Cashier Billing Counter 01
            </span>
            <Badge variant="success" size="sm">
              Shift Active / Open
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {user?.name || 'Cashier'}
          </h1>
          <p className="text-xs text-emerald-200/80">
            Current drawer session opened at 08:30 AM. Ready to scan barcodes and process retail sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/pos')}
            leftIcon={<Smartphone className="w-5 h-5" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md text-sm px-6 py-3"
          >
            Launch POS Terminal
          </Button>
        </div>
      </div>

      {/* Cashier Shift Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cash in Drawer</p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatLKR(138500, false)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Includes Rs. 50,000 opening float</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Card & Bank Transfers</p>
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatLKR(874500, false)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Settled to merchant bank terminal</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">My Bills Processed</p>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">28 Receipts</h3>
            <p className="text-[11px] text-slate-400 mt-1">Average checkout speed: 1.8 mins</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Returns Handled</p>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">1 Return (RMA)</h3>
            <p className="text-[11px] text-slate-400 mt-1">Rs. 24,500 exchange processed</p>
          </div>
        </Card>
      </div>

      {/* Quick Cashier Operational Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/pos')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-emerald-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                POS Billing Terminal
              </p>
              <p className="text-xs text-slate-400">Create new invoice & scan items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/sales-invoices')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                Search Invoices / Receipts
              </p>
              <p className="text-xs text-slate-400">Reprint thermal bill or lookup sale</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/returns')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-amber-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                Process Return / Exchange
              </p>
              <p className="text-xs text-slate-400">Inspect device & issue credit</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Cashier Today Invoices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>My Invoices Issued Today</CardTitle>
            <CardDescription>Live bills processed during your current counter session</CardDescription>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/sales-invoices')}>
            All Counter Invoices
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Purchased Item</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount (LKR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashierRecentBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {bill.id}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900 dark:text-white">
                    {bill.customer}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 truncate max-w-xs">
                    {bill.items}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">{bill.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs">
                    {formatLKR(bill.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

