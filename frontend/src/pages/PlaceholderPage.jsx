import React, { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  Smartphone,
  ScanLine,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function PlaceholderPage({
  title,
  subtitle,
  category,
  icon: Icon = Package,
  badgeText,
  primaryActionLabel = 'Add New',
  metrics = [],
  tableHeaders = [],
  sampleRows = [],
}) {
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 600)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Icon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badgeText && (
              <Badge variant="primary" size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmpty(!showEmpty)}
          >
            {showEmpty ? 'View Sample Data' : 'View Empty State'}
          </Button>
          {primaryActionLabel && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow-blue"
            >
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row if provided */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <Card key={idx} hover className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {m.label}
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {m.value}
              </h3>
              {m.subtext && (
                <p className="text-[11px] text-slate-400 mt-0.5">{m.subtext}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div>
            <CardTitle>{title} Records</CardTitle>
            <CardDescription>
              Phase 1 UI architecture & layout preview
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : showEmpty ? (
            <EmptyState
              icon={Icon}
              title={`No ${title} entries found`}
              description={`There are currently no records available in ${title}. Click "${primaryActionLabel}" to create your first record.`}
              actionLabel={primaryActionLabel}
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((row, rIdx) => (
                  <TableRow key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <TableCell key={cIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

