import React, { useState, useEffect } from 'react'
import {
  Receipt,
  Search,
  RefreshCw,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ThermalReceipt } from '@/components/pos/ThermalReceipt'
import { posAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'

export function SalesInvoices() {
  const [sales, setSales] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  // Receipt Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)

  const fetchSales = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await posAPI.sales({
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentStatus: paymentStatus || undefined,
        page,
        limit: 15,
      })
      setSales(res.data?.data?.items || [])
      setMetrics(res.data?.data?.metrics || null)
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load sales history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSales(1)
  }, [startDate, endDate, paymentStatus])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchSales(1)
  }

  const handleOpenReceipt = async (saleItem) => {
    setIsReceiptOpen(true)
    setReceiptLoading(true)
    try {
      const res = await posAPI.receipt(saleItem.id)
      setActiveReceiptSale(res.data?.data)
    } catch (err) {
      console.error('Failed to get receipt:', err)
      setActiveReceiptSale(saleItem)
    } finally {
      setReceiptLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purpleAccent-600 dark:text-purpleAccent-400">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sales Ledger & Invoices
            </h1>
            <Badge variant="purple" size="sm">
              Retail Audit Trail
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete transaction register, customer invoicing records, payment methods, and 80mm thermal receipt reprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchSales(pagination.page)}
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Invoiced Volume</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatLKR(metrics?.totalRevenue || 0)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{metrics?.totalSalesCount || 0} Transactions</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Collected</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatLKR(metrics?.totalCollected || 0)}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Cash, card & bank settlements</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Receivables / Credit Due</p>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatLKR(metrics?.totalOutstanding || 0)}
          </h3>
          <p className="text-[11px] text-rose-500 mt-0.5">Unsettled customer invoices</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Completed Orders</p>
          <h3 className="text-xl font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">
            {pagination.total} Invoices
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">100% Audit compliant</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
              />

              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface font-medium"
              >
                <option value="">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                <option value="UNPAID">UNPAID</option>
              </select>

              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sales.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No invoices found"
                description="No sales matched your filter query. Completed POS transactions will appear here."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Payment Methods</TableHead>
                  <TableHead>Total (LKR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        #{sale.invoiceNumber}
                      </code>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </span>
                        {sale.customer?.phone && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {sale.customer.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {sale.cashier?.name}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {sale.items?.reduce((sum, i) => sum + i.quantity, 0) || 0} Units
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sale.payments?.map((p, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {p.method}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatLKR(sale.totalAmount)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={sale.paymentStatus === 'PAID' ? 'success' : sale.paymentStatus === 'PARTIALLY_PAID' ? 'warning' : 'danger'}
                        size="sm"
                        dot
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenReceipt(sale)}
                        title="View / Reprint 80mm Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} invoices)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchSales(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchSales(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: Thermal Receipt Reprint Dialog */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Reprint POS Sales Receipt"
        description={`Invoice #${activeReceiptSale?.invoiceNumber || ''}`}
        maxWidth="md"
      >
        {receiptLoading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <ThermalReceipt sale={activeReceiptSale} onClose={() => setIsReceiptOpen(false)} />
        )}
      </Modal>
    </div>
  )
}
