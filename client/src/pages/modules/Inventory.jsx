import React from 'react'
import { Boxes } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function Inventory() {
  const metrics = [
    { label: 'Total Valuation', value: formatLKR(48500000, false), subtext: 'Based on cost price' },
    { label: 'Retail Value', value: formatLKR(62400000, false), subtext: 'Potential revenue' },
    { label: 'Low Stock Alerts', value: '14 Items', subtext: 'Under reorder limit' },
    { label: 'Damaged / Waste', value: '0 Units', subtext: 'Healthy inventory' },
  ]

  const tableHeaders = ['Product / Device', 'Warehouse Location', 'Available Units', 'Unit Cost (LKR)', 'Stock Value (LKR)', 'Stock Health']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Apple iPhone 15 Pro (256GB)</div>,
      'Main Vault - Shelf A1',
      '8 Units (IMEI)',
      formatLKR(385000),
      <span className="font-bold">{formatLKR(3080000)}</span>,
      <Badge variant="success" size="sm">Optimal</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Apple 20W USB-C Adapter</div>,
      'Accessory Rack - B3',
      '42 Units',
      formatLKR(6200),
      <span className="font-bold">{formatLKR(260400)}</span>,
      <Badge variant="success" size="sm">Optimal</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Anker PowerCore 20000mAh</div>,
      'Accessory Rack - C2',
      '18 Units',
      formatLKR(14500),
      <span className="font-bold">{formatLKR(261000)}</span>,
      <Badge variant="success" size="sm">Optimal</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">iPhone 15 Pro Max (Titanium)</div>,
      'Main Vault - Shelf A2',
      '2 Units (IMEI)',
      formatLKR(440000),
      <span className="font-bold">{formatLKR(880000)}</span>,
      <Badge variant="danger" size="sm">Low Stock Alert</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Inventory & Stock Movement"
      subtitle="Warehouse valuation, batch logs, reorder thresholds, and bin-level location tracking."
      icon={Boxes}
      badgeText="Colombo Branch"
      primaryActionLabel="Stock Adjustment"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

