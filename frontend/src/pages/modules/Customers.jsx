import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  Wrench,
  AlertCircle,
  FileText,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { customersAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'

// Sri Lankan Mobile Operator Detection Helper
const getSriLankanCarrier = (phone) => {
  if (!phone) return null
  const clean = String(phone).replace(/\D/g, '')
  let prefix = ''
  if (clean.startsWith('94') && clean.length >= 4) {
    prefix = '0' + clean.slice(2, 4)
  } else if (clean.startsWith('0') && clean.length >= 3) {
    prefix = clean.slice(0, 3)
  } else if (clean.length >= 2 && !clean.startsWith('0')) {
    prefix = '0' + clean.slice(0, 2)
  }

  if (['077', '076', '074'].includes(prefix)) {
    return { name: 'Dialog', brand: 'Dialog 4G', badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900' }
  }
  if (['071', '070'].includes(prefix)) {
    return { name: 'Mobitel', brand: 'Mobitel 4G', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900' }
  }
  if (['078', '072'].includes(prefix)) {
    return { name: 'Hutch', brand: 'Hutch 4G', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900' }
  }
  if (['075'].includes(prefix)) {
    return { name: 'Airtel', brand: 'Airtel 4G', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900' }
  }
  return null
}

const getCustomerInitials = (firstName, lastName) => {
  const f = firstName?.trim() || ''
  const l = lastName?.trim() || ''
  if (!f && !l) return 'CU'
  if (f && l) return (f[0] + l[0]).toUpperCase()
  return f.slice(0, 2).toUpperCase()
}

export function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [summary, setSummary] = useState({ totalCustomers: 0, totalDue: 0 })

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // 360 Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [activeProfileTab, setActiveProfileTab] = useState('sales') // 'sales', 'warranties', 'repairs'
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Fetch Customers
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await customersAPI.list({ search, page, limit: 15 })
      const data = res.data.data
      setCustomers(data.items || [])
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      setSummary({
        totalCustomers: data.summary?.totalCustomers || 0,
        totalDue: data.summary?.totalOutstandingBalance || 0,
      })
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, page])

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCustomer(null)
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    })
    setFormError('')
    setIsFormOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
    })
    setFormError('')
    setIsFormOpen(true)
  }

  // Submit Add / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSubmitting(true)
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData)
      } else {
        await customersAPI.create(formData)
      }
      setIsFormOpen(false)
      loadCustomers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please verify input.'
      setFormError(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return
    try {
      await customersAPI.delete(id)
      loadCustomers()
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete customer with active sales or records.')
    }
  }

  // View Customer 360
  const handleViewProfile = async (id) => {
    try {
      setLoadingProfile(true)
      setProfileModalOpen(true)
      const res = await customersAPI.get(id)
      setSelectedCustomer(res.data.data)
      setActiveProfileTab('sales')
    } catch (err) {
      alert('Failed to load customer profile details.')
      setProfileModalOpen(false)
    } finally {
      setLoadingProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Customer Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Directory, purchase history, device ownership, and receivables ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCustomers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Clients
            </span>
            <Users className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Registered</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Receivables Due
            </span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatLKR(summary.totalDue)}
            </span>
            <span className="text-xs text-slate-400">Balance</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Health
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.totalDue === 0 ? '100%' : '94.2%'}
            </span>
            <span className="text-xs text-slate-400">On-time</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Warranty Protection
            </span>
            <ShieldCheck className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              Automated
            </span>
            <span className="text-xs text-slate-400">Active</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, email, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4 text-right">Total Spent</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Users className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const fullName = `${c.firstName} ${c.lastName || ''}`.trim()
                  const totalSpent = Number(c.totalSpent || 0)
                  const outstanding = Number(c.outstandingBalance || 0)
                  const initials = `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 font-bold text-xs dark:bg-brand-500/20 dark:text-brand-400">
                            {initials || 'C'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {fullName}
                            </span>
                            {c.notes && (
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {c.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {c.phone}
                          </div>
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {c.email}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {c.city ? (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {c.city}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" size="sm">
                          {c._count?.sales || 0} sales
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                        {formatLKR(totalSpent)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {outstanding > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatLKR(outstanding)}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium dark:text-emerald-400">
                            Paid In Full
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="View 360° Profile"
                            onClick={() => handleViewProfile(c.id)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            title="Edit Customer"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete Customer"
                            onClick={() => handleDeleteCustomer(c.id, fullName)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Register New Customer Pass'}
        description="Attach contact details for digital cellular SMS dispatch (Hotline: 0713857835), warranty certification, and client history."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-1">
          {formError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Live Virtual Customer Smart Card Preview */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-4 border border-indigo-500/30 shadow-xl">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  NexaPOS Customer Account
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-amber-300" /> Standard Tier
              </span>
            </div>

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purpleAccent-600 text-white font-black text-base flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  {getCustomerInitials(formData.firstName, formData.lastName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white truncate">
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`.trim()
                    : 'Customer Full Name'}
                </h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    {formData.phone || '07X XXX XXXX'}
                  </span>
                  {getSriLankanCarrier(formData.phone) ? (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${getSriLankanCarrier(formData.phone).badge}`}>
                      ● {getSriLankanCarrier(formData.phone).brand}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Sri Lankan Mobile (+94)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] relative z-10 text-slate-300">
              <span className="flex items-center gap-1 text-[10px] text-slate-300 truncate">
                City: <strong className="font-medium text-white">{formData.city || 'Not specified'}</strong>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SMS Dispatch: 0713857835
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                First Name *
              </label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Kamal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Last Name
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Jayawardena"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-600" />
                  Phone Number *
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-semibold hidden sm:inline">1-Tap:</span>
                  {[
                    { prefix: '077', label: '077' },
                    { prefix: '071', label: '071' },
                    { prefix: '076', label: '076' },
                    { prefix: '078', label: '078' },
                    { prefix: '075', label: '075' },
                  ].map((item) => (
                    <button
                      key={item.prefix}
                      type="button"
                      onClick={() => {
                        const currentDigits = formData.phone.replace(/\D/g, '')
                        const rest = currentDigits.length >= 3 ? currentDigits.slice(3) : ''
                        setFormData({ ...formData, phone: item.prefix + rest })
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-brand-50 dark:bg-dark-surface dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-600 border border-slate-200 dark:border-dark-border font-mono font-bold text-[10px] transition-colors"
                    >
                      {item.prefix}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0771234567"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Normal cellular SMS delivery (No WhatsApp)</span>
                <span className="font-mono">
                  {formData.phone.replace(/\D/g, '').length}/10 digits
                  {formData.phone.replace(/\D/g, '').length === 10 && (
                    <span className="text-emerald-500 font-bold ml-1">✓ Valid</span>
                  )}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address (Optional)
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="kamal@gmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Street Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="No. 45, Galle Road"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  City / Town
                </label>
                <div className="flex items-center gap-1 text-[10px] overflow-x-auto no-scrollbar">
                  {['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Negombo'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, city: c })}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Colombo 03"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VIP Client, preferred contact channel, corporate account..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitting} className="bg-brand-600 text-white hover:bg-brand-700">
              {formSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer 360 Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Customer 360° Profile"
        description="Comprehensive history across sales invoices, active warranties, and workshop repair tickets."
        maxWidth="3xl"
      >
        {loadingProfile || !selectedCustomer ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-2 text-brand-500" />
            Loading customer 360 profile...
          </div>
        ) : (
          <div className="space-y-5 pt-1">
            {/* Customer Header Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 font-bold text-lg dark:bg-brand-500/20 dark:text-brand-400">
                    {selectedCustomer.firstName?.[0]}
                    {selectedCustomer.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {selectedCustomer.phone}
                      </span>
                      {selectedCustomer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {selectedCustomer.email}
                        </span>
                      )}
                      {selectedCustomer.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {selectedCustomer.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    Outstanding Balance
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      Number(selectedCustomer.outstandingBalance) > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatLKR(selectedCustomer.outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveProfileTab('sales')}
                className={`flex items-center gap-2 pb-2.5 text-sm font-semibold border-b-2 shrink-0 transition-colors ${
                  activeProfileTab === 'sales'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Sales History ({selectedCustomer.sales?.length || 0})
              </button>

              <button
                onClick={() => setActiveProfileTab('warranties')}
                className={`flex items-center gap-2 pb-2.5 text-sm font-semibold border-b-2 shrink-0 transition-colors ${
                  activeProfileTab === 'warranties'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Warranties ({selectedCustomer.warranties?.length || 0})
              </button>

              <button
                onClick={() => setActiveProfileTab('repairs')}
                className={`flex items-center gap-2 pb-2.5 text-sm font-semibold border-b-2 shrink-0 transition-colors ${
                  activeProfileTab === 'repairs'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Wrench className="h-4 w-4" />
                Repair Jobs ({selectedCustomer.repairs?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="max-h-80 overflow-y-auto">
              {activeProfileTab === 'sales' && (
                <div className="space-y-2">
                  {selectedCustomer.sales?.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-400">No purchase records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-2.5">Invoice #</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Items</th>
                            <th className="p-2.5 text-right">Total</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedCustomer.sales.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono font-semibold text-brand-600 dark:text-brand-400">
                                {s.invoiceNumber}
                              </td>
                              <td className="p-2.5 text-slate-500">
                                {new Date(s.saleDate).toLocaleDateString()}
                              </td>
                              <td className="p-2.5">{s.items?.length || 0} items</td>
                              <td className="p-2.5 text-right font-medium text-slate-900 dark:text-white">
                                {formatLKR(s.totalAmount)}
                              </td>
                              <td className="p-2.5 text-center">
                                <Badge
                                  variant={s.paymentStatus === 'PAID' ? 'success' : 'warning'}
                                  size="sm"
                                >
                                  {s.paymentStatus}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'warranties' && (
                <div className="space-y-2">
                  {selectedCustomer.warranties?.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-400">No registered warranties found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-2.5">Warranty Code</th>
                            <th className="p-2.5">Device Model / IMEI</th>
                            <th className="p-2.5">Valid Until</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedCustomer.warranties.map((w) => (
                            <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono font-semibold text-brand-600 dark:text-brand-400">
                                {w.warrantyCode}
                              </td>
                              <td className="p-2.5">
                                <div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {w.device?.productVariant?.product?.name || 'Device'}
                                  </span>
                                  {w.device?.imei1 && (
                                    <span className="block font-mono text-[11px] text-slate-400">
                                      IMEI: {w.device.imei1}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5 text-slate-500">
                                {new Date(w.endDate).toLocaleDateString()}
                              </td>
                              <td className="p-2.5 text-center">
                                <Badge
                                  variant={w.status === 'ACTIVE' ? 'success' : w.status === 'EXPIRED' ? 'danger' : 'warning'}
                                  size="sm"
                                >
                                  {w.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'repairs' && (
                <div className="space-y-2">
                  {selectedCustomer.repairs?.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-400">No repair tickets found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-2.5">Ticket #</th>
                            <th className="p-2.5">Device & Problem</th>
                            <th className="p-2.5 text-right">Est. Cost</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedCustomer.repairs.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono font-semibold text-brand-600 dark:text-brand-400">
                                {r.ticketNumber}
                              </td>
                              <td className="p-2.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                  {r.deviceModel}
                                </span>
                                <span className="text-slate-400 line-clamp-1">{r.issueDescription}</span>
                              </td>
                              <td className="p-2.5 text-right font-medium text-slate-900 dark:text-white">
                                {formatLKR(r.finalCost || r.estimatedCost)}
                              </td>
                              <td className="p-2.5 text-center">
                                <Badge variant="purple" size="sm">
                                  {r.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default Customers
