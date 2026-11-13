import React from 'react'
import { Package, Plus, ScanLine, Tag } from 'lucide-react'
import { PlaceholderPage } from '../PlaceholderPage'
import { Badge } from '@/components/ui/Badge'
import { formatLKR } from '@/utils/currency'

export function Products() {
  const metrics = [
    { label: 'Total Products', value: '1,420', subtext: 'Active SKUs in catalog' },
    { label: 'Serialized Devices', value: '860', subtext: 'IMEI / Serial tracking enabled' },
    { label: 'Accessories', value: '560', subtext: 'Quantity based items' },
    { label: 'Out of Stock', value: '4', subtext: 'Needs immediate reorder' },
  ]

  const tableHeaders = ['Product Name', 'Category', 'Brand', 'Stock Type', 'Retail Price (LKR)', 'Stock Qty', 'Status']

  const sampleRows = [
    [
      <div className="font-semibold text-slate-900 dark:text-white">Apple iPhone 15 Pro (256GB)</div>,
      'Smartphones',
      'Apple',
      <Badge variant="purple" size="sm">IMEI Tracked</Badge>,
      <span className="font-bold">{formatLKR(435000)}</span>,
      <span className="font-semibold text-emerald-600">8 Units</span>,
      <Badge variant="success" size="sm">In Stock</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Samsung Galaxy S24 Ultra (512GB)</div>,
      'Smartphones',
      'Samsung',
      <Badge variant="purple" size="sm">IMEI Tracked</Badge>,
      <span className="font-bold">{formatLKR(465000)}</span>,
      <span className="font-semibold text-emerald-600">5 Units</span>,
      <Badge variant="success" size="sm">In Stock</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Apple 20W USB-C Power Adapter</div>,
      'Charging',
      'Apple',
      <Badge variant="default" size="sm">Quantity</Badge>,
      <span className="font-bold">{formatLKR(8500)}</span>,
      <span className="font-semibold">42 Units</span>,
      <Badge variant="success" size="sm">In Stock</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Sony WH-1000XM5 Headphones</div>,
      'Audio',
      'Sony',
      <Badge variant="purple" size="sm">Serialized</Badge>,
      <span className="font-bold">{formatLKR(135000)}</span>,
      <span className="font-semibold text-rose-600">1 Unit</span>,
      <Badge variant="danger" size="sm">Low Stock</Badge>,
    ],
    [
      <div className="font-semibold text-slate-900 dark:text-white">Spigen Ultra Hybrid iPhone 15</div>,
      'Protection',
      'Spigen',
      <Badge variant="default" size="sm">Quantity</Badge>,
      <span className="font-bold">{formatLKR(6500)}</span>,
      <span className="font-semibold">35 Units</span>,
      <Badge variant="success" size="sm">In Stock</Badge>,
    ],
  ]

  return (
    <PlaceholderPage
      title="Product Catalog"
      subtitle="Manage smartphones, electronic hardware, accessories, warranty rules and barcode assignments."
      icon={Package}
      badgeText="1,420 Items"
      primaryActionLabel="New Product"
      metrics={metrics}
      tableHeaders={tableHeaders}
      sampleRows={sampleRows}
    />
  )
}

