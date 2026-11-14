import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Barcode,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  Layers,
  FileCheck,
  Calendar,
  AlertTriangle,
  Building,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { purchasesAPI, suppliersAPI, productsAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function Purchases() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)
  const canPay = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')

  // Create PO Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [poSupplierId, setPoSupplierId] = useState('')
  const [poSupplierInvoice, setPoSupplierInvoice] = useState('')
  const [poDeliveryDate, setPoDeliveryDate] = useState('')
  const [poTax, setPoTax] = useState('0')
  const [poNotes, setPoNotes] = useState('')
  const [poReceiveImmediately, setPoReceiveImmediately] = useState(true)
  const [poItems, setPoItems] = useState([
    { productId: '', quantity: 1, unitCost: 0, isSerialized: false, imeisText: '', color: '', storage: '' },
  ])
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState('')

  // Details Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activePurchase, setActivePurchase] = useState(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentPurchase, setPaymentPurchase] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER')
  const [payRef, setPayRef] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [paySubmitting, setPaySubmitting] = useState(false)
  const [payError, setPayError] = useState('')

  // Confirm Received Modal
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [receivePurchaseTarget, setReceivePurchaseTarget] = useState(null)
  const [receiveNotes, setReceiveNotes] = useState('')
  const [receiveSubmitting, setReceiveSubmitting] = useState(false)
  const [receiveError, setReceiveError] = useState('')

  const fetchAuxiliary = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        suppliersAPI.list({ limit: 100 }),
        productsAPI.list({ limit: 100 }),
      ])
      setSuppliers(supRes.data?.data?.items || [])
      setAvailableProducts(prodRes.data?.data?.items || [])
    } catch (e) {
      console.error('Error fetching suppliers or products:', e)
    }
  }

  const fetchPurchases = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await purchasesAPI.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        supplierId: supplierFilter || undefined,
        page,
        limit: 15,
      })
      setPurchases(res.data?.data?.items || [])
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load purchase orders.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuxiliary()
    fetchPurchases(1)
  }, [statusFilter, paymentStatusFilter, supplierFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchPurchases(1)
  }

  // PO Line Items Helpers
  const handleAddItemRow = () => {
    setPoItems([
      ...poItems,
      { productId: '', quantity: 1, unitCost: 0, isSerialized: false, imeisText: '', color: '', storage: '' },
    ])
  }

  const handleRemoveItemRow = (index) => {
    if (poItems.length === 1) return
    const updated = poItems.filter((_, idx) => idx !== index)
    setPoItems(updated)
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...poItems]
    updated[index][field] = value

    if (field === 'productId') {
      const p = availableProducts.find((item) => item.id === value)
      if (p) {
        updated[index].unitCost = Number(p.costPrice || 0)
        updated[index].isSerialized = Boolean(p.isSerialized)
      }
    }
    setPoItems(updated)
  }

  // Create Purchase Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSubmitting(true)

    try {
      // Validate items
      for (const item of poItems) {
        if (!item.productId) {
          throw new Error('Please select a product for all order items.')
        }
        if (Number(item.quantity) < 1) {
          throw new Error('Quantity must be at least 1.')
        }

        // If serialized and receiving immediately, parse IMEIs
        if (item.isSerialized && poReceiveImmediately) {
          const lines = item.imeisText
            .split(/[\r\n,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 8)

          if (lines.length !== Number(item.quantity)) {
            throw new Error(
              `Serialized item requires exactly ${item.quantity} IMEIs, but ${lines.length} were entered.`
            )
          }

          // Check duplicates
          const uniqueSet = new Set(lines)
          if (uniqueSet.size !== lines.length) {
            throw new Error('Duplicate IMEIs found within the scanned list for a serialized product.')
          }

          item.parsedDevices = lines.map((im) => ({
            imei1: im,
            color: item.color || undefined,
            storage: item.storage || undefined,
          }))
        }
      }

      const formattedItems = poItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        devices: item.parsedDevices || undefined,
      }))

      await purchasesAPI.create({
        supplierId: poSupplierId,
        supplierInvoiceNumber: poSupplierInvoice.trim() || undefined,
        deliveryDate: poDeliveryDate || undefined,
        tax: Number(poTax || 0),
        notes: poNotes.trim() || undefined,
        receiveImmediately: poReceiveImmediately,
        items: formattedItems,
      })

      setSuccessMsg('Purchase order generated successfully.')
      setIsCreateOpen(false)
      fetchPurchases(1)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || err.message || 'Failed to create purchase order.')
    } finally {
      setCreateSubmitting(false)
    }
  }

  // Open Details Modal
  const handleOpenDetails = async (po) => {
    setIsDetailsOpen(true)
    setIsDetailsLoading(true)
    try {
      const res = await purchasesAPI.get(po.id)
      setActivePurchase(res.data?.data || po)
    } catch (err) {
      console.error('Failed to get purchase details:', err)
      setActivePurchase(po)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  // Open Payment Modal
  const handleOpenPayment = (po) => {
    setPaymentPurchase(po)
    const remaining = Math.max(0, Number(po.totalAmount) - Number(po.paidAmount))
    setPayAmount(String(remaining))
    setPayMethod('BANK_TRANSFER')
    setPayRef('')
    setPayNotes('')
    setPayError('')
    setIsPaymentOpen(true)
  }

  // Submit Payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentPurchase) return
    setPayError('')
    setPaySubmitting(true)
    try {
      await purchasesAPI.recordPayment(paymentPurchase.id, {
        amount: Number(payAmount),
        method: payMethod,
        transactionRef: payRef.trim() || undefined,
        notes: payNotes.trim() || undefined,
      })
      setSuccessMsg(`Payment of Rs. ${Number(payAmount).toLocaleString()} recorded.`)
      setIsPaymentOpen(false)
      fetchPurchases(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setPayError(err.response?.data?.error?.message || 'Failed to record supplier payment.')
    } finally {
      setPaySubmitting(false)
    }
  }

  // Open Confirm Receive Modal
  const handleOpenReceive = (po) => {
    setReceivePurchaseTarget(po)
    setReceiveNotes('')
    setReceiveError('')
    setIsReceiveOpen(true)
  }

  // Submit Confirm Receive
  const handleReceiveSubmit = async (e) => {
    e.preventDefault()
    if (!receivePurchaseTarget) return
    setReceiveError('')
    setReceiveSubmitting(true)
    try {
      await purchasesAPI.receive(receivePurchaseTarget.id, {
        notes: receiveNotes.trim() || undefined,
      })
      setSuccessMsg(`Goods received! Inventory stock updated for PO #${receivePurchaseTarget.poNumber}.`)
      setIsReceiveOpen(false)
      fetchPurchases(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setReceiveError(err.response?.data?.error?.message || 'Failed to confirm goods receipt.')
    } finally {
      setReceiveSubmitting(false)
    }
  }

  // Cancel PO
  const handleCancelPO = async (po) => {
    if (!window.confirm(`Cancel Purchase Order #${po.poNumber}?`)) return
    try {
      await purchasesAPI.cancel(po.id)
      setSuccessMsg(`Purchase Order #${po.poNumber} cancelled.`)
      fetchPurchases(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not cancel purchase order.')
    }
  }

  // Metrics
  const totalSpend = purchases.reduce((sum, p) => p.status !== 'CANCELLED' ? sum + Number(p.totalAmount) : sum, 0)
  const totalPaid = purchases.reduce((sum, p) => p.status !== 'CANCELLED' ? sum + Number(p.paidAmount) : sum, 0)
  const totalDue = Math.max(0, totalSpend - totalPaid)
  const pendingReceiving = purchases.filter((p) => p.status === 'ORDERED' || p.status === 'PARTIALLY_RECEIVED').length
  const receivedCount = purchases.filter((p) => p.status === 'RECEIVED').length

  const poSubtotal = poItems.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.unitCost || 0)), 0)
  const poTotal = poSubtotal + Number(poTax || 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purpleAccent-600 dark:text-purpleAccent-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Supplier Purchases & GRN
            </h1>
            <Badge variant="purple" size="sm">
              Goods Received Notes
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Procurement workflow: create POs, capture phone IMEIs, confirm warehouse receipt, and disburse partial supplier payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPoSupplierId(suppliers[0]?.id || '')
                setPoSupplierInvoice('')
                setPoDeliveryDate('')
                setPoTax('0')
                setPoNotes('')
                setPoReceiveImmediately(true)
                setPoItems([
                  { productId: availableProducts[0]?.id || '', quantity: 1, unitCost: Number(availableProducts[0]?.costPrice || 0), isSerialized: Boolean(availableProducts[0]?.isSerialized), imeisText: '', color: '', storage: '' },
                ])
                setCreateError('')
                setIsCreateOpen(true)
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow-blue"
            >
              New Purchase Order
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchPurchases(pagination.page)}
            title="Refresh POs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Procurement</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatLKR(totalSpend)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{pagination.total} Total purchase orders</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Received & Stocked</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {receivedCount} POs
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Inventoried into store</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Awaiting Receiving</p>
          <h3 className="text-xl font-bold text-amber-600 mt-1">
            {pendingReceiving} POs
          </h3>
          <p className="text-[11px] text-amber-600 mt-0.5">Pending goods confirmation</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Pending Payables</p>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatLKR(totalDue)}
          </h3>
          <p className="text-[11px] text-rose-500 mt-0.5">Due to distributors</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by PO #, Invoice #, or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Receiving Statuses</option>
                <option value="ORDERED">ORDERED (Pending)</option>
                <option value="RECEIVED">RECEIVED (Inventoried)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Payment Statuses</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                <option value="PAID">PAID (Settled)</option>
              </select>

              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Purchases Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ShoppingBag}
                title="No purchase orders found"
                description="Create a purchase order to intake new phone shipments or accessories."
                actionLabel={canManage ? 'New Purchase Order' : undefined}
                onAction={() => setIsCreateOpen(true)}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number & Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items / Devices</TableHead>
                  <TableHead>Total (LKR)</TableHead>
                  <TableHead>Paid (LKR)</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((po) => {
                  const remaining = Math.max(0, Number(po.totalAmount) - Number(po.paidAmount))
                  return (
                    <TableRow key={po.id}>
                      <TableCell>
                        <div>
                          <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                            #{po.poNumber}
                          </code>
                          {po.supplierInvoiceNumber && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Inv: {po.supplierInvoiceNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                            {po.supplier?.name}
                          </p>
                          {po.supplier?.company && (
                            <span className="text-[11px] text-slate-400">{po.supplier.company}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {po.items?.length || 0} Products ({po._count?.devices || 0} IMEIs)
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatLKR(po.totalAmount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {formatLKR(po.paidAmount)}
                          </span>
                          {remaining > 0 && (
                            <span className="text-[10px] text-rose-500 block">
                              Due: {formatLKR(remaining)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={po.status === 'RECEIVED' ? 'success' : po.status === 'CANCELLED' ? 'default' : 'warning'}
                          size="sm"
                          dot
                        >
                          {po.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={po.paymentStatus === 'PAID' ? 'success' : po.paymentStatus === 'PARTIALLY_PAID' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {po.paymentStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDetails(po)}
                            title="View PO Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                          </Button>

                          {canManage && po.status === 'ORDERED' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenReceive(po)}
                              title="Confirm Goods Received (GRN)"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-600" />
                            </Button>
                          )}

                          {canPay && po.paymentStatus !== 'PAID' && po.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenPayment(po)}
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-slate-500 hover:text-purpleAccent-600" />
                            </Button>
                          )}

                          {canManage && po.status === 'ORDERED' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleCancelPO(po)}
                              title="Cancel PO"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchPurchases(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchPurchases(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Purchase Order & Goods Receiving"
        description="Select supplier, add products, configure purchase unit costs, and scan phone IMEIs."
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Supplier"
              value={poSupplierId}
              onChange={(e) => setPoSupplierId(e.target.value)}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone})
                </option>
              ))}
            </Select>

            <Input
              label="Supplier Bill / Invoice #"
              value={poSupplierInvoice}
              onChange={(e) => setPoSupplierInvoice(e.target.value)}
              placeholder="e.g. INV-SL-90812"
            />

            <Input
              label="Expected Delivery Date"
              type="date"
              value={poDeliveryDate}
              onChange={(e) => setPoDeliveryDate(e.target.value)}
            />
          </div>

          {/* Line Items Generator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Order Items & Hardware Intake
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Item Line
              </Button>
            </div>

            <div className="space-y-3">
              {poItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
                        required
                      >
                        <option value="">Select Product</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.isSerialized ? '(IMEI Serialized)' : '(Accessory)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Unit Cost (LKR)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatLKR(Number(item.quantity || 0) * Number(item.unitCost || 0))}
                      </span>
                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Serialized IMEI Scanner Input */}
                  {item.isSerialized && poReceiveImmediately && (
                    <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purpleAccent-700 dark:text-purpleAccent-300 flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5" />
                          Scan / Enter {item.quantity} IMEIs (One per line)
                        </span>
                        <span className="text-[10px] text-purpleAccent-600 font-mono">
                          {item.imeisText.split(/[\r\n,]+/).filter((s) => s.trim().length >= 8).length} / {item.quantity} Scanned
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={item.imeisText}
                        onChange={(e) => handleItemChange(idx, 'imeisText', e.target.value)}
                        placeholder="Scan or paste barcodes continuously:&#10;359871098231901&#10;359871098231902"
                        className="w-full p-2 font-mono text-xs rounded-lg border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-dark-card"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Color (Optional e.g. Titanium Black)"
                          value={item.color}
                          onChange={(e) => handleItemChange(idx, 'color', e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-purple-200 dark:border-dark-border bg-white dark:bg-dark-card"
                        />
                        <input
                          type="text"
                          placeholder="Storage (Optional e.g. 256GB)"
                          value={item.storage}
                          onChange={(e) => handleItemChange(idx, 'storage', e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-purple-200 dark:border-dark-border bg-white dark:bg-dark-card"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Receiving Switch & Summary */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Receive Goods Immediately (GRN)
              </p>
              <p className="text-[11px] text-slate-400">
                {poReceiveImmediately
                  ? 'Stock will be updated immediately upon saving this PO.'
                  : 'Save as an open Purchase Order. Inventory will NOT increase until goods are physically received.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={poReceiveImmediately}
                onChange={(e) => setPoReceiveImmediately(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tax Amount (LKR Optional)"
              type="number"
              step="0.01"
              value={poTax}
              onChange={(e) => setPoTax(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Purchase Notes"
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              placeholder="e.g. Bulk discount 5% included, Singer SL warranty"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-dark-surface flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Total Purchase Order Value:</span>
            <span className="text-base font-bold text-brand-600 dark:text-brand-400">
              {formatLKR(poTotal)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createSubmitting}>
              Generate Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CONFIRM GOODS RECEIVED */}
      <Modal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        title="Confirm Goods Received (GRN)"
        description={`PO: #${receivePurchaseTarget?.poNumber || ''} • Supplier: ${receivePurchaseTarget?.supplier?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4">
          {receiveError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {receiveError}
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Confirming will mark the shipment as received and atomically increment inventory stock levels in the warehouse.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Receiving Notes / Quality Inspection (Optional)
            </label>
            <textarea
              rows={3}
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              placeholder="e.g. All cartons inspected, seals intact, verified with supplier delivery note"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsReceiveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={receiveSubmitting}>
              Confirm & Update Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: RECORD SUPPLIER PAYMENT */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Record Supplier Payment"
        description={`PO: #${paymentPurchase?.poNumber || ''} • Outstanding: ${formatLKR(Math.max(0, Number(paymentPurchase?.totalAmount || 0) - Number(paymentPurchase?.paidAmount || 0)))}`}
        maxWidth="md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {payError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {payError}
            </div>
          )}

          <Input
            label="Payment Amount (LKR)"
            type="number"
            step="0.01"
            min="0.01"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            required
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            required
          >
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Corporate Card</option>
          </Select>

          <Input
            label="Transaction Reference # / Cheque #"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="e.g. CHQ-882190 or FT-COMM-9921"
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Payment Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Partial settlement for batch 1"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={paySubmitting}>
              Record Disbursal
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: PURCHASE DETAILS */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Purchase Order #${activePurchase?.poNumber || ''}`}
        description={`Supplier: ${activePurchase?.supplier?.name || ''} • Placed: ${activePurchase ? new Date(activePurchase.orderDate).toLocaleDateString() : ''}`}
        maxWidth="3xl"
      >
        {isDetailsLoading || !activePurchase ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatLKR(activePurchase.totalAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Total Paid</span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {formatLKR(activePurchase.paidAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] uppercase font-bold text-rose-600">Remaining Balance</span>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {formatLKR(activePurchase.remainingBalance || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Receipt Status</span>
                <div className="mt-1">
                  <Badge variant={activePurchase.status === 'RECEIVED' ? 'success' : 'warning'} size="sm">
                    {activePurchase.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Order Items
              </h4>
              <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost (LKR)</TableHead>
                      <TableHead className="text-right">Line Total (LKR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePurchase.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {item.product?.name}
                            </span>
                            <span className="text-[10px] text-brand-600 block font-mono">
                              {item.product?.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity} Units
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {formatLKR(item.unitCost)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatLKR(item.subtotal)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Serialized Devices Attached */}
            {activePurchase.devices && activePurchase.devices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-purpleAccent-600" />
                  Inventoried Serialized Devices ({activePurchase.devices.length})
                </h4>
                <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IMEI 1</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Spec</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePurchase.devices.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                              {d.imei1}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-slate-500">
                              {d.serialNumber || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                              {d.color || ''} {d.storage ? `• ${d.storage}` : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="success" size="sm" dot>{d.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Payments Ledger */}
            {activePurchase.payments && activePurchase.payments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Supplier Payment Ledger
                </h4>
                <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference #</TableHead>
                        <TableHead className="text-right">Amount (LKR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePurchase.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" size="sm">{p.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {p.transactionRef || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs font-bold text-emerald-600">
                              {formatLKR(p.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
