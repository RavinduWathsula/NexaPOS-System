import React from 'react'
import { Users } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function Customers() {
  const metrics = [
    { label: 'Total Customers', value: '3,842', subtext: 'Registered clients' },
    { label: 'VIP Repeat Buyers', value: '412', subtext: 'Loyalty member tier' },
    { label: 'Active Warranties', value: '1,420', subtext: 'Registered device owners' },
    { label: 'Customer Due', value: 'Rs. 0.00', subtext: 'Zero credit risk' },
  ]

  const tableHeaders = ['Customer Name', 'Phone Number', 'Email / NIC', 'Total Orders', 'Total Spent (LKR)', 'Loyalty Tier']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Kamal Jayawardena</div>,
      '077 123 4567',
      'kamal.j@gmail.com • 891234567V',
      '6 Orders',
      <span className="font-bold">{formatLKR(1240000)}</span>,
      <Badge variant="purple" size="sm">Gold Member</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Nadeeka Senanayake</div>,
      '071 889 2311',
      'nadeeka.s@outlook.com',
      '4 Orders',
      <span className="font-bold">{formatLKR(895000)}</span>,
      <Badge variant="primary" size="sm">Silver Member</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Dilan Ranasinghe</div>,
      '076 443 1928',
      'dilan.rana@yahoo.com',
      '2 Orders',
      <span className="font-bold">{formatLKR(142000)}</span>,
      <Badge variant="default" size="sm">Standard</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Customer Directory"
      subtitle="Customer profiles, purchase history, device ownership, and warranty certificates."
      icon={Users}
      badgeText="3,842 Clients"
      primaryActionLabel="New Customer"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

