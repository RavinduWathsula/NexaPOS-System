import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench,
  Smartphone,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowRight,
  ScanLine,
  Inbox,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { formatLKR } from '@/utils/currency'
import { repairsAPI } from '@/services/api'

export function TechnicianDashboard({ user }) {
  const navigate = useNavigate()
  const [repairs, setRepairs] = useState([])
  const [stats, setStats] = useState({
    assigned: 0,
    diagnosing: 0,
    waitingParts: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchTechnicianData()
  }, [])

  const fetchTechnicianData = async () => {
    try {
      const res = await repairsAPI.list({ limit: 10 }).catch(() => null)
      if (res?.data?.data?.repairs) {
        const list = res.data.data.repairs
        setRepairs(list)
        setStats({
          assigned: list.filter((r) => r.status !== 'DELIVERED' && r.status !== 'CANCELLED').length,
          diagnosing: list.filter((r) => r.status === 'DIAGNOSING' || r.status === 'RECEIVED').length,
          waitingParts: list.filter((r) => r.status === 'WAITING_FOR_PARTS').length,
          completed: list.filter((r) => r.status === 'READY_FOR_PICKUP' || r.status === 'COMPLETED').length,
        })
      }
    } catch (e) {
      console.warn('Technician live sync note:', e.message)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Workshop Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Electronic Workshop & Service Bench
            </span>
            <Badge variant="info" size="sm">
              Technician Station Active
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {user?.name || 'Technician'}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time assigned device repairs, diagnostic tests, parts consumption, and warranty validations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/warranty-management')}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Check Warranty
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/repair-management')}
            leftIcon={<Wrench className="w-4 h-4" />}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            Intake Repair Ticket
          </Button>
        </div>
      </div>

      {/* Workshop Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned To Me</p>
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.assigned} Active Devices
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Pending workshop completion</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Diagnosis</p>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {stats.diagnosing} Devices
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Under inspection</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Waiting For Parts</p>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {stats.waitingParts} Devices
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting spare parts</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ready for Collection</p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.completed} Completed
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Ready for cashier delivery</p>
          </div>
        </Card>
      </div>

      {/* Quick Workshop Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/repair-management')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-amber-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                Repair Tickets Queue
              </p>
              <p className="text-xs text-slate-400">Update status, diagnosis & parts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/imei-devices')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600">
                IMEI & Device Lookup
              </p>
              <p className="text-xs text-slate-400">Inspect device status & history</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/warranty-management')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-emerald-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                Warranty Verification
              </p>
              <p className="text-xs text-slate-400">Review claims & warranty terms</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Priority Repair Queue Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>My Priority Repair Queue</CardTitle>
            <CardDescription>Live repair jobs currently assigned to your workbench</CardDescription>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/repair-management')}>
            Full Workshop Board
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {repairs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Device & Model</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reported Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-surface"
                    onClick={() => navigate('/repair-management')}
                  >
                    <TableCell className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {job.ticketNumber || job.id}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{job.deviceModel || 'Device'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{job.imeiOrSerial || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{job.customer?.name || 'Walk-in'}</div>
                      <div className="text-[11px] text-slate-400">{job.customer?.phone || ''}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {job.reportedProblem || job.issue || 'Pending Diagnosis'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={job.status === 'READY_FOR_PICKUP' ? 'success' : 'warning'} size="sm">
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs">
                      {formatLKR(job.estimatedCost || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 px-4 text-center">
              <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active repair tickets</p>
              <p className="text-[11px] text-slate-400 mt-1">Repair workbench is currently clear.</p>
              <Button variant="outline" size="xs" onClick={() => navigate('/repair-management')} className="mt-3">
                Intake New Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
