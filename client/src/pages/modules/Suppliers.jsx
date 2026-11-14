import React, { useState, useEffect } from 'react'
import {
  Truck,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Building,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { suppliersAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function Suppliers() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  const [suppliers, setSuppliers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [search, setSearch] = useState('')

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [creditDays, setCreditDays] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  // Details Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeSupplier, setActiveSupplier] = useState(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  const fetchSuppliers = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await suppliersAPI.list({
        search: search.trim() || undefined,
        page,
        limit: 15,
      })
      setSuppliers(res.data?.data?.items || [])
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load suppliers.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers(1)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchSuppliers(1)
  }

  const handleOpenAdd = () => {
    setEditingSupplier(null)
    setName('')
    setCompany('')
    setContactPerson('')
    setPhone('')
    setEmail('')
    setAddress('')
    setCreditDays('0')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup)
    setName(sup.name)
    setCompany(sup.company || '')
    setContactPerson(sup.contactPerson || '')
    setPhone(sup.phone)
    setEmail(sup.email || '')
    setAddress(sup.address || '')
    setCreditDays(String(sup.creditDays || 0))
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenDetails = async (sup) => {
    setIsDetailsOpen(true)
    setIsDetailsLoading(true)
    try {
      const res = await suppliersAPI.get(sup.id)
      setActiveSupplier(res.data?.data || sup)
    } catch (err) {
      console.error('Failed to load supplier details:', err)
      setActiveSupplier(sup)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        company: company.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        creditDays: Number(creditDays || 0),
      }

      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, payload)
        setSuccessMsg(`Supplier "${name}" updated successfully.`)
      } else {
        await suppliersAPI.create(payload)
        setSuccessMsg(`Supplier "${name}" registered successfully.`)
      }

      setIsModalOpen(false)
      fetchSuppliers(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to save supplier.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (sup) => {
    if (!window.confirm(`Delete supplier "${sup.name}"?`)) return
    try {
      await suppliersAPI.delete(sup.id)
      setSuccessMsg(`Supplier "${sup.name}" deleted.`)
      fetchSuppliers(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete supplier.')
    }
  }

  // Summary Metrics calculations
  const totalVendors = pagination.total
  const totalBilled = suppliers.reduce((sum, s) => sum + (s.totalPurchased || 0), 0)
  const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0)
  const totalOutstanding = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Truck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Suppliers & Vendor Management
            </h1>
            <Badge variant="primary" size="sm">
              {totalVendors} Active Vendors
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain electronics distributors, purchase order ledgers, and accounts payable balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow-blue"
            >
              Add Supplier
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchSuppliers(pagination.page)}
            title="Refresh Vendors"
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
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Suppliers</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalVendors}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved hardware distributors</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Purchases</p>
          <h3 className="text-xl font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">
            {formatLKR(totalBilled)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Lifetime procurement volume</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Settled Payments</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatLKR(totalPaid)}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Disbursed to vendors</p>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Outstanding Payables</p>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatLKR(totalOutstanding)}
          </h3>
          <p className="text-[11px] text-rose-500 mt-0.5">Pending supplier dues</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company, vendor name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Truck}
                title="No suppliers found"
                description="No vendors found matching your search. Register your first supplier using the button above."
                actionLabel={canManage ? 'Add Supplier' : undefined}
                onAction={handleOpenAdd}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier & Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Credit Terms</TableHead>
                  <TableHead>Orders Count</TableHead>
                  <TableHead>Total Billed (LKR)</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((sup) => (
                  <TableRow key={sup.id}>
                    <TableCell>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(sup)}
                          className="font-semibold text-xs text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors"
                        >
                          {sup.name}
                        </button>
                        {sup.company && (
                          <span className="text-[11px] text-slate-400 block">{sup.company}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {sup.contactPerson || '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono">{sup.phone}</span>
                        </div>
                        {sup.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{sup.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={sup.creditDays > 0 ? 'purple' : 'default'} size="sm">
                        {sup.creditDays > 0 ? `${sup.creditDays} Days Credit` : 'COD'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {sup.totalPurchasesCount || 0} Orders
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formatLKR(sup.totalPurchased || 0)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className={`text-xs font-bold ${
                        (sup.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {formatLKR(sup.outstandingBalance || 0)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDetails(sup)}
                          title="View Ledger & PO History"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenEdit(sup)}
                              title="Edit Supplier"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(sup)}
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                            </Button>
                          </>
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
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} suppliers)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchSuppliers(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchSuppliers(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: Add / Edit Supplier */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Vendor Profile' : 'Register New Hardware Supplier'}
        description="Maintain authorized distributors, credit agreements, and procurement contacts."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Singer Sri Lanka PLC"
              required
            />
            <Input
              label="Company / Distributor Entity"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Singer (Sri Lanka) Holding PLC"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Suresh Wickramasinghe"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0112458890"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address (Optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@singersl.com"
            />
            <Input
              label="Credit Period (Days)"
              type="number"
              min="0"
              value={creditDays}
              onChange={(e) => setCreditDays(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>

          <Input
            label="Physical Address / Warehouse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. No. 112, Havelock Road, Colombo 05"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Supplier Details & PO History */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={activeSupplier?.name || 'Supplier Profile'}
        description={`Phone: ${activeSupplier?.phone || ''} • Credit: ${activeSupplier?.creditDays || 0} Days`}
        maxWidth="3xl"
      >
        {isDetailsLoading || !activeSupplier ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Ledger Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatLKR(activeSupplier.ledger?.totalPurchased || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Total Paid</span>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {formatLKR(activeSupplier.ledger?.totalPaid || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] uppercase font-bold text-rose-600">Outstanding Balance</span>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {formatLKR(activeSupplier.ledger?.outstandingBalance || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {activeSupplier.ledger?.totalOrdersCount || 0} POs
                </p>
              </div>
            </div>

            {/* Purchase Orders History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Purchase Order History & Shipments
              </h4>

              {!activeSupplier.purchases || activeSupplier.purchases.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 border rounded-xl border-dashed">
                  No purchase orders recorded for this supplier yet.
                </p>
              ) : (
                <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Items / Devices</TableHead>
                        <TableHead>Total Amount (LKR)</TableHead>
                        <TableHead>Paid Amount</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSupplier.purchases.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell>
                            <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                              #{po.poNumber}
                            </code>
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
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {formatLKR(po.paidAmount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={po.status === 'RECEIVED' ? 'success' : 'warning'} size="sm">
                              {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={po.paymentStatus === 'PAID' ? 'success' : po.paymentStatus === 'PARTIALLY_PAID' ? 'warning' : 'danger'} size="sm">
                              {po.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
