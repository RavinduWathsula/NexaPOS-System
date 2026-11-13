import React from 'react'
import { Tag } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'

export function Brands() {
  const metrics = [
    { label: 'Total Brands', value: '24', subtext: 'Registered manufacturers' },
    { label: 'Top Brand', value: 'Apple', subtext: '58% of store revenue' },
    { label: 'Authorized Dealer', value: '12 Brands', subtext: 'Official distributor warranty' },
    { label: 'Partner Brands', value: '8 Brands', subtext: 'Local warranty partner' },
  ]

  const tableHeaders = ['Brand Name', 'Manufacturer Country', 'Warranty Policy', 'Active Items', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Apple Inc.</div>,
      'United States',
      '1 Year Apple Official International',
      '412 Products',
      <Badge variant="purple" size="sm">Tier 1 Partner</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Samsung Electronics</div>,
      'South Korea',
      '1 Year Singer / John Keells Regional',
      '340 Products',
      <Badge variant="purple" size="sm">Authorized</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Xiaomi Corporation</div>,
      'China',
      '1 Year Abans Sri Lanka',
      '195 Products',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Anker Innovations</div>,
      'United States',
      '18 Months Replacement Warranty',
      '110 Products',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Brand Management"
      subtitle="Track electronics brands, authorized distributor relationships and manufacturer warranty terms."
      icon={Tag}
      badgeText="24 Brands"
      primaryActionLabel="New Brand"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

