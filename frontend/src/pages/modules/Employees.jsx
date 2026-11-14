import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Phone,
  Mail,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Power,
  Trash2,
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
import { usersAPI } from '@/services/api'
import { ROLE_LABELS, ROLE_BADGE_COLORS, useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export function Employees() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Create User Modal
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
  })

  // Load staff & roles
  const fetchStaffData = async () => {
    try {
      setLoading(true)
      setError('')
      const [usersRes, rolesRes] = await Promise.all([
        usersAPI.list(),
        usersAPI.getRoles(),
      ])
      const fetchedUsers = usersRes.data?.data || []
      const fetchedRoles = rolesRes.data?.data || []
      setUsers(fetchedUsers)
      setRoles(fetchedRoles)

      if (fetchedRoles.length > 0 && !formData.roleId) {
        setFormData((prev) => ({ ...prev, roleId: fetchedRoles[0].id }))
      }
    } catch (err) {
      console.error('Failed to load staff list:', err)
      setError(err.response?.data?.message || 'Failed to load employees list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffData()
  }, [])

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
      setError('Please fill in all mandatory fields (Name, Email, Password, Role).')
      return
    }

    try {
      setCreateLoading(true)
      setError('')
      await usersAPI.create(formData)
      setSuccessMsg(`Employee account for ${formData.name} created successfully!`)
      setIsAddOpen(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        roleId: roles[0]?.id || '',
      })
      await fetchStaffData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setCreateLoading(false)
    }
  }

  // Handle Deactivate / Toggle Status
  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.update(user.id, { isActive: !user.isActive })
      setSuccessMsg(`Staff member ${user.name} is now ${!user.isActive ? 'Active' : 'Disabled'}.`)
      await fetchStaffData()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee status')
    }
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
    const matchesRole = roleFilter === 'ALL' || u.role?.name === roleFilter
    return matchesSearch && matchesRole
  })

  // Role count metrics
  const totalStaff = users.length
  const activeStaff = users.filter((u) => u.isActive).length
  const cashierCount = users.filter((u) => u.role?.name === 'CASHIER').length
  const techCount = users.filter((u) => u.role?.name === 'TECHNICIAN').length
  const stockCount = users.filter((u) => u.role?.name === 'STOCK_KEEPER').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employees & Permissions (RBAC)
            </h1>
            <Badge variant="outline" className="border-brand-300 text-brand-700 dark:text-brand-300 bg-brand-50/50">
              5 System Roles
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage store team members, enforce role-based access control, and track login histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchStaffData} isLoading={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 rounded-lg text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Team
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStaff} <span className="text-xs font-normal text-slate-400">staff</span>
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">{activeStaff} Active Accounts</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Cashiers
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {cashierCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">POS & Billing terminal</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Technicians
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {techCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Hardware & Repairs</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
            Stock Keepers
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stockCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Warehouse & IMEI intake</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Access Security
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            RBAC
          </p>
          <p className="text-xs text-slate-500 mt-1">Full bcrypt & JWT audit</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-slate-200 dark:border-dark-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search by name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles ({totalStaff})</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.displayName || r.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="border-slate-200 dark:border-dark-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Details</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Contact Phone</TableHead>
              <TableHead>Last Sign-In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <EmptyState
                    icon={UserCheck}
                    title="No Employees Found"
                    description="No staff members matched your search criteria."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((usr) => (
                <TableRow key={usr.id} className="hover:bg-slate-50/70 dark:hover:bg-dark-hover/40 transition-colors">
                  {/* Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-dark-border overflow-hidden">
                        {usr.avatar ? (
                          <img src={usr.avatar} alt={usr.name} className="w-full h-full object-cover" />
                        ) : (
                          usr.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {usr.name}
                          {usr.id === currentUser?.id && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{usr.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <span className={cn('inline-block px-2.5 py-0.5 text-xs font-bold rounded-md border', ROLE_BADGE_COLORS[usr.role?.name] || 'bg-slate-100 text-slate-700')}>
                      {ROLE_LABELS[usr.role?.name] || usr.role?.displayName || usr.role?.name}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {usr.phone || '—'}
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="text-xs text-slate-500">
                    {usr.lastLoginAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(usr.lastLoginAt).toLocaleDateString()} {new Date(usr.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Never signed in</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {usr.isActive ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">Disabled</Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {usr.id !== currentUser?.id && (
                      <Button
                        variant={usr.isActive ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleStatus(usr)}
                        className="h-8 text-xs"
                      >
                        <Power className={cn('w-3.5 h-3.5 mr-1', usr.isActive ? 'text-amber-500' : 'text-emerald-500')} />
                        {usr.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Employee Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Register New Employee"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Priyantha Jayasuriya"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. priyantha@nexapos.lk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Temporary Password *"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              label="Contact Phone"
              placeholder="e.g. +94 77 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Assign System Role *
              </label>
              <Select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.displayName || r.name} - {r.description || ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={createLoading}>
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
