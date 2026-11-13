import React from 'react'
import { Truck } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function Suppliers() {
  const metrics = [
    { label: 'Active Suppliers', value: '16', subtext: 'Registered vendors' },
    { label: 'Total Payable', value: formatLKR(3450000, false), subtext: 'Pending balances' },
    { label: 'Preferred Partners', value: '5 Vendors', subtext: 'Discounts & credit terms' },
    { label: 'Avg Delivery Time', value: '2 Days', subtext: 'Express fulfillment' },
  ]

  const tableHeaders = ['Supplier Name', 'Contact Person', 'Phone / Email', 'Credit Term', 'Outstanding (LKR)', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Singer Sri Lanka PLC</div>,
      'Suresh Wickramasinghe',
      '011 245 8890 • sales@singersl.com',
      '30 Days Credit',
      <span className="font-bold text-rose-600">{formatLKR(2100000)}</span>,
      <Badge variant="success" size="sm">Active Partner</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Softlogic Holdings PLC</div>,
      'Pradeep Silva',
      '011 556 7000 • pradeep.s@softlogic.lk',
      '15 Days Credit',
      <span className="font-bold text-rose-600">{formatLKR(1350000)}</span>,
      <Badge variant="success" size="sm">Active Partner</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Anker Direct Distributor</div>,
      'Mohamed Farhan',
      '077 890 1234 • farhan@ankersl.lk',
      'Cash On Delivery',
      <span className="font-bold text-emerald-600">Rs. 0.00</span>,
      <Badge variant="success" size="sm">Active</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Suppliers & Vendors"
      subtitle="Maintain electronic hardware distributors, supplier credit terms, and purchase histories."
      icon={Truck}
      badgeText="16 Vendors"
      primaryActionLabel="Add Supplier"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

