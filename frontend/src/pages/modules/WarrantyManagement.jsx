import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  RefreshCw,
  Plus,
  Eye,
  XCircle,
  Wrench,
  Smartphone,
  Calendar,
  User,
  ExternalLink,
  Printer,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { warrantiesAPI, usersAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'
import { useAuthStore, ROLES } from '@/stores/authStore'

export function WarrantyManagement() {
  const { user } = useAuthStore()
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.MANAGER

  const [warranties, setWarranties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL', 'ACTIVE', 'EXPIRED', 'CLAIMED'
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [summary, setSummary] = useState({ total: 0, active: 0, expired: 0, claimed: 0 })

  // Quick Lookup State
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResults, setLookupResults] = useState(null)
  const [lookupModalOpen, setLookupModalOpen] = useState(false)

  // Details / Certificate Modal
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // File Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [claimWarranty, setClaimWarranty] = useState(null)
  const [claimIssue, setClaimIssue] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [claimError, setClaimError] = useState('')

  // Review Claim Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewClaim, setReviewClaim] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [createRepairJob, setCreateRepairJob] = useState(true)
  const [technicians, setTechnicians] = useState([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Load warranties
  const loadWarranties = async () => {
    try {
      setLoading(true)
      const res = await warrantiesAPI.list({
        search,
        status: statusFilter,
        page,
        limit: 15,
      })
      const data = res.data.data
      setWarranties(data.items || [])
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      setSummary(data.summary || { total: 0, active: 0, expired: 0, claimed: 0 })
    } catch (err) {
      console.error('Failed to load warranties:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load technicians for claim-to-repair assignment
  const loadTechnicians = async () => {
    try {
      const res = await usersAPI.list()
      const allUsers = res.data.data || []
      const techs = allUsers.filter((u) => {
        const rName = typeof u.role === 'object' ? u.role?.name : u.role
        return rName === 'TECHNICIAN' || rName === 'SUPER_ADMIN' || rName === 'MANAGER'
      })
      setTechnicians(techs)
      if (techs.length > 0) setSelectedTechnicianId(techs[0].id)
    } catch (e) {
      console.warn('Could not load technicians', e)
    }
  }

  useEffect(() => {
    loadTechnicians()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWarranties()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, page])

  // Instant Quick Lookup
  const handleQuickLookup = async (e) => {
    e.preventDefault()
    if (!lookupQuery.trim()) return

    try {
      setLookupLoading(true)
      const res = await warrantiesAPI.lookup(lookupQuery)
      setLookupResults(res.data.data || [])
      setLookupModalOpen(true)
    } catch (err) {
      alert(err.response?.data?.message || 'No matching warranty found for provided query.')
    } finally {
      setLookupLoading(false)
    }
  }

  // Open Details Modal
  const handleViewDetails = async (id) => {
    try {
      const res = await warrantiesAPI.get(id)
      setSelectedWarranty(res.data.data)
      setDetailsModalOpen(true)
    } catch (err) {
      alert('Failed to load warranty record.')
    }
  }

  // Open Claim Modal
  const handleOpenClaim = (warranty) => {
    setClaimWarranty(warranty)
    setClaimIssue('')
    setClaimError('')
    setClaimModalOpen(true)
  }

  // Submit Claim
  const handleSubmitClaim = async (e) => {
    e.preventDefault()
    if (!claimIssue.trim()) {
      setClaimError('Please provide a detailed issue description.')
      return
    }
    try {
      setSubmittingClaim(true)
      setClaimError('')
      await warrantiesAPI.createClaim({
        warrantyId: claimWarranty.id,
        issueReported: claimIssue.trim(),
      })
      setClaimModalOpen(false)
      loadWarranties()
      alert('Warranty claim submitted successfully! It is now pending authorized manager review.')
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit warranty claim.')
    } finally {
      setSubmittingClaim(false)
    }
  }

  // Open Review Claim Modal
  const handleOpenReview = (claim, warranty) => {
    setReviewClaim({ ...claim, warranty })
    setReviewStatus('APPROVED')
    setResolutionNotes('')
    setCreateRepairJob(true)
    setReviewError('')
    setReviewModalOpen(true)
  }

  // Submit Claim Review
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!resolutionNotes.trim()) {
      setReviewError('Resolution review notes are required.')
      return
    }
    try {
      setReviewSubmitting(true)
      setReviewError('')
      await warrantiesAPI.reviewClaim(reviewClaim.id, {
        status: reviewStatus,
        resolutionNotes: resolutionNotes.trim(),
        createRepairJob: reviewStatus === 'APPROVED' ? createRepairJob : false,
        technicianId: selectedTechnicianId || null,
        estimatedCost: 0,
      })
      setReviewModalOpen(false)
      if (detailsModalOpen && selectedWarranty) {
        handleViewDetails(selectedWarranty.id)
      }
      loadWarranties()
      alert(`Claim reviewed as ${reviewStatus} successfully!`)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review decision.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const getValidityBadge = (endDate, status) => {
    if (status === 'VOIDED') return <Badge variant="danger">VOIDED</Badge>
    if (status === 'CLAIMED') return <Badge variant="warning">UNDER CLAIM</Badge>
    const end = new Date(endDate)
    const now = new Date()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0 || status === 'EXPIRED') {
      return <Badge variant="danger">Expired</Badge>
    }
    if (diffDays <= 30) {
      return <Badge variant="warning">Expiring in {diffDays}d</Badge>
    }
    return <Badge variant="success">{diffDays} Days Active</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Warranty & RMA Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automated electronic warranty cards, IMEI lookup, and authorized claim reviews.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadWarranties} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Instant IMEI / Invoice Lookup Bar */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-950 dark:bg-sky-950/20">
        <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-600 dark:text-sky-400" />
            <input
              type="text"
              placeholder="Fast Lookup: Enter Device IMEI (15 digits), Serial Number, Invoice #, or Warranty Code..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full rounded-xl border border-sky-300 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-sky-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={lookupLoading || !lookupQuery.trim()}
            className="bg-sky-600 hover:bg-sky-700 text-white shrink-0"
          >
            {lookupLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            Verify Warranty
          </Button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Warranties
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.active.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">Valid</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Expired Coverages
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.expired.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Lapsed</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Claims Filed
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {summary.claimed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Total</span>
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
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {summary.total.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Certificates</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto bg-slate-100 p-1 rounded-xl dark:bg-slate-800 shrink-0">
          {['ALL', 'ACTIVE', 'EXPIRED', 'CLAIMED'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab)
                setPage(1)
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Warranties' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, customer, IMEI..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Warranties Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Warranty Code</th>
                <th className="px-6 py-4">Device & Identifiers</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Claims</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && warranties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-500" />
                    Loading warranties...
                  </td>
                </tr>
              ) : warranties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    No warranty records found.
                  </td>
                </tr>
              ) : (
                warranties.map((w) => {
                  const devName =
                    w.device?.productVariant?.product?.name ||
                    w.device?.productVariant?.variantName ||
                    'General Hardware'
                  const imei = w.device?.imei1 || w.device?.serialNumber || 'Non-serialized'
                  const custName = w.customer
                    ? `${w.customer.firstName} ${w.customer.lastName || ''}`.trim()
                    : 'Walk-in Customer'

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                          {w.warrantyCode}
                        </span>
                        {w.sale?.invoiceNumber && (
                          <span className="text-[11px] text-slate-400">
                            Inv: {w.sale.invoiceNumber}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {devName}
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {imei}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {custName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {w.customer?.phone || 'No phone'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <span className="text-slate-500 block">
                          To: {new Date(w.endDate).toLocaleDateString()}
                        </span>
                        <div className="mt-1">
                          {getValidityBadge(w.endDate, w.status)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={
                            w.status === 'ACTIVE'
                              ? 'success'
                              : w.status === 'EXPIRED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {w.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {w.claims?.length > 0 ? (
                          <Badge variant="purple" size="sm">
                            {w.claims.length} claim(s)
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="View Certificate / Details"
                            onClick={() => handleViewDetails(w.id)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {w.status !== 'VOIDED' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenClaim(w)}
                              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                            >
                              File Claim
                            </Button>
                          )}
                        </div>
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

      {/* Quick Lookup Modal */}
      <Modal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        title="Instant Warranty Verification"
        description={`Lookup results for query: "${lookupQuery}"`}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2">
          {lookupResults && lookupResults.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <XCircle className="h-10 w-10 mx-auto text-rose-400 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                No active warranty found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Verify the IMEI or invoice number for any typos.
              </p>
            </div>
          ) : (
            lookupResults?.map((res) => {
              const devName =
                res.device?.productVariant?.product?.name ||
                res.device?.productVariant?.variantName ||
                'Device'
              return (
                <div
                  key={res.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-base">
                        {res.warrantyCode}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {devName}
                      </h4>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">
                        IMEI 1: {res.device?.imei1 || 'N/A'} {res.device?.imei2 ? `• IMEI 2: ${res.device.imei2}` : ''}
                      </p>
                    </div>
                    <div>{getValidityBadge(res.endDate, res.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Registered Customer:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.customer ? `${res.customer.firstName} ${res.customer.lastName || ''}` : 'Walk-in'} (
                        {res.customer?.phone || 'No phone'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Purchase Invoice:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.sale?.invoiceNumber || 'Manual Registration'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Start Date:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(res.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expiration Date:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(res.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {res.terms && (
                    <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-xs text-sky-800 dark:text-sky-300">
                      <strong>Terms:</strong> {res.terms}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLookupModalOpen(false)
                        handleViewDetails(res.id)
                      }}
                    >
                      Full Certificate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setLookupModalOpen(false)
                        handleOpenClaim(res)
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      File Warranty Claim
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Modal>

      {/* File Warranty Claim Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="File Warranty Claim"
        description="Warranty claim intake will be filed as PENDING for manager authorization."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitClaim} className="space-y-4 pt-2">
          {claimError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {claimError}
            </div>
          )}

          {claimWarranty && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Warranty Code:</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {claimWarranty.warrantyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Device:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {claimWarranty.device?.productVariant?.product?.name || 'Device'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IMEI / Serial:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {claimWarranty.device?.imei1 || claimWarranty.device?.serialNumber || 'N/A'}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Reported Issue Description *
            </label>
            <textarea
              required
              rows={4}
              value={claimIssue}
              onChange={(e) => setClaimIssue(e.target.value)}
              placeholder="e.g. Screen flickering when brightness is above 50%, touch unresponsive in upper right quadrant..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Authorized Review Policy:</strong> Claims are not automatically approved. A store manager or admin will inspect the device physical condition before warranty service is authorized.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submittingClaim}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {submittingClaim ? 'Submitting...' : 'File Claim (Pending Review)'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Warranty Claim Modal (Manager Only) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Authorized Claim Review"
        description="Review reported defect and decide whether to approve or reject warranty coverage."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
          {reviewError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {reviewError}
            </div>
          )}

          {reviewClaim && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50 space-y-1.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Reported Issue:
              </div>
              <p className="text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                {reviewClaim.issueReported}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Decision Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['APPROVED', 'REJECTED', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setReviewStatus(st)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    reviewStatus === st
                      ? st === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : st === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-sky-600 text-white border-sky-600'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Resolution & Inspection Notes *
            </label>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Device inspected: No physical or liquid ingress detected. Approved for authorized screen replacement."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {reviewStatus === 'APPROVED' && (
            <div className="space-y-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <input
                  type="checkbox"
                  checked={createRepairJob}
                  onChange={(e) => setCreateRepairJob(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                Automatically create Workshop Repair Ticket
              </label>

              {createRepairJob && (
                <div>
                  <label className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 block mb-1">
                    Assign Technician
                  </label>
                  <select
                    value={selectedTechnicianId}
                    onChange={(e) => setSelectedTechnicianId(e.target.value)}
                    className="w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-emerald-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">-- Unassigned (Workshop Pool) --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reviewSubmitting} className="bg-brand-600 text-white hover:bg-brand-700">
              {reviewSubmitting ? 'Saving...' : 'Confirm Decision'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details & Printable Certificate Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Electronic Warranty Certificate"
        description="Official NexaPOS Hardware Warranty & Service Agreement"
        maxWidth="3xl"
      >
        {selectedWarranty && (
          <div className="space-y-6 pt-2">
            {/* Certificate Header Banner */}
            <div className="rounded-2xl border border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-50 p-6 dark:border-sky-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 text-sky-600 dark:text-sky-400 mb-2">
                <ShieldCheck className="h-8 w-8" />
                <span className="text-xl font-black tracking-widest uppercase">NexaPOS Care</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Hardware Protection Certificate
              </h2>
              <div className="mt-3 inline-block font-mono text-sm font-bold bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-sm">
                CODE: {selectedWarranty.warrantyCode}
              </div>
            </div>

            {/* Device & Client Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Device Information
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedWarranty.device?.productVariant?.product?.name || 'Device'}
                </p>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                  <p>IMEI 1: {selectedWarranty.device?.imei1 || 'N/A'}</p>
                  {selectedWarranty.device?.imei2 && <p>IMEI 2: {selectedWarranty.device.imei2}</p>}
                  {selectedWarranty.device?.serialNumber && <p>Serial: {selectedWarranty.device.serialNumber}</p>}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Registered Customer & Purchase
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedWarranty.customer
                    ? `${selectedWarranty.customer.firstName} ${selectedWarranty.customer.lastName || ''}`
                    : 'Walk-in Customer'}
                </p>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p>Phone: {selectedWarranty.customer?.phone || 'N/A'}</p>
                  <p>Invoice #: {selectedWarranty.sale?.invoiceNumber || 'Manual Issuance'}</p>
                  <p>Coverage: {new Date(selectedWarranty.startDate).toLocaleDateString()} to {new Date(selectedWarranty.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Claims History on this Warranty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Warranty Claim History ({selectedWarranty.claims?.length || 0})
                </h4>
                {selectedWarranty.status !== 'VOIDED' && (
                  <Button
                    size="xs"
                    onClick={() => handleOpenClaim(selectedWarranty)}
                    className="bg-rose-600 text-white hover:bg-rose-700"
                  >
                    File New Claim
                  </Button>
                )}
              </div>

              {selectedWarranty.claims?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No warranty claims recorded on this device.</p>
              ) : (
                <div className="space-y-2">
                  {selectedWarranty.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="rounded-lg border border-slate-200 p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">
                          Filed: {new Date(claim.claimDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              claim.status === 'APPROVED'
                                ? 'success'
                                : claim.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {claim.status}
                          </Badge>
                          {claim.status === 'PENDING' && isManagerOrAdmin && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleOpenReview(claim, selectedWarranty)}
                              className="text-brand-600 border-brand-200 hover:bg-brand-50"
                            >
                              Authorize / Review
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        <strong>Issue:</strong> {claim.issueReported}
                      </p>

                      {claim.resolutionNotes && (
                        <p className="text-slate-600 dark:text-slate-400 italic">
                          <strong>Resolution:</strong> {claim.resolutionNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Repairs */}
            {selectedWarranty.relatedRepairs?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Workshop Repair History ({selectedWarranty.relatedRepairs.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedWarranty.relatedRepairs.map((rep) => (
                    <div
                      key={rep.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                          {rep.ticketNumber}
                        </span>{' '}
                        • {rep.issueDescription}
                      </div>
                      <Badge variant="purple" size="sm">
                        {rep.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Certificate
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
export default WarrantyManagement
