import React from 'react'
import { Receipt, ScanLine } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function SalesInvoices() {
  const metrics = [
    { label: "Today's Invoices", value: '48', subtext: 'Generated at POS' },
    { label: 'Total Invoiced Today', value: formatLKR(485250, false), subtext: '100% Settled' },
    { label: 'Split Payments', value: '14 Sales', subtext: 'Cash + Card combos' },
    { label: 'Warranty Claims', value: '0 Claims', subtext: 'Today' },
  ]

  const tableHeaders = ['Invoice Number', 'Date & Time', 'Customer', 'Items Sold', 'Payment Breakdown', 'Invoice Total (LKR)', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#INV-2024-10492</div>,
      'Today, 02:45 PM',
      'Kamal Jayawardena',
      <div>
        <p className="text-xs font-medium">iPhone 15 Pro (256GB)</p>
        <p className="text-[10px] text-purpleAccent-600 font-mono">IMEI: 354892019482910</p>
      </div>,
      <Badge variant="primary" size="sm">Split: Cash (200K) + Card (235K)</Badge>,
      <span className="font-bold">{formatLKR(435000)}</span>,
      <Badge variant="success" size="sm">Paid</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#INV-2024-10491</div>,
      'Today, 01:15 PM',
      'Nadeeka Senanayake',
      <div>
        <p className="text-xs font-medium">Samsung S24 Ultra (512GB)</p>
        <p className="text-[10px] text-purpleAccent-600 font-mono">IMEI: 357281098231902</p>
      </div>,
      <Badge variant="default" size="sm">Visa Card #4829</Badge>,
      <span className="font-bold">{formatLKR(465000)}</span>,
      <Badge variant="success" size="sm">Paid</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#INV-2024-10490</div>,
      'Today, 11:20 AM',
      'Dilan Ranasinghe',
      'Apple AirPods Pro + Case',
      <Badge variant="default" size="sm">Cash Payment</Badge>,
      <span className="font-bold">{formatLKR(88500)}</span>,
      <Badge variant="success" size="sm">Paid</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Sales & Invoices"
      subtitle="Complete register of all retail transactions, printable receipts, and payment method breakdowns."
      icon={Receipt}
      badgeText="POS Billing History"
      primaryActionLabel="Export Report"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

