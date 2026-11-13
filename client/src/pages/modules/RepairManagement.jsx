import React from 'react'
import { Wrench, Clock, CheckCircle2 } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function RepairManagement() {
  const metrics = [
    { label: 'Active Repair Jobs', value: '8 Devices', subtext: 'Currently in workshop' },
    { label: 'Ready for Pickup', value: '3 Devices', subtext: 'Customer notified via SMS' },
    { label: 'Completed (This Month)', value: '46 Repairs', subtext: 'Average cost Rs. 14,500' },
    { label: 'Repair Revenue', value: formatLKR(667000, false), subtext: 'Labor + Parts' },
  ]

  const tableHeaders = ['Job Ticket', 'Device & Issue', 'Customer', 'Assigned Tech', 'Est. Cost (LKR)', 'Parts Used', 'Repair Status']

  const sampleRows = [
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#REP-2024-089</div>,
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">Samsung Galaxy S23 Ultra</p>
        <p className="text-[10px] text-slate-400">Broken Dynamic AMOLED 2X Display</p>
      </div>,
      'Shanaka Dias (077 444 5566)',
      'Dinesh (Senior Tech)',
      <span className="font-bold">{formatLKR(85000)}</span>,
      'OEM OLED Assembly + Water Seal',
      <Badge variant="success" size="sm">Ready for Pickup</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#REP-2024-090</div>,
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">iPhone 13 Pro</p>
        <p className="text-[10px] text-slate-400">Battery health 71% - Rapid draining</p>
      </div>,
      'Nuwan Samaraweera (071 222 3344)',
      'Dinesh (Senior Tech)',
      <span className="font-bold">{formatLKR(22000)}</span>,
      'Apple High-Capacity Battery Pack',
      <Badge variant="warning" size="sm">In Progress</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#REP-2024-091</div>,
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">Xiaomi Redmi Note 12</p>
        <p className="text-[10px] text-slate-400">Charging port ribbon damaged</p>
      </div>,
      'Kasun Jayasuriya (076 999 8877)',
      'Dinesh (Senior Tech)',
      <span className="font-bold">{formatLKR(6500)}</span>,
      'Type-C Sub-board',
      <Badge variant="primary" size="sm">Diagnostics</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Mobile Repair & Workshop"
      subtitle="Track technician jobs, spare parts consumption, estimated quotes, and repair status notifications."
      icon={Wrench}
      badgeText="4 Due Today"
      primaryActionLabel="New Repair Job"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

