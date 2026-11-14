import React from 'react'
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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { formatLKR } from '@/utils/currency'

const priorityRepairQueue = [
  {
    id: 'REP-2024-001',
    device: 'Samsung Galaxy S23 Ultra',
    imei: '358912093849102',
    customer: 'Sunil Wickramasinghe',
    phone: '071 456 7890',
    issue: 'Display flicker & touch digitizer unresponsive after drop',
    status: 'DIAGNOSING',
    statusLabel: 'Diagnosing',
    statusVariant: 'warning',
    estimatedCost: 65000,
  },
  {
    id: 'REP-2024-002',
    device: 'Apple iPhone 14 Pro',
    imei: '352901928471920',
    customer: 'Niroshan Peiris',
    phone: '077 890 1234',
    issue: 'Battery degradation (74% health, rapid drain)',
    status: 'WAITING_FOR_PARTS',
    statusLabel: 'Waiting for Parts',
    statusVariant: 'danger',
    estimatedCost: 28000,
  },
  {
    id: 'REP-2024-003',
    device: 'Xiaomi 13T Pro',
    imei: '869201948271029',
    customer: 'Anura Bandara',
    phone: '076 112 3344',
    issue: 'USB-C charging port loose, no fast charge handshake',
    status: 'REPAIRING',
    statusLabel: 'Repairing',
    statusVariant: 'info',
    estimatedCost: 12500,
  },
  {
    id: 'REP-2024-004',
    device: 'Sony WH-1000XM4',
    imei: 'SN: 8829104',
    customer: 'Dulani Samarasinghe',
    phone: '072 334 5566',
    issue: 'Right ear speaker silent, audio jack pin bent',
    status: 'READY_FOR_PICKUP',
    statusLabel: 'Ready for Pickup',
    statusVariant: 'success',
    estimatedCost: 18000,
  },
]

export function TechnicianDashboard({ user }) {
  const navigate = useNavigate()

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
            Assigned device repairs, diagnostic tests, parts consumption, and warranty validations.
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">8 Active Devices</h3>
            <p className="text-[11px] text-slate-400 mt-1">4 high priority jobs</p>
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
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">3 Devices</h3>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting customer cost approval</p>
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
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">2 Devices</h3>
            <p className="text-[11px] text-slate-400 mt-1">Screens/batteries on order</p>
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
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">4 Completed</h3>
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
            <CardDescription>Active repair jobs currently assigned to your workbench</CardDescription>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/repair-management')}>
            Full Workshop Board
          </Button>
        </CardHeader>
        <CardContent className="p-0">
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
              {priorityRepairQueue.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-surface"
                  onClick={() => navigate('/repair-management')}
                >
                  <TableCell className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {job.id}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{job.device}</div>
                    <div className="text-[11px] font-mono text-slate-400">{job.imei}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{job.customer}</div>
                    <div className="text-[11px] text-slate-400">{job.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {job.issue}
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.statusVariant} size="sm">
                      {job.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs">
                    {formatLKR(job.estimatedCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

