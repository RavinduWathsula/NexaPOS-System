import React, { useState, useEffect } from 'react'
import {
  Wrench,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Smartphone,
  ShieldCheck,
  DollarSign,
  Package,
  Calendar,
  Key,
  Trash2,
  Printer,
  ChevronRight,
  Filter,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react'
import { repairsAPI, customersAPI, usersAPI, inventoryAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'
import { useAuthStore, ROLES } from '@/stores/authStore'

const REPAIR_STATUSES = [
  'ALL',
  'RECEIVED',
  'DIAGNOSING',
  'WAITING_FOR_PARTS',
  'REPAIRING',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
]

const STATUS_LABELS = {
  RECEIVED: 'Received',
  DIAGNOSING: 'Diagnosing',
  WAITING_FOR_PARTS: 'Waiting for Parts',
  IN_PROGRESS: 'Repairing',
  REPAIRING: 'Repairing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered / Handed Over',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS = {
  RECEIVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  DIAGNOSING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  WAITING_FOR_PARTS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  REPAIRING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  READY_FOR_PICKUP: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  COMPLETED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  DELIVERED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

export function RepairManagement() {
  const { user } = useAuthStore()
  const isTechnician = user?.role === ROLES.TECHNICIAN
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.MANAGER

  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedTechFilter, setSelectedTechFilter] = useState('ALL')
  const [onlyMyRepairs, setOnlyMyRepairs] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [metrics, setMetrics] = useState({
    total: 0,
    received: 0,
    diagnosing: 0,
    waitingForParts: 0,
    repairing: 0,
    readyForPickup: 0,
    completed: 0,
    delivered: 0,
  })

  // Master Data
  const [technicians, setTechnicians] = useState([])
  const [customers, setCustomers] = useState([])
  const [inventoryParts, setInventoryParts] = useState([])

  // New Ticket Modal State
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    customerId: '',
    deviceModel: '',
    imei: '',
    serialNumber: '',
    passcode: '',
    physicalCondition: '',
    accessoriesReceived: '',
    issueDescription: '',
    technicianId: '',
    priority: 'NORMAL',
    estimatedCost: '',
    advancePaid: '',
    advancePaymentMethod: 'CASH',
    expectedCompletionDate: '',
  })
  const [ticketSubmitting, setTicketSubmitting] = useState(false)
  const [ticketError, setTicketError] = useState('')

  // Workspace / Details Modal State
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false)
  const [activeRepair, setActiveRepair] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Status & Notes Editing in Workspace
  const [editStatus, setEditStatus] = useState('')
  const [editDiagnosis, setEditDiagnosis] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editTechId, setEditTechId] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  // Spare Parts Addition
  const [partProductId, setPartProductId] = useState('')
  const [partName, setPartName] = useState('')
  const [partQuantity, setPartQuantity] = useState(1)
  const [partUnitCost, setPartUnitCost] = useState(0)
  const [partUnitPrice, setPartUnitPrice] = useState('')
  const [addingPart, setAddingPart] = useState(false)

  // Labor Cost & Completion
  const [laborCostInput, setLaborCostInput] = useState('')
  const [completingJob, setCompletingJob] = useState(false)

  // Payment Settlement
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentRef, setPaymentRef] = useState('')
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Load Technicians & Customers & Inventory
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [usersRes, custRes, invRes] = await Promise.all([
          usersAPI.list(),
          customersAPI.list({ limit: 100 }),
          inventoryAPI.stock({ limit: 100 }),
        ])

        const allUsers = usersRes.data.data || []
        const techs = allUsers.filter((u) => {
          const rName = typeof u.role === 'object' ? u.role?.name : u.role
          return rName === 'TECHNICIAN' || rName === 'SUPER_ADMIN' || rName === 'MANAGER'
        })
        setTechnicians(techs)
        setCustomers(custRes.data.data?.items || [])
        setInventoryParts(invRes.data.data?.items || [])
      } catch (e) {
        console.warn('Error loading master data:', e)
      }
    }
    loadMasterData()
  }, [])

  // Load repairs
  const loadRepairs = async () => {
    try {
      setLoading(true)
      const params = {
        search,
        status: statusFilter,
        page,
        limit: 15,
      }
      if (onlyMyRepairs && user?.id) {
        params.technicianId = user.id
      } else if (selectedTechFilter !== 'ALL') {
        params.technicianId = selectedTechFilter
      }

      const res = await repairsAPI.list(params)
      const data = res.data.data
      setRepairs(data.items || [])
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      setMetrics(data.metrics || {})
    } catch (err) {
      console.error('Failed to load repairs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRepairs()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, selectedTechFilter, onlyMyRepairs, page])

  // Open Workspace Modal
  const handleOpenWorkspace = async (id) => {
    try {
      setLoadingDetails(true)
      setWorkspaceModalOpen(true)
      const res = await repairsAPI.get(id)
      const rep = res.data.data
      setActiveRepair(rep)
      setEditStatus(rep.status)
      setEditDiagnosis(rep.diagnosis || '')
      setEditNotes(rep.serviceNotes || '')
      setEditTechId(rep.technicianId || '')
      setLaborCostInput(rep.laborCost !== null ? String(rep.laborCost) : '0')
      setPaymentAmount(rep.calculated?.balanceDue > 0 ? String(rep.calculated.balanceDue) : '')
    } catch (err) {
      alert('Failed to load repair details.')
      setWorkspaceModalOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Refresh Workspace
  const reloadActiveRepair = async () => {
    if (!activeRepair?.id) return
    const res = await repairsAPI.get(activeRepair.id)
    const rep = res.data.data
    setActiveRepair(rep)
    setEditStatus(rep.status)
    setEditDiagnosis(rep.diagnosis || '')
    setEditNotes(rep.serviceNotes || '')
    setEditTechId(rep.technicianId || '')
    setLaborCostInput(rep.laborCost !== null ? String(rep.laborCost) : '0')
    setPaymentAmount(rep.calculated?.balanceDue > 0 ? String(rep.calculated.balanceDue) : '')
    loadRepairs()
  }

  // Submit New Ticket
  const handleSubmitNewTicket = async (e) => {
    e.preventDefault()
    if (!ticketForm.customerId) {
      setTicketError('Please select a registered customer.')
      return
    }
    if (!ticketForm.deviceModel.trim()) {
      setTicketError('Device model is required.')
      return
    }
    if (!ticketForm.issueDescription.trim()) {
      setTicketError('Reported problem description is required.')
      return
    }

    try {
      setTicketSubmitting(true)
      setTicketError('')
      await repairsAPI.create({
        ...ticketForm,
        estimatedCost: Number(ticketForm.estimatedCost) || 0,
        advancePaid: Number(ticketForm.advancePaid) || 0,
      })
      setNewTicketModalOpen(false)
      loadRepairs()
      alert('Repair ticket registered successfully!')
    } catch (err) {
      setTicketError(err.response?.data?.message || 'Failed to create repair ticket.')
    } finally {
      setTicketSubmitting(false)
    }
  }

  // Save Status & Diagnosis in Workspace
  const handleSaveStatus = async () => {
    try {
      setSavingStatus(true)
      await repairsAPI.updateStatus(activeRepair.id, {
        status: editStatus,
        diagnosis: editDiagnosis,
        serviceNotes: editNotes,
        technicianId: editTechId || null,
      })
      await reloadActiveRepair()
      alert('Repair job status and workshop findings saved.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update repair status.')
    } finally {
      setSavingStatus(false)
    }
  }

  // Add Spare Part
  const handleAddPart = async (e) => {
    e.preventDefault()
    if (!partName.trim() && !partProductId) {
      alert('Please specify a part name or select an inventory product.')
      return
    }
    if (!partUnitPrice || Number(partUnitPrice) < 0) {
      alert('Valid part unit price is required.')
      return
    }

    try {
      setAddingPart(true)
      await repairsAPI.addPart(activeRepair.id, {
        productId: partProductId || undefined,
        partName: partName.trim(),
        quantity: Number(partQuantity) || 1,
        unitCost: Number(partUnitCost) || 0,
        unitPrice: Number(partUnitPrice) || 0,
      })
      setPartProductId('')
      setPartName('')
      setPartQuantity(1)
      setPartUnitCost(0)
      setPartUnitPrice('')
      await reloadActiveRepair()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add spare part.')
    } finally {
      setAddingPart(false)
    }
  }

  // Remove Spare Part
  const handleRemovePart = async (partId) => {
    if (!window.confirm('Remove this part from repair and return quantity to stock?')) return
    try {
      await repairsAPI.removePart(partId)
      await reloadActiveRepair()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove part.')
    }
  }

  // Complete Repair Job
  const handleCompleteJob = async () => {
    try {
      setCompletingJob(true)
      await repairsAPI.complete(activeRepair.id, {
        laborCost: Number(laborCostInput) || 0,
        diagnosis: editDiagnosis,
        serviceNotes: editNotes,
      })
      await reloadActiveRepair()
      alert('Repair job marked as COMPLETED & READY FOR PICKUP!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete repair.')
    } finally {
      setCompletingJob(false)
    }
  }

  // Record Payment & Settle
  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }

    try {
      setRecordingPayment(true)
      const res = await repairsAPI.recordPayment(activeRepair.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        transactionRef: paymentRef.trim() || undefined,
        notes: `Balance settlement for repair ticket #${activeRepair.ticketNumber}`,
      })
      await reloadActiveRepair()
      if (res.data.data?.isFullyPaid) {
        alert('Payment recorded! Ticket is fully settled and handed over.')
      } else {
        alert('Partial payment recorded successfully.')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed.')
    } finally {
      setRecordingPayment(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Mobile Repair & Workshop
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track tickets, technician diagnosis, spare parts consumption, and delivery settlements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTechnician && (
            <Button
              variant={onlyMyRepairs ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setOnlyMyRepairs(!onlyMyRepairs)}
              className={onlyMyRepairs ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
            >
              <User className="h-4 w-4 mr-1.5" />
              {onlyMyRepairs ? 'Showing My Jobs' : 'My Assigned Jobs'}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={loadRepairs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setTicketForm({
                customerId: '',
                deviceModel: '',
                imei: '',
                serialNumber: '',
                passcode: '',
                physicalCondition: 'Pristine, no obvious exterior damage',
                accessoriesReceived: 'Handset Only',
                issueDescription: '',
                technicianId: user?.id || '',
                priority: 'NORMAL',
                estimatedCost: '',
                advancePaid: '',
                advancePaymentMethod: 'CASH',
                expectedCompletionDate: '',
              })
              setTicketError('')
              setNewTicketModalOpen(true)
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Repair Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              In Workshop
            </span>
            <Wrench className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {(metrics.received || 0) + (metrics.diagnosing || 0) + (metrics.repairing || 0)}
            </span>
            <span className="text-xs text-amber-600 font-medium dark:text-amber-400">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Waiting for Parts
            </span>
            <Package className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics.waitingForParts || 0}
            </span>
            <span className="text-xs text-slate-400">On Hold</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ready for Pickup
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.readyForPickup || 0}
            </span>
            <span className="text-xs text-slate-400">Notified</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Recorded
            </span>
            <Smartphone className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics.total || 0}
            </span>
            <span className="text-xs text-slate-400">Repairs</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Tech Select */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex overflow-x-auto bg-slate-100 p-1 rounded-xl dark:bg-slate-800 gap-1">
          {REPAIR_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st)
                setPage(1)
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Jobs' : STATUS_LABELS[st] || st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTechFilter}
            onChange={(e) => {
              setSelectedTechFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All Technicians</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                Tech: {t.firstName} {t.lastName}
              </option>
            ))}
          </select>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket, Model, IMEI..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Ticket Number</th>
                <th className="px-6 py-4">Device & Problem</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Estimate / Final</th>
                <th className="px-6 py-4 text-center">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && repairs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading workshop tickets...
                  </td>
                </tr>
              ) : repairs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <Wrench className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    No repair jobs found.
                  </td>
                </tr>
              ) : (
                repairs.map((r) => {
                  const custName = r.customer
                    ? `${r.customer.firstName} ${r.customer.lastName || ''}`.trim()
                    : 'Customer'
                  const techName = r.technician
                    ? `${r.technician.firstName} ${r.technician.lastName || ''}`.trim()
                    : 'Unassigned'
                  const cost = r.finalCost !== null ? r.finalCost : r.estimatedCost

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                          {r.ticketNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(r.receivedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {r.deviceModel}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {r.issueDescription}
                        </span>
                        {r.imei && (
                          <span className="font-mono text-[11px] text-slate-400 block">
                            IMEI: {r.imei}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {custName}
                        </span>
                        <span className="text-xs text-slate-400">{r.customer?.phone}</span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {techName}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={
                            r.priority === 'URGENT'
                              ? 'danger'
                              : r.priority === 'HIGH'
                              ? 'warning'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {r.priority}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {formatLKR(cost)}
                        </span>
                        {Number(r.advancePaid) > 0 && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Adv: {formatLKR(r.advancePaid)}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Button
                          size="xs"
                          onClick={() => handleOpenWorkspace(r.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                          <Wrench className="h-3.5 w-3.5 mr-1" />
                          Open Job
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
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

      {/* New Repair Ticket Modal */}
      <Modal
        isOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
        title="Intake New Repair Ticket"
        description="Register a repair job, condition assessment, accessories received, and advance deposit."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitNewTicket} className="space-y-4 pt-2">
          {ticketError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {ticketError}
            </div>
          )}

          {/* Customer & Device */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Customer *
              </label>
              <select
                required
                value={ticketForm.customerId}
                onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- Select Registered Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Device Model *
              </label>
              <Input
                required
                value={ticketForm.deviceModel}
                onChange={(e) => setTicketForm({ ...ticketForm, deviceModel: e.target.value })}
                placeholder="e.g. Samsung Galaxy S23 Ultra"
              />
            </div>
          </div>

          {/* IMEI & Serial & Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                IMEI Number
              </label>
              <Input
                value={ticketForm.imei}
                onChange={(e) => setTicketForm({ ...ticketForm, imei: e.target.value })}
                placeholder="15-digit IMEI"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Serial Number
              </label>
              <Input
                value={ticketForm.serialNumber}
                onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
                placeholder="Serial number"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Passcode / Pattern PIN
              </label>
              <Input
                value={ticketForm.passcode}
                onChange={(e) => setTicketForm({ ...ticketForm, passcode: e.target.value })}
                placeholder="Lock code (optional)"
              />
            </div>
          </div>

          {/* Condition & Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Physical Condition
              </label>
              <Input
                value={ticketForm.physicalCondition}
                onChange={(e) => setTicketForm({ ...ticketForm, physicalCondition: e.target.value })}
                placeholder="e.g. Screen cracked, deep scratches on bevel"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Accessories Received
              </label>
              <Input
                value={ticketForm.accessoriesReceived}
                onChange={(e) => setTicketForm({ ...ticketForm, accessoriesReceived: e.target.value })}
                placeholder="e.g. Handset + SIM tray + Silicon case"
              />
            </div>
          </div>

          {/* Reported Issue */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Reported Issue / Defect *
            </label>
            <textarea
              required
              rows={2}
              value={ticketForm.issueDescription}
              onChange={(e) => setTicketForm({ ...ticketForm, issueDescription: e.target.value })}
              placeholder="Detailed description of customer defect..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Technician & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assign Technician
              </label>
              <select
                value={ticketForm.technicianId}
                onChange={(e) => setTicketForm({ ...ticketForm, technicianId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- Workshop Queue (Unassigned) --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Financials & Advance Payment */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Estimated Charges & Advance Deposit
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Est. Cost (LKR)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={ticketForm.estimatedCost}
                  onChange={(e) => setTicketForm({ ...ticketForm, estimatedCost: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Advance Deposit (LKR)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={ticketForm.advancePaid}
                  onChange={(e) => setTicketForm({ ...ticketForm, advancePaid: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Deposit Method
                </label>
                <select
                  value={ticketForm.advancePaymentMethod}
                  onChange={(e) => setTicketForm({ ...ticketForm, advancePaymentMethod: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setNewTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={ticketSubmitting} className="bg-amber-600 text-white hover:bg-amber-700">
              {ticketSubmitting ? 'Registering...' : 'Create Repair Ticket'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Technician Workshop Workspace Modal */}
      <Modal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        title={activeRepair ? `Job Workspace: #${activeRepair.ticketNumber}` : 'Repair Workspace'}
        description="Technician diagnosis, live inventory spare parts consumption, and delivery settlement."
        maxWidth="4xl"
      >
        {loadingDetails || !activeRepair ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-amber-500" />
            Loading job workspace...
          </div>
        ) : (
          <div className="space-y-6 pt-1">
            {/* Top Device & Client Summary */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeRepair.deviceModel}
                    </h3>
                    <Badge variant="purple" size="sm">
                      {activeRepair.priority}
                    </Badge>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[activeRepair.status]
                      }`}
                    >
                      {STATUS_LABELS[activeRepair.status] || activeRepair.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    {activeRepair.imei && <span>IMEI: <strong>{activeRepair.imei}</strong></span>}
                    {activeRepair.passcode && (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Key className="h-3 w-3" /> Lock PIN: {activeRepair.passcode}
                      </span>
                    )}
                    <span>Customer: <strong>{activeRepair.customer?.firstName} {activeRepair.customer?.lastName}</strong> ({activeRepair.customer?.phone})</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase text-slate-400 block">Total Final Cost</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatLKR(activeRepair.calculated?.finalCost || activeRepair.estimatedCost)}
                  </span>
                  <span className="text-xs text-rose-500 block">
                    Balance Due: {formatLKR(activeRepair.calculated?.balanceDue || 0)}
                  </span>
                </div>
              </div>

              {/* Physical Condition & Accessories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Reported Defect:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeRepair.issueDescription}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Condition & Accessories:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {activeRepair.physicalCondition || 'Standard'} • ({activeRepair.accessoriesReceived || 'No accessories'})
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Diagnosis Section */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-500" />
                Workshop Diagnosis & Status Stepper
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Repair Job Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    {REPAIR_STATUSES.filter((s) => s !== 'ALL').map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st] || st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={editTechId}
                    onChange={(e) => setEditTechId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Technician Diagnosis & Inspection Findings
                </label>
                <textarea
                  rows={2}
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  placeholder="Root cause identified (e.g. blown charging IC, flex cable tear, short circuit in primary rail)..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Service & Workshop Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal workshop log, supplier part ETA, customer call log..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700"
                >
                  {savingStatus ? 'Saving...' : 'Update Workshop Notes & Status'}
                </Button>
              </div>
            </div>

            {/* Spare Parts Consumed Section */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Spare Parts Consumed ({activeRepair.parts?.length || 0})
                </h4>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Parts Total: {formatLKR(activeRepair.calculated?.partsTotal || 0)}
                </span>
              </div>

              {/* Parts Table */}
              {activeRepair.parts?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No spare parts recorded for this repair yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="p-2">Part Description</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeRepair.parts.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2 font-medium text-slate-800 dark:text-slate-200">
                            {p.partName}
                            {p.product && (
                              <span className="block text-[10px] text-purple-500 font-mono">
                                SKU: {p.product.sku}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">{p.quantity}</td>
                          <td className="p-2 text-right">{formatLKR(p.unitPrice)}</td>
                          <td className="p-2 text-right font-bold text-slate-900 dark:text-white">
                            {formatLKR(Number(p.unitPrice) * p.quantity)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              title="Remove part & restore stock"
                              onClick={() => handleRemovePart(p.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Part Form */}
              <form onSubmit={handleAddPart} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Add Replacement Part (From Stock or Custom)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={partProductId}
                      onChange={(e) => {
                        const pid = e.target.value
                        setPartProductId(pid)
                        const prod = inventoryParts.find((item) => item.product?.id === pid)?.product
                        if (prod) {
                          setPartName(prod.name)
                          setPartUnitPrice(prod.variants?.[0]?.sellingPrice || '')
                          setPartUnitCost(prod.variants?.[0]?.purchasePrice || 0)
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="">-- Choose Stock Item or Type Custom --</option>
                      {inventoryParts.map((inv) => (
                        <option key={inv.product?.id} value={inv.product?.id}>
                          {inv.product?.name} (Stock: {inv.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      placeholder="Part Name"
                      value={partName}
                      onChange={(e) => setPartName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Price (LKR)"
                      value={partUnitPrice}
                      onChange={(e) => setPartUnitPrice(e.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={addingPart} className="bg-purple-600 text-white shrink-0">
                      {addingPart ? 'Adding...' : 'Add Part'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Labor Cost & Final Job Completion */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Labor Charges & Mark Job Complete
              </h4>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Labor Cost (LKR):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={laborCostInput}
                    onChange={(e) => setLaborCostInput(e.target.value)}
                    className="w-36"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleCompleteJob}
                  disabled={completingJob}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  {completingJob ? 'Saving...' : 'Mark Complete & Ready for Pickup'}
                </Button>
              </div>
            </div>

            {/* Payments & Handover Delivery */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Payments & Handover Delivery
                </h4>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Total Paid: </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatLKR(activeRepair.calculated?.totalPaid || 0)}
                  </span>
                </div>
              </div>

              {/* Payment Records */}
              {activeRepair.payments?.length > 0 && (
                <div className="space-y-1">
                  {activeRepair.payments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="flex justify-between items-center text-xs p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <span>
                        {new Date(pmt.paymentDate).toLocaleDateString()} • Method: <strong>{pmt.method}</strong>{' '}
                        {pmt.notes && `(${pmt.notes})`}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatLKR(pmt.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Settlement Form if Balance Due */}
              {activeRepair.calculated?.balanceDue > 0 ? (
                <form onSubmit={handleRecordPayment} className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Balance Due: {formatLKR(activeRepair.calculated.balanceDue)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Payment will auto-transition ticket to DELIVERED once balance is cleared.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount to pay"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="CASH">CASH</option>
                      <option value="CARD">CARD</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    </select>
                    <Button type="submit" size="sm" disabled={recordingPayment} className="bg-emerald-600 text-white">
                      {recordingPayment ? 'Processing...' : 'Settle & Handover Device'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> This repair ticket is paid in full!
                  </span>
                  {activeRepair.status !== 'DELIVERED' && (
                    <Button
                      size="xs"
                      onClick={async () => {
                        await repairsAPI.updateStatus(activeRepair.id, { status: 'DELIVERED' })
                        await reloadActiveRepair()
                      }}
                      className="bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                      Mark as Delivered / Handed Over
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Workshop Job Card
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWorkspaceModalOpen(false)}>
                Close Workspace
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default RepairManagement
