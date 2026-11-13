import React from 'react'
import { UserCheck, Shield } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { DEMO_USERS, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export function Employees() {
  const metrics = [
    { label: 'Total Staff', value: '5 Employees', subtext: 'Across all roles' },
    { label: 'Active Cashiers', value: '1 Active', subtext: 'Terminal 01 online' },
    { label: 'Technicians', value: '1 Assigned', subtext: 'Repair workshop' },
    { label: 'Stock Keepers', value: '1 Assigned', subtext: 'Warehouse & GRN' },
  ]

  const tableHeaders = ['Employee Name', 'Staff Role', 'Email Address', 'Phone Number', 'Access Level', 'Status']

  const sampleRows = DEMO_USERS.map((usr) => [
    <div className="flex items-center gap-2.5">
      <img src={usr.avatar} alt={usr.name} className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-dark-border" />
      <span className="font-semibold text-slate-900 dark:text-white">{usr.name}</span>
    </div>,
    <span className={cn('inline-block px-2 py-0.5 text-xs font-bold rounded-md border', ROLE_BADGE_COLORS[usr.role])}>
      {ROLE_LABELS[usr.role]}
    </span>,
    <span className="text-xs text-slate-500">{usr.email}</span>,
    <span className="text-xs font-mono">{usr.phone}</span>,
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
      {usr.role === 'SUPER_ADMIN' ? 'Full Access' : usr.role === 'MANAGER' ? 'Operational Management' : 'Restricted Role'}
    </span>,
    <Badge variant="success" size="sm">Active</Badge>,
  ])

  return (
    <PlaceholderPage
      title="Employees & Permissions (RBAC)"
      subtitle="Role-Based Access Control for Super Admin, Manager, Cashier, Technician, and Stock Keeper."
      icon={UserCheck}
      badgeText="5 Roles Enforced"
      primaryActionLabel="Add Employee"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

