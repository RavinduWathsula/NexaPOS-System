import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  Laptop,
  Activity,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { auditAPI } from '@/services/api'
import { cn } from '@/utils/cn'

const ACTION_COLORS = {
  LOGIN_SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  LOGIN_FAILED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  CREATE_SALE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  CREATE_RETURN: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  APPROVE_RETURN: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
  REJECT_RETURN: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  STOCK_ADJUSTMENT: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  PRODUCT_UPDATE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  DEVICE_REGISTRATION: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
}

export function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [distinctActions, setDistinctActions] = useState([])

  // Modal inspect state
  const [selectedLog, setSelectedLog] = useState(null)
  const [copied, setCopied] = useState(false)

  // Quick stats
  const [stats, setStats] = useState({
    total: 0,
    authEvents: 0,
    returnsEvents: 0,
    salesEvents: 0,
  })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await auditAPI.list({
        page,
        limit: 20,
        search: search.trim() || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        entity: entityFilter !== 'ALL' ? entityFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const data = res.data?.data || {}
      const items = data.items || []
      setLogs(items)
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
      if (data.distinctActions) {
        setDistinctActions(data.distinctActions)
      }

      // Compute stats from available counts or current window
      const authCount = items.filter(
        (l) => l.action === 'LOGIN_SUCCESS' || l.action === 'LOGIN_FAILED'
      ).length
      const returnsCount = items.filter(
        (l) => l.action?.includes('RETURN') || l.entity === 'RETURN'
      ).length
      const salesCount = items.filter(
        (l) => l.action?.includes('SALE') || l.entity === 'SALE'
      ).length

      setStats({
        total: data.pagination?.total || items.length,
        authEvents: authCount,
        returnsEvents: returnsCount,
        salesEvents: salesCount,
      })
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter, entityFilter, startDate, endDate])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const handleCopyJson = () => {
    if (!selectedLog) return
    const details = (() => {
      try {
        return JSON.parse(selectedLog.details || '{}')
      } catch {
        return selectedLog.details
      }
    })()
    const content = JSON.stringify(
      {
        id: selectedLog.id,
        action: selectedLog.action,
        entity: selectedLog.entity,
        entityId: selectedLog.entityId,
        performedBy: selectedLog.performedBy?.name,
        email: selectedLog.performedBy?.email,
        ipAddress: selectedLog.ipAddress,
        createdAt: selectedLog.createdAt,
        details,
      },
      null,
      2
    )
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Audit Logs & Security
            </h1>
            <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20">
              Immutable Trail
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time security auditing, transaction histories, authentication traces, and stock controls.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} isLoading={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh Stream
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-dark-card border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Total Logged Events
            </span>
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pagination.total.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permanent audit records</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-dark-card border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Authentication Traces
            </span>
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.authEvents}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logins & rate limit defenses</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-dark-card border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Returns & RMA Trail
            </span>
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.returnsEvents}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Returns, approvals, rejects</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-dark-card border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Sales & Billing
            </span>
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.salesEvents}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoices, payments & voids</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-slate-200 dark:border-dark-border">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search user, IP, action, entity, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Action filter */}
            <div>
              <Select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                <option value="CREATE_SALE">CREATE_SALE</option>
                <option value="CREATE_RETURN">CREATE_RETURN</option>
                <option value="APPROVE_RETURN">APPROVE_RETURN</option>
                <option value="REJECT_RETURN">REJECT_RETURN</option>
                <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
                <option value="PRODUCT_UPDATE">PRODUCT_UPDATE</option>
                {distinctActions
                  .filter(
                    (a) =>
                      ![
                        'LOGIN_SUCCESS',
                        'LOGIN_FAILED',
                        'CREATE_SALE',
                        'CREATE_RETURN',
                        'APPROVE_RETURN',
                        'REJECT_RETURN',
                        'STOCK_ADJUSTMENT',
                        'PRODUCT_UPDATE',
                      ].includes(a)
                  )
                  .map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </Select>
            </div>

            {/* Entity filter */}
            <div>
              <Select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="ALL">All Entities</option>
                <option value="USER">User / Auth</option>
                <option value="SALE">Sale / Invoice</option>
                <option value="RETURN">Return / RMA</option>
                <option value="INVENTORY">Inventory / Stock</option>
                <option value="PRODUCT">Product</option>
                <option value="DEVICE">Device / IMEI</option>
                <option value="WARRANTY">Warranty</option>
                <option value="REPAIR">Repair</option>
              </Select>
            </div>

            {/* Submit / Clear */}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="flex-1">
                Filter
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setActionFilter('ALL')
                  setEntityFilter('ALL')
                  setStartDate('')
                  setEndDate('')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Date range row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-dark-border text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="h-8 text-xs w-36"
              />
              <span>to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
                className="h-8 text-xs w-36"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Logs Table */}
      <Card className="border-slate-200 dark:border-dark-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Timestamp</TableHead>
              <TableHead className="w-48">Action</TableHead>
              <TableHead className="w-32">Entity</TableHead>
              <TableHead className="w-56">Performed By</TableHead>
              <TableHead className="w-36">IP Address</TableHead>
              <TableHead>Activity Details</TableHead>
              <TableHead className="text-right w-20">Inspect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <EmptyState
                    icon={ShieldAlert}
                    title="No Audit Records Found"
                    description="No security or system events match your search filters."
                  />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const actionClass = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                const parsedDetails = (() => {
                  try {
                    return JSON.parse(log.details || '{}')
                  } catch {
                    return log.details || ''
                  }
                })()

                return (
                  <TableRow key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-dark-hover/40 transition-colors">
                    {/* Timestamp */}
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border', actionClass)}>
                        {log.action}
                      </span>
                    </TableCell>

                    {/* Entity */}
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.entity || '—'}
                      </div>
                      {log.entityId && (
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]" title={log.entityId}>
                          {log.entityId}
                        </div>
                      )}
                    </TableCell>

                    {/* Performed By */}
                    <TableCell>
                      {log.performedBy ? (
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {log.performedBy.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={log.performedBy.email}>
                            {log.performedBy.email}
                          </div>
                          <div className="text-[10px] text-indigo-500 font-mono font-medium">
                            {log.performedBy.role?.name || ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">System / Anonymous</span>
                      )}
                    </TableCell>

                    {/* IP Address */}
                    <TableCell className="text-xs font-mono text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>

                    {/* Details Snippet */}
                    <TableCell className="max-w-md">
                      <div className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono bg-slate-50 dark:bg-dark-bg px-2 py-1 rounded border border-slate-100 dark:border-dark-border">
                        {typeof parsedDetails === 'object'
                          ? JSON.stringify(parsedDetails)
                          : String(parsedDetails)}
                      </div>
                    </TableCell>

                    {/* Inspect Button */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 w-8 p-0"
                        title="View Full JSON Log"
                      >
                        <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspect Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record #${selectedLog.id}`}
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-dark-bg rounded-lg border border-slate-200 dark:border-dark-border text-xs">
              <div>
                <span className="text-slate-400 block">Action</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.entity} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Actor</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedLog.performedBy
                    ? `${selectedLog.performedBy.name} (${selectedLog.performedBy.role?.name || ''})`
                    : 'System / Guest'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">IP Address</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedLog.ipAddress || '127.0.0.1'}
                </span>
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Raw Event Payload (JSON)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 text-xs px-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-80 select-text">
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedLog.details || '{}')
                    return JSON.stringify(parsed, null, 2)
                  } catch {
                    return selectedLog.details || '{}'
                  }
                })()}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

