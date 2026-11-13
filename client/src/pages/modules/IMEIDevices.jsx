import React from 'react'
import { ScanLine, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function IMEIDevices() {
  const metrics = [
    { label: 'In-Stock IMEI Units', value: '412', subtext: 'Ready for retail sale' },
    { label: 'Sold & Active Devices', value: '1,894', subtext: 'Under active warranty' },
    { label: 'Under Repair Service', value: '8', subtext: 'Currently in workshop' },
    { label: 'RMA / Defective Units', value: '2', subtext: 'Awaiting supplier replacement' },
  ]

  const tableHeaders = ['IMEI / Serial Number', 'Model & Specifications', 'Color / Storage', 'Purchase Cost (LKR)', 'Current Status', 'Invoice / Customer']

  const sampleRows = [
    [
      <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">354892019482910</div>,
      <div className="font-semibold text-slate-900 dark:text-white">iPhone 15 Pro Max</div>,
      'Natural Titanium • 256GB',
      <span className="font-semibold">{formatLKR(385000)}</span>,
      <Badge variant="success" size="sm" dot>In Stock</Badge>,
      <span className="text-xs text-slate-400">Available</span>,
    ],
    [
      <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">357281098231902</div>,
      <div className="font-semibold text-slate-900 dark:text-white">Samsung Galaxy S24 Ultra</div>,
      'Titanium Grey • 512GB',
      <span className="font-semibold">{formatLKR(410000)}</span>,
      <Badge variant="purple" size="sm" dot>Sold</Badge>,
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">#INV-10491 (Nadeeka S.)</span>,
    ],
    [
      <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">861928374619283</div>,
      <div className="font-semibold text-slate-900 dark:text-white">Xiaomi Redmi Note 13 Pro</div>,
      'Midnight Black • 256GB',
      <span className="font-semibold">{formatLKR(68000)}</span>,
      <Badge variant="success" size="sm" dot>In Stock</Badge>,
      <span className="text-xs text-slate-400">Available</span>,
    ],
    [
      <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">SN-SNY-9982103</div>,
      <div className="font-semibold text-slate-900 dark:text-white">Sony WH-1000XM5</div>,
      'Silver ANC',
      <span className="font-semibold">{formatLKR(115000)}</span>,
      <Badge variant="warning" size="sm" dot>Under Repair</Badge>,
      <span className="text-xs font-medium text-amber-600">Job #REP-2024-089</span>,
    ],
  ]

  return (
    <PlaceholderPage
      title="IMEI & Serial Number Registry"
      subtitle="Strict tracking of individual electronic devices. Ensures no double-sales and protects warranty authenticity."
      icon={ScanLine}
      badgeText="Active Anti-Duplicate Engine"
      primaryActionLabel="Intake Serial / IMEI"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

