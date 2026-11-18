import React, { useState, useEffect } from 'react'
import {
  RotateCcw,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  User,
  Smartphone,
  ShieldCheck,
  Package,
  Calendar,
  Check,
  Eye,
  AlertCircle,
  Clock,
  Printer,
  SlidersHorizontal,
} from 'lucide-react'
import { returnsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'
import { useAuthStore, ROLES } from '@/stores/authStore'

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

export function ReturnsManagement() {
  const { user } = useAuthStore()
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.MANAGER

  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, completed: 0, rejected: 0 })

  // INITIATE RETURN MODAL STATE
  const [isInitiateOpen, setIsInitiateOpen] = useState(false)
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupData, setLookupData] = useState(null)
  const [lookupError, setLookupError] = useState('')

  // Selected items to return
  const [returnSelections, setReturnSelections] = useState({}) // { saleItemId: { selected: bool, quantity: num, refundAmount: num, deviceId: '', condition: 'RESELLABLE' } }
  const [returnType, setReturnType] = useState('REFUND')
  const [refundMethod, setRefundMethod] = useState('CASH')
  const [returnReason, setReturnReason] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // INSPECT & APPROVE MODAL STATE
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [restockSellable, setRestockSellable] = useState(true)
  const [inspectionNotes, setInspectionNotes] = useState('')
  const [approving, setApproving] = useState(false)

  // REJECT MODAL STATE
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  // VIEW DETAILS MODAL STATE
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [activeReturnDetails, setActiveReturnDetails] = useState(null)

  // Load returns list
  const loadReturns = async () => {
    try {
      setLoading(true)
      const res = await returnsAPI.list({
        status: statusFilter,
        search,
        page,
        limit: 15,
      })
      const data = res.data.data
      setReturns(data.items || [])
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      setMetrics(data.metrics || {})
    } catch (err) {
      console.error('Failed to load returns:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReturns()
    }, 300)
    return () => clearTimeout(timer)
  }, [statusFilter, search, page])

  // Lookup Original Invoice
  const handleLookupInvoice = async (e) => {
    e.preventDefault()
    if (!lookupQuery.trim()) return

    try {
      setLookingUp(true)
      setLookupError('')
      const res = await returnsAPI.lookup(lookupQuery.trim())
      setLookupData(res.data.data)

      // Initialize selections map
      const initialSelections = {}
      res.data.data.items?.forEach((item) => {
        initialSelections[item.saleItemId] = {
          selected: false,
          quantity: 1,
          maxQuantity: item.availableForReturn,
          refundAmount: item.availableForReturn > 0 ? (item.totalPrice / item.originalQuantity) : 0,
          deviceId: item.eligibleDevices?.[0]?.id || '',
          condition: 'RESELLABLE',
        }
      })
      setReturnSelections(initialSelections)
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Invoice not found or ineligible for returns.')
      setLookupData(null)
    } finally {
      setLookingUp(false)
    }
  }

  // Handle Return Item Selection change
  const handleToggleItem = (itemId) => {
    setReturnSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: !prev[itemId]?.selected,
      },
    }))
  }

  const handleUpdateSelection = (itemId, field, value) => {
    setReturnSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  // Submit Return Request
  const handleSubmitReturnRequest = async (e) => {
    e.preventDefault()
    if (!returnReason.trim()) {
      setSubmitError('Return reason is required.')
      return
    }

    const selectedItems = Object.entries(returnSelections)
      .filter(([_, sel]) => sel.selected && sel.quantity > 0)
      .map(([saleItemId, sel]) => ({
        saleItemId,
        deviceId: sel.deviceId || undefined,
        quantity: Number(sel.quantity),
        refundAmount: Number(sel.refundAmount),
        condition: sel.condition,
      }))

    if (selectedItems.length === 0) {
      setSubmitError('Please select at least one item to return.')
      return
    }

    try {
      setSubmittingReturn(true)
      setSubmitError('')
      await returnsAPI.create({
        saleId: lookupData.sale.id,
        type: returnType,
        refundMethod,
        reason: returnReason.trim(),
        items: selectedItems,
      })
      setIsInitiateOpen(false)
      loadReturns()
      alert('Return ticket registered successfully! It is now pending authorized manager review.')
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit return request.')
    } finally {
      setSubmittingReturn(false)
    }
  }

  // Approve Return
  const handleApproveSubmit = async (e) => {
    e.preventDefault()
    try {
      setApproving(true)
      await returnsAPI.approve(selectedReturn.id, {
        restockSellable,
        inspectionNotes,
      })
      setApprovalModalOpen(false)
      loadReturns()
      alert(`Return #${selectedReturn.returnNumber} approved and inventory updated!`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve return.')
    } finally {
      setApproving(false)
    }
  }

  // Reject Return
  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required.')
      return
    }
    try {
      setRejecting(true)
      await returnsAPI.reject(selectedReturn.id, { rejectionReason })
      setRejectModalOpen(false)
      loadReturns()
      alert(`Return #${selectedReturn.returnNumber} rejected.`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject return.')
    } finally {
      setRejecting(false)
    }
  }

  // Open Details Modal
  const handleOpenDetails = async (id) => {
    try {
      const res = await returnsAPI.get(id)
      setActiveReturnDetails(res.data.data)
      setDetailsModalOpen(true)
    } catch (err) {
      alert('Failed to load return details.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Returns & Refund Authorizations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Invoice verification, IMEI validation, condition inspection, and atomic stock restoral.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReturns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setLookupQuery('')
              setLookupData(null)
              setLookupError('')
              setReturnReason('')
              setSubmitError('')
              setIsInitiateOpen(true)
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Initiate Return / Exchange
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs uppercase font-medium text-slate-400 block">
            Total Return Requests
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {metrics.total || 0}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Lifetime registered</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs uppercase font-medium text-slate-400 block">
            Pending Approval
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {metrics.pending || 0}
          </span>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">
            Requires Manager Review
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs uppercase font-medium text-slate-400 block">
            Completed / Restocked
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {metrics.completed || 0}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Refunded & adjusted</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-xs uppercase font-medium text-slate-400 block">
            Rejected Requests
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {metrics.rejected || 0}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Policy voided</span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto bg-slate-100 p-1 rounded-xl dark:bg-slate-800 shrink-0">
          {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                setPage(1)
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search return #, invoice #, customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3.5">Return Ticket #</th>
                <th className="p-3.5">Original Invoice</th>
                <th className="p-3.5">Customer & Items</th>
                <th className="p-3.5">Type & Method</th>
                <th className="p-3.5 text-right">Refund Total</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && returns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-rose-500" />
                    Loading return records...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No return tickets found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 block">
                        {ret.returnNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                        {ret.sale?.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Billed: {formatLKR(ret.sale?.totalAmount)}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {ret.customer?.name || 'Walk-in Client'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {ret.items?.length || 0} returned line(s)
                      </span>
                    </td>

                    <td className="p-3.5">
                      <Badge variant="purple" size="sm">
                        {ret.type}
                      </Badge>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {ret.refundMethod}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatLKR(ret.totalRefund)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          STATUS_COLORS[ret.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleOpenDetails(ret.id)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>

                        {ret.status === 'PENDING' && isManagerOrAdmin && (
                          <>
                            <Button
                              size="xs"
                              onClick={() => {
                                setSelectedReturn(ret)
                                setInspectionNotes('')
                                setRestockSellable(true)
                                setApprovalModalOpen(true)
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setSelectedReturn(ret)
                                setRejectionReason('')
                                setRejectModalOpen(true)
                              }}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* INITIATE RETURN / EXCHANGE MODAL */}
      <Modal
        isOpen={isInitiateOpen}
        onClose={() => setIsInitiateOpen(false)}
        title="Initiate Return / Exchange Request"
        description="Verify original sales invoice, eligible quantities, and returned device serial/IMEI condition."
        maxWidth="3xl"
      >
        <div className="space-y-4 pt-1">
          {submitError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Invoice Lookup Form */}
          <form onSubmit={handleLookupInvoice} className="flex gap-2">
            <div className="relative flex-1">
              <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Enter Invoice Number (e.g. INV-241114-1029)..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={lookingUp || !lookupQuery.trim()} className="bg-rose-600 text-white shrink-0">
              {lookingUp ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Find Invoice'}
            </Button>
          </form>

          {lookupError && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              {lookupError}
            </div>
          )}

          {/* Invoice Details & Return Items Checklist */}
          {lookupData && (
            <form onSubmit={handleSubmitReturnRequest} className="space-y-4 pt-2">
              {/* Sale Summary Banner */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block">Customer:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {lookupData.sale.customer?.name || 'Walk-in'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Invoice Total:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatLKR(lookupData.sale.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sale Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(lookupData.sale.saleDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Status:</span>
                  <Badge variant={lookupData.sale.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                    {lookupData.sale.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Items Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Items for Return:
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lookupData.items.map((item) => {
                    const sel = returnSelections[item.saleItemId]
                    const isEligible = item.availableForReturn > 0

                    return (
                      <div
                        key={item.saleItemId}
                        className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                          sel?.selected
                            ? 'border-rose-400 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/20'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 dark:text-white">
                            <input
                              type="checkbox"
                              disabled={!isEligible}
                              checked={sel?.selected || false}
                              onChange={() => handleToggleItem(item.saleItemId)}
                              className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                            />
                            {item.productName}
                            {item.isSerialized && (
                              <Badge variant="purple" size="sm">
                                Serialized
                              </Badge>
                            )}
                          </label>

                          <span className="text-slate-500">
                            Available: <strong>{item.availableForReturn}</strong> of {item.originalQuantity}
                          </span>
                        </div>

                        {sel?.selected && (
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-[11px] text-slate-400 block mb-1">Return Qty</span>
                              <input
                                type="number"
                                min="1"
                                max={item.availableForReturn}
                                value={sel.quantity}
                                onChange={(e) =>
                                  handleUpdateSelection(item.saleItemId, 'quantity', e.target.value)
                                }
                                className="w-full rounded border border-slate-200 p-1 text-xs dark:bg-slate-800 dark:border-slate-700"
                              />
                            </div>

                            {item.isSerialized && item.eligibleDevices?.length > 0 && (
                              <div>
                                <span className="text-[11px] text-slate-400 block mb-1">Choose IMEI</span>
                                <select
                                  value={sel.deviceId}
                                  onChange={(e) =>
                                    handleUpdateSelection(item.saleItemId, 'deviceId', e.target.value)
                                  }
                                  className="w-full rounded border border-slate-200 p-1 text-xs dark:bg-slate-800 dark:border-slate-700 font-mono"
                                >
                                  {item.eligibleDevices.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.imei1 || d.serialNumber}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div>
                              <span className="text-[11px] text-slate-400 block mb-1">Device Condition</span>
                              <select
                                value={sel.condition}
                                onChange={(e) =>
                                  handleUpdateSelection(item.saleItemId, 'condition', e.target.value)
                                }
                                className="w-full rounded border border-slate-200 p-1 text-xs dark:bg-slate-800 dark:border-slate-700 font-semibold"
                              >
                                <option value="RESELLABLE">Resellable / Mint</option>
                                <option value="DEFECTIVE">Defective / RMA</option>
                                <option value="DAMAGED">Physically Damaged</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[11px] text-slate-400 block mb-1">Refund Amount (LKR)</span>
                              <input
                                type="number"
                                step="0.01"
                                value={sel.refundAmount}
                                onChange={(e) =>
                                  handleUpdateSelection(item.saleItemId, 'refundAmount', e.target.value)
                                }
                                className="w-full rounded border border-slate-200 p-1 text-xs dark:bg-slate-800 dark:border-slate-700 font-bold"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Type, Method & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Return Action Type
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-bold"
                  >
                    <option value="REFUND">REFUND (Disburse Payment Back)</option>
                    <option value="EXCHANGE">EXCHANGE (Store Credit / Swap)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Refund / Adjustment Method
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-bold"
                  >
                    <option value="CASH">Cash Refund</option>
                    <option value="CARD">Credit / Debit Card Reversal</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Return *
                </label>
                <textarea
                  required
                  rows={2}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Customer purchased wrong storage tier, device overheating on first boot..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsInitiateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReturn} className="bg-rose-600 text-white hover:bg-rose-700">
                  {submittingReturn ? 'Submitting...' : 'Register Return (Pending Approval)'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* INSPECT & APPROVE MODAL (Manager Only) */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={selectedReturn ? `Approve Return: #${selectedReturn.returnNumber}` : 'Approve Return'}
        description="Verify device physical condition before restocking into sellable inventory."
        maxWidth="md"
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4 pt-2">
          {selectedReturn && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Refund:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {formatLKR(selectedReturn.totalRefund)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Reason:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedReturn.reason}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={restockSellable}
                onChange={(e) => setRestockSellable(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              Restock resellable items back into active inventory
            </label>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-1">
              Resellable devices will be restored to IN_STOCK with StockMovement logged. Defective items will be moved to DAMAGED quarantine.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Manager Inspection & Authorization Notes
            </label>
            <textarea
              rows={2}
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="Device inspected by manager: Mint condition, original packaging intact..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={approving} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {approving ? 'Approving...' : 'Authorize & Restock'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Return Request"
        description="Specify why this return request is voided under store policy."
        maxWidth="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Return window expired (> 7 days), customer caused liquid damage..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={rejecting} className="bg-rose-600 text-white hover:bg-rose-700">
              {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS / CREDIT NOTE MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Return & Refund Credit Note"
        description="Official NexaPOS Return Authorization & Restocking Record"
        maxWidth="2xl"
      >
        {activeReturnDetails && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20 flex justify-between items-center">
              <div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm block">
                  {activeReturnDetails.returnNumber}
                </span>
                <span className="text-slate-500">
                  Original Invoice: <strong>{activeReturnDetails.sale?.invoiceNumber}</strong>
                </span>
              </div>
              <Badge
                variant={activeReturnDetails.status === 'COMPLETED' ? 'success' : 'warning'}
                size="md"
              >
                {activeReturnDetails.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
              <div>
                <span className="text-slate-400 block">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeReturnDetails.customer?.name || 'Walk-in'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Refund Disbursed:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {formatLKR(activeReturnDetails.totalRefund)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Return Reason:</span>
                <span className="text-slate-700 dark:text-slate-300">{activeReturnDetails.reason}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Refund Method:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeReturnDetails.refundMethod}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Returned Line Items:
              </span>
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Condition</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Refund Amount</th>
                    <th className="p-2 text-center">Restocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeReturnDetails.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {item.saleItem?.product?.name}
                        </span>
                        {item.device && (
                          <span className="font-mono text-[10px] text-slate-400 block">
                            IMEI: {item.device.imei1 || item.device.serialNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-2">{item.condition}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right font-bold text-rose-600">
                        {formatLKR(item.refundAmount)}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={item.isRestocked ? 'success' : 'outline'} size="sm">
                          {item.isRestocked ? 'Restocked' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activeReturnDetails.inspectionNotes && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
                <strong>Inspection Findings:</strong> {activeReturnDetails.inspectionNotes}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1.5" /> Print Credit Note
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default ReturnsManagement

