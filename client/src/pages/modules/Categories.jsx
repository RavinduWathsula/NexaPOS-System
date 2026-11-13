import React from 'react'
import { FolderTree } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'

export function Categories() {
  const metrics = [
    { label: 'Total Categories', value: '18', subtext: 'Department hierarchy' },
    { label: 'Hardware & Phones', value: '8', subtext: 'Serialized categories' },
    { label: 'Accessories', value: '10', subtext: 'Fast-moving stock' },
    { label: 'Active Discounts', value: '3', subtext: 'Category-level promos' },
  ]

  const tableHeaders = ['Category Name', 'Slug', 'Tracking Type', 'Total Items', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Smartphones & Handsets</div>,
      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">smartphones</code>,
      <Badge variant="purple" size="sm">Strict IMEI Tracking</Badge>,
      '385 Models',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Tablets & iPads</div>,
      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">tablets</code>,
      <Badge variant="purple" size="sm">Serial & IMEI</Badge>,
      '124 Models',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Fast Chargers & Adapters</div>,
      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">chargers</code>,
      <Badge variant="default" size="sm">Quantity Tracked</Badge>,
      '84 Products',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Audio & Earphones</div>,
      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">audio</code>,
      <Badge variant="purple" size="sm">Serial Number</Badge>,
      '96 Products',
      <Badge variant="success" size="sm">Active</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Product Categories"
      subtitle="Organize phones, audio, smart watches, chargers, and display protection accessories."
      icon={FolderTree}
      badgeText="18 Categories"
      primaryActionLabel="New Category"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

