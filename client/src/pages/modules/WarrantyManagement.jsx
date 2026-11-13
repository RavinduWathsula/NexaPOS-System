import React from 'react'
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'

export function WarrantyManagement() {
  const metrics = [
    { label: 'Active Warranties', value: '1,420', subtext: 'Registered devices' },
    { label: 'Expiring in 30 Days', value: '38', subtext: 'Reminder triggered' },
    { label: 'Claims Handled', value: '52', subtext: 'This quarter' },
    { label: 'Avg Claim Turnaround', value: '3.5 Days', subtext: 'Vendor resolution' },
  ]

  const tableHeaders = ['Warranty Code', 'IMEI / Serial', 'Customer & Phone', 'Device Model', 'Period', 'Expiry Date', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#WAR-2024-4192</div>,
      <span className="font-mono text-xs">354892019482910</span>,
      'Kamal Jayawardena (077 123 4567)',
      'iPhone 15 Pro (256GB)',
      '12 Months (Apple Care)',
      'Nov 14, 2025',
      <Badge variant="success" size="sm">Valid & Active</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#WAR-2024-3810</div>,
      <span className="font-mono text-xs">357281098231902</span>,
      'Nadeeka Senanayake (071 889 2311)',
      'Samsung S24 Ultra',
      '12 Months (Singer Regional)',
      'Oct 28, 2025',
      <Badge variant="success" size="sm">Valid & Active</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#WAR-2023-1102</div>,
      <span className="font-mono text-xs">SN-SNY-8812903</span>,
      'Kamal Perera (077 345 6789)',
      'Sony WH-1000XM5',
      '12 Months (Audio Tech)',
      'Nov 17, 2024 (3 Days)',
      <Badge variant="warning" size="sm">Expiring Soon</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Warranty Management"
      subtitle="Issue and verify electronic warranty cards linked directly to unique IMEI serial numbers."
      icon={ShieldCheck}
      badgeText="Automated Issuance"
      primaryActionLabel="Verify Warranty"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

