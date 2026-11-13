import React from 'react'
import { DollarSign } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function ExpensesFinance() {
  const metrics = [
    { label: 'Expenses (This Month)', value: formatLKR(480000, false), subtext: 'Rent, utilities, staff snacks' },
    { label: 'Shop Rent (Colombo)', value: formatLKR(250000, false), subtext: 'Paid for Nov' },
    { label: 'Electricity & Internet', value: formatLKR(68000, false), subtext: 'Commercial tariff' },
    { label: 'Workshop Tooling', value: formatLKR(42000, false), subtext: 'Soldering flux, blades' },
  ]

  const tableHeaders = ['Expense Title', 'Expense Category', 'Payment Method', 'Date Recorded', 'Amount (LKR)', 'Authorized By']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Colombo Retail Store Rent (Nov)</div>,
      <Badge variant="purple" size="sm">Store Rent</Badge>,
      'Bank Transfer (Commercial Bank)',
      'Nov 01, 2024',
      <span className="font-bold text-rose-600">{formatLKR(250000)}</span>,
      'Kasun (Super Admin)',
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Ceylon Electricity Board Bill</div>,
      <Badge variant="default" size="sm">Utilities</Badge>,
      'Online Banking',
      'Nov 05, 2024',
      <span className="font-bold text-rose-600">{formatLKR(52000)}</span>,
      'Nimal (Manager)',
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Fiber Internet (SLT 100Mbps)</div>,
      <Badge variant="default" size="sm">Utilities</Badge>,
      'Credit Card',
      'Nov 06, 2024',
      <span className="font-bold text-rose-600">{formatLKR(16000)}</span>,
      'Nimal (Manager)',
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Workshop Soldering Iron & Heat Gun Consumables</div>,
      <Badge variant="warning" size="sm">Repair Workshop</Badge>,
      'Petty Cash',
      'Nov 09, 2024',
      <span className="font-bold text-rose-600">{formatLKR(18500)}</span>,
      'Dinesh (Technician)',
    ],
  ]

  return (
    <PlaceholderPage
      title="Expenses & Operating Finance"
      subtitle="Track shop operational overheads, store rent, utility bills, workshop maintenance, and petty cash."
      icon={DollarSign}
      badgeText="Operational Outflows"
      primaryActionLabel="Log New Expense"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

