import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  Package,
  ScanLine,
  Truck,
  AlertTriangle,
  ArrowRight,
  Inbox,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { inventoryAPI, purchasesAPI } from '@/services/api'

export function StockKeeperDashboard({ user }) {
  const navigate = useNavigate()
  const [stockAlerts, setStockAlerts] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [stats, setStats] = useState({
    serializedDevices: 0,
    bulkAccessories: 0,
    lowStockCount: 0,
    pendingPurchases: 0,
  })

  useEffect(() => {
    fetchWarehouseData()
  }, [])

  const fetchWarehouseData = async () => {
    try {
      // 1. Fetch Inventory Dashboard metrics
      const invRes = await inventoryAPI.dashboard().catch(() => null)
      if (invRes?.data?.data) {
        const d = invRes.data.data
        setStats((prev) => ({
          ...prev,
          serializedDevices: d.totalSerializedDevices || 0,
          bulkAccessories: d.totalQuantityProducts || 0,
          lowStockCount: d.lowStockCount || d.lowStockProducts?.length || 0,
        }))
        if (Array.isArray(d.lowStockProducts)) {
          setStockAlerts(d.lowStockProducts.slice(0, 5))
        }
      }

      // 2. Fetch pending purchases
      const poRes = await purchasesAPI.list({ status: 'PENDING' }).catch(() => null)
      if (poRes?.data?.data?.purchases) {
        setStats((prev) => ({
          ...prev,
          pendingPurchases: poRes.data.data.purchases.length,
        }))
      }

      // 3. Fetch recent stock movements
      const movRes = await inventoryAPI.movements({ limit: 5 }).catch(() => null)
      if (movRes?.data?.data?.movements) {
        setRecentMovements(movRes.data.data.movements)
      } else if (Array.isArray(movRes?.data?.data)) {
        setRecentMovements(movRes.data.data.slice(0, 5))
      }
    } catch (e) {
      console.warn('Stock Keeper live sync note:', e.message)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Warehouse Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-cyan-950 text-white border border-cyan-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Warehouse & Stock Dispatch Center
            </span>
            <Badge variant="info" size="sm">
              Live Stock Tracking
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {user?.name || 'Stock Keeper'}
          </h1>
          <p className="text-xs text-cyan-200/80">
            Serialized IMEI verification, goods received (GRN), safety stock thresholds, and warehouse dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/imei-devices')}
            leftIcon={<ScanLine className="w-4 h-4 text-cyan-300" />}
            className="border-cyan-700 text-cyan-100 hover:bg-cyan-900"
          >
            Scan & Verify IMEI
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/purchases')}
            leftIcon={<Truck className="w-4 h-4" />}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
          >
            Receive PO (GRN)
          </Button>
        </div>
      </div>

      {/* Warehouse Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-cyan-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Serialized Devices</p>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.serializedDevices} Unique IMEIs
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Smartphones, tablets & serialized units</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bulk Accessories</p>
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.bulkAccessories} SKUs
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Quantity-tracked stock items</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Low Stock Reorders</p>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {stats.lowStockCount} Items Low
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Below safety threshold</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Goods Received</p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.pendingPurchases} Purchase Orders
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting batch intake</p>
          </div>
        </Card>
      </div>

      {/* Quick Warehouse Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/purchases')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-cyan-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600">
                Purchase Orders & GRN
              </p>
              <p className="text-xs text-slate-400">Receive supplier shipments & stock-in</p>
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
                IMEI Device Registry
              </p>
              <p className="text-xs text-slate-400">Inspect device serials & statuses</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-purple-500 hover:shadow-sm transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                Stock Adjustments & Audit
              </p>
              <p className="text-xs text-slate-400">Cycle count & inventory audit logs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid: Stock Alerts and Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Critical Low Stock Reorders</CardTitle>
              <CardDescription>Items needing replenishment from suppliers</CardDescription>
            </div>
            <Button variant="ghost" size="xs" onClick={() => navigate('/inventory')}>
              All Stock
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stockAlerts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU / Product</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAlerts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.sku || 'SKU'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" size="sm">{item.trackingType || 'QUANTITY'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="danger" size="sm">
                          {item.currentStock || item.stock || 0} in stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="xs" onClick={() => navigate('/purchases')}>
                          Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 px-4 text-center">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No low stock warnings</p>
                <p className="text-[11px] text-slate-400 mt-1">All inventory items are currently above safety thresholds.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Live audited stock entries, dispatches and returns</CardDescription>
            </div>
            <Button variant="ghost" size="xs" onClick={() => navigate('/inventory')}>
              Movement Log
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentMovements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference & Product</TableHead>
                    <TableHead>Movement Type</TableHead>
                    <TableHead className="text-right">Quantity / Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {mov.product?.name || mov.productName || 'Stock Item'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {mov.referenceType || 'ADJUST'} • {new Date(mov.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={mov.type?.includes('IN') ? 'success' : 'info'} size="sm">
                          {mov.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 px-4 text-center">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No stock movements recorded</p>
                <p className="text-[11px] text-slate-400 mt-1">Receive a purchase order to stock your warehouse.</p>
                <Button variant="outline" size="xs" onClick={() => navigate('/purchases')} className="mt-3">
                  Receive Purchase (GRN)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
