import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  Smartphone,
  Search,
  RefreshCw,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Battery,
  ShieldAlert,
  Wrench,
  Check,
  Tag,
  DollarSign,
  User,
  Phone,
  FileText,
  Boxes,
  Plus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ThermalReceipt } from '@/components/pos/ThermalReceipt'
import { tradeInAPI, posAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'

export function TradeInManagement() {
  const [tradeIns, setTradeIns] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [gradeFilter, setGradeFilter] = useState('ALL')

  // Status Update Modal
  const [selectedTradeIn, setSelectedTradeIn] = useState(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState('RECEIVED')
  const [editResalePrice, setEditResalePrice] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  // Linked Sale Receipt Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)

  const fetchTradeIns = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await tradeInAPI.list({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        conditionGrade: gradeFilter !== 'ALL' ? gradeFilter : undefined,
        page,
        limit: 15,
      })
      setTradeIns(res.data?.data?.items || [])
      setMetrics(res.data?.data?.metrics || null)
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load trade-in history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTradeIns(1)
  }, [statusFilter, gradeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchTradeIns(1)
  }

  const handleOpenStatusModal = (tradeIn) => {
    setSelectedTradeIn(tradeIn)
    setEditStatus(tradeIn.status || 'RECEIVED')
    setEditResalePrice(tradeIn.resalePrice ? String(tradeIn.resalePrice) : '')
    setEditNotes(tradeIn.notes || '')
    setUpdateError('')
    setIsStatusModalOpen(true)
  }

  const handleSaveStatus = async (e) => {
    e.preventDefault()
    if (!selectedTradeIn) return
    setIsUpdating(true)
    setUpdateError('')
    try {
      await tradeInAPI.updateStatus(selectedTradeIn.id, {
        status: editStatus,
        resalePrice: editResalePrice ? Number(editResalePrice) : null,
        notes: editNotes.trim() || null,
      })
      setIsStatusModalOpen(false)
      fetchTradeIns(pagination.page)
    } catch (err) {
      setUpdateError(err.response?.data?.error?.message || 'Failed to update trade-in status.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenReceipt = async (saleId) => {
    if (!saleId) return
    setIsReceiptOpen(true)
    setReceiptLoading(true)
    try {
      const res = await posAPI.receipt(saleId)
      setActiveReceiptSale(res.data?.data)
    } catch (err) {
      console.error('Failed to get receipt:', err)
    } finally {
      setReceiptLoading(false)
    }
  }

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'GRADE_A_PLUS':
        return <Badge variant="success" size="sm">Grade A+ (Mint)</Badge>
      case 'GRADE_A':
        return <Badge variant="brand" size="sm">Grade A (Exc.)</Badge>
      case 'GRADE_B':
        return <Badge variant="secondary" size="sm">Grade B (Good)</Badge>
      case 'GRADE_C':
        return <Badge variant="warning" size="sm">Grade C (Fair)</Badge>
      case 'FAULTY':
        return <Badge variant="danger" size="sm">Faulty</Badge>
      default:
        return <Badge variant="outline" size="sm">{grade || 'Standard'}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return <Badge variant="warning" size="sm" dot>Received</Badge>
      case 'INSPECTED':
        return <Badge variant="brand" size="sm" dot>Inspected</Badge>
      case 'REFURBISHING':
        return <Badge variant="purple" size="sm" dot>Refurbishing</Badge>
      case 'READY_FOR_RESALE':
        return <Badge variant="success" size="sm" dot>Ready for Resale</Badge>
      case 'RESOLD':
        return <Badge variant="default" size="sm" dot>Resold</Badge>
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Device Trade-In & Upgrade Management
            </h1>
            <Badge variant="warning" size="sm">
              Exchange OS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track customer pre-owned phone exchanges, hardware diagnostic grades, trade-in allowances, and refurbishment resale status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/pos">
            <Button variant="primary" size="sm" className="font-bold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Go to POS Terminal</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchTradeIns(pagination.page)}
            title="Refresh Ledger"
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Total Trade-Ins Handled
          </p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.totalTradeIns || 0} Devices
          </h3>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">
            Total Allowance: {formatLKR(metrics?.totalAllowanceValue || 0)}
          </p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Pre-Owned in Stock
          </p>
          <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {metrics?.inStockCount || 0} Units
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Received or in testing queue</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Target Resale Value
          </p>
          <h3 className="text-xl font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">
            {formatLKR(metrics?.totalResaleValue || 0)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Refurbished resale pool</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Resold & Monetized
          </p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics?.resoldCount || 0} Devices
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Completed second lifecycle</p>
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
                placeholder="Search by IMEI, brand, model, trade-in #, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none min-w-[130px] px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="INSPECTED">Inspected</option>
                <option value="REFURBISHING">Refurbishing</option>
                <option value="READY_FOR_RESALE">Ready for Resale</option>
                <option value="RESOLD">Resold</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="flex-1 sm:flex-none min-w-[130px] px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface font-medium"
              >
                <option value="ALL">All Condition Grades</option>
                <option value="GRADE_A_PLUS">Grade A+ (Mint)</option>
                <option value="GRADE_A">Grade A (Excellent)</option>
                <option value="GRADE_B">Grade B (Good)</option>
                <option value="GRADE_C">Grade C (Fair)</option>
                <option value="FAULTY">Faulty</option>
              </select>

              <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-auto">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Trade-Ins Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tradeIns.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ArrowLeftRight}
                title="No trade-in records found"
                description="When customers bring used phones to exchange at the POS Terminal, trade-in records and IMEI details will appear here."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade-In #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pre-Owned Device</TableHead>
                  <TableHead>IMEI Number</TableHead>
                  <TableHead>Condition Grade</TableHead>
                  <TableHead>Inspection / Battery</TableHead>
                  <TableHead>Allowance Value</TableHead>
                  <TableHead>Resale Status</TableHead>
                  <TableHead>Linked Sale</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeIns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <code className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                        #{t.tradeInNumber}
                      </code>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {t.customer?.name || 'Walk-in Customer'}
                        </span>
                        {t.customer?.phone && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {t.customer.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {t.brand} {t.modelName}
                        </span>
                        {(t.storage || t.color) && (
                          <span className="text-[11px] text-slate-500 block">
                            {t.storage} {t.color}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {t.imei1}
                        </span>
                        {t.imei2 && (
                          <span className="text-[10px] text-slate-400 block">
                            {t.imei2}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getGradeBadge(t.conditionGrade)}</TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        {t.batteryHealth && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Battery className="w-3 h-3" />
                            <span>{t.batteryHealth}%</span>
                          </div>
                        )}
                        {t.screenCondition && (
                          <span className="text-[10px] text-slate-500 block">
                            Screen: {t.screenCondition}
                          </span>
                        )}
                        {t.defectsSummary && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 block truncate max-w-[140px]" title={t.defectsSummary}>
                            {t.defectsSummary}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block font-mono">
                          {formatLKR(t.tradeInValue)}
                        </span>
                        {t.resalePrice && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                            Resale: {formatLKR(t.resalePrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(t.status)}</TableCell>

                    <TableCell>
                      {t.sale ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(t.sale.id)}
                          className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>#{t.sale.invoiceNumber}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenStatusModal(t)}
                          title="Update Status / Resale Pricing"
                        >
                          <Wrench className="w-3.5 h-3.5 text-slate-500 hover:text-amber-600" />
                        </Button>
                        {t.sale && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenReceipt(t.sale.id)}
                            title="View Linked Invoice & Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTradeIns(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTradeIns(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: Update Status & Resale Pricing */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Trade-In Status & Resale Valuation"
        description={`Manage pre-owned ${selectedTradeIn?.brand || ''} ${selectedTradeIn?.modelName || ''} (${selectedTradeIn?.tradeInNumber || ''})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          {updateError && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>{selectedTradeIn?.brand} {selectedTradeIn?.modelName}</span>
              <span className="font-mono text-amber-700">Allowance: {formatLKR(selectedTradeIn?.tradeInValue || 0)}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              IMEI: {selectedTradeIn?.imei1} | Condition: {selectedTradeIn?.conditionGrade}
            </div>
          </div>

          <Select
            label="Inventory / Refurbishment Status *"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: 'RECEIVED', label: 'Received (Pending Detailed Inspection)' },
              { value: 'INSPECTED', label: 'Inspected (Hardware Tested & Verified)' },
              { value: 'REFURBISHING', label: 'Refurbishing (Cleaning / Screen / Battery Work)' },
              { value: 'READY_FOR_RESALE', label: 'Ready for Resale (Pre-Owned Showcase)' },
              { value: 'RESOLD', label: 'Resold (Sold to Second Customer)' },
            ]}
          />

          <Input
            label="Target Resale Price (LKR)"
            type="number"
            min="0"
            value={editResalePrice}
            onChange={(e) => setEditResalePrice(e.target.value)}
            placeholder="e.g. 58000"
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Refurbishment Notes / Storage Location
            </label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Battery tested at 84%, back polished, stored in Pre-Owned Showcase B"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
              className="font-bold"
            >
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Linked Invoice & Sales Receipt Dialog */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Sales Invoice & Warranty Certificate"
        description={`Invoice #${activeReceiptSale?.invoiceNumber || ''}`}
        maxWidth="4xl"
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
