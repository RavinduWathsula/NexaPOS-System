import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function Purchases() {
  const metrics = [
    { label: 'Purchases (This Month)', value: formatLKR(14250000, false), subtext: '28 Purchase orders' },
    { label: 'Pending Shipments', value: '3 POs', subtext: 'Expected this week' },
    { label: 'Supplier Payables', value: formatLKR(3450000, false), subtext: 'Due within 30 days' },
    { label: 'Received & Verified', value: '25 POs', subtext: 'IMEI matched' },
  ]

  const tableHeaders = ['PO Number', 'Supplier', 'Order Date', 'Items Count', 'Total Cost (LKR)', 'Payment Status', 'Delivery Status']

  const sampleRows = [
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#PO-2024-8821</div>,
      'Singer Sri Lanka PLC',
      'Today, 10:30 AM',
      '25 Phones (iPhone 16 Series)',
      <span className="font-bold">{formatLKR(8450000)}</span>,
      <Badge variant="warning" size="sm">Partial Paid</Badge>,
      <Badge variant="success" size="sm">Received</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#PO-2024-8820</div>,
      'Softlogic Communications',
      'Yesterday',
      '15 Tablets & Laptops',
      <span className="font-bold">{formatLKR(3800000)}</span>,
      <Badge variant="success" size="sm">Settled</Badge>,
      <Badge variant="success" size="sm">Received</Badge>,
    ],
    [
      <div className="font-semibold text-brand-600 dark:text-brand-400">#PO-2024-8819</div>,
      'Anker Regional Distributor',
      '3 days ago',
      '150 Accessories & Chargers',
      <span className="font-bold">{formatLKR(950000)}</span>,
      <Badge variant="success" size="sm">Settled</Badge>,
      <Badge variant="success" size="sm">Received</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Supplier Purchases & GRN"
      subtitle="Manage purchase orders, goods received notes (GRN), invoice matching, and supplier costs."
      icon={ShoppingBag}
      badgeText="LKR Procurement"
      primaryActionLabel="New Purchase Order"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

