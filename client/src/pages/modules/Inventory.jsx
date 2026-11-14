import React, { useState, useEffect } from 'react'
import {
  Boxes,
  Search,
  Plus,
  Minus,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Sliders,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  PackageCheck,
  FileSpreadsheet,
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
import { inventoryAPI, productsAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function Inventory() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('stock') // 'stock' | 'movements' | 'adjustments'
  const [dashboard, setDashboard] = useState(null)
  const [stockItems, setStockItems] = useState([])
  const [movements, setMovements] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [nonSerializedProducts, setNonSerializedProducts] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters for Stock
  const [search, setSearch] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('')
  const [trackingFilter, setTrackingFilter] = useState('')
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })

  // Filters for Movements
  const [movementTypeFilter, setMovementTypeFilter] = useState('')
  const [movementSearch, setMovementSearch] = useState('')
  const [movementPagination, setMovementPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })

  // Modal: Stock Adjustment
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustProductId, setAdjustProductId] = useState('')
  const [adjustType, setAdjustType] = useState('SET')
  const [adjustQuantity, setAdjustQuantity] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustNotes, setAdjustNotes] = useState('')
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)
  const [adjustError, setAdjustError] = useState('')

  // Modal: Manual Stock-In
  const [isStockInOpen, setIsStockInOpen] = useState(false)
  const [stockInProductId, setStockInProductId] = useState('')
  const [stockInQty, setStockInQty] = useState('')
  const [stockInCost, setStockInCost] = useState('')
  const [stockInRef, setStockInRef] = useState('')
  const [stockInNotes, setStockInNotes] = useState('')
  const [stockInSubmitting, setStockInSubmitting] = useState(false)
  const [stockInError, setStockInError] = useState('')

  // Modal: Reorder Threshold & Location
  const [isThresholdOpen, setIsThresholdOpen] = useState(false)
  const [thresholdProduct, setThresholdProduct] = useState(null)
  const [thresholdReorder, setThresholdReorder] = useState('5')
  const [thresholdLocation, setThresholdLocation] = useState('')
  const [thresholdSubmitting, setThresholdSubmitting] = useState(false)

  // Fetch Dashboard & Aux
  const fetchDashboard = async () => {
    try {
      const res = await inventoryAPI.dashboard()
      setDashboard(res.data?.data)
    } catch (err) {
      console.error('Failed to load inventory dashboard:', err)
    }
  }

  const fetchAuxProducts = async () => {
    try {
      const res = await productsAPI.list({ isSerialized: false, limit: 100 })
      setNonSerializedProducts(res.data?.data?.items || [])
    } catch (err) {
      console.error('Failed to load auxiliary products:', err)
    }
  }

  // Fetch Stock List
  const fetchStock = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await inventoryAPI.stock({
        search: search.trim() || undefined,
        stockStatus: stockStatusFilter || undefined,
        isSerialized: trackingFilter !== '' ? trackingFilter : undefined,
        page,
        limit: 15,
      })
      setStockItems(res.data?.data?.items || [])
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load stock inventory.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Movements
  const fetchMovements = async (page = 1) => {
    setIsLoading(true)
    try {
      const res = await inventoryAPI.movements({
        type: movementTypeFilter || undefined,
        search: movementSearch.trim() || undefined,
        page,
        limit: 20,
      })
      setMovements(res.data?.data?.items || [])
      setMovementPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 })
    } catch (err) {
      console.error('Failed to load movements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Adjustments
  const fetchAdjustments = async (page = 1) => {
    setIsLoading(true)
    try {
      const res = await inventoryAPI.adjustments({ page, limit: 20 })
      setAdjustments(res.data?.data?.items || [])
    } catch (err) {
      console.error('Failed to load adjustments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchAuxProducts()
  }, [])

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStock(1)
    } else if (activeTab === 'movements') {
      fetchMovements(1)
    } else if (activeTab === 'adjustments') {
      fetchAdjustments(1)
    }
  }, [activeTab, stockStatusFilter, trackingFilter, movementTypeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'stock') fetchStock(1)
    if (activeTab === 'movements') fetchMovements(1)
  }

  // Handle Adjustment Submit
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault()
    setAdjustError('')
    setAdjustSubmitting(true)
    try {
      await inventoryAPI.adjust({
        productId: adjustProductId,
        type: adjustType,
        quantity: Number(adjustQuantity),
        reason: adjustReason.trim(),
        notes: adjustNotes.trim() || undefined,
      })
      setSuccessMsg('Inventory adjusted and movement logged.')
      setIsAdjustOpen(false)
      fetchDashboard()
      fetchStock(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setAdjustError(err.response?.data?.error?.message || 'Failed to adjust stock.')
    } finally {
      setAdjustSubmitting(false)
    }
  }

  // Handle Manual Stock-In Submit
  const handleStockInSubmit = async (e) => {
    e.preventDefault()
    setStockInError('')
    setStockInSubmitting(true)
    try {
      await inventoryAPI.stockIn({
        productId: stockInProductId,
        quantity: Number(stockInQty),
        unitCost: stockInCost ? Number(stockInCost) : undefined,
        reference: stockInRef.trim() || undefined,
        notes: stockInNotes.trim() || undefined,
      })
      setSuccessMsg('Stock intake recorded successfully.')
      setIsStockInOpen(false)
      fetchDashboard()
      fetchStock(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setStockInError(err.response?.data?.error?.message || 'Failed to record stock intake.')
    } finally {
      setStockInSubmitting(false)
    }
  }

  // Handle Threshold Submit
  const handleThresholdSubmit = async (e) => {
    e.preventDefault()
    if (!thresholdProduct) return
    setThresholdSubmitting(true)
    try {
      await inventoryAPI.threshold(thresholdProduct.productId, {
        reorderLevel: Number(thresholdReorder),
        location: thresholdLocation.trim() || undefined,
      })
      setSuccessMsg(`Threshold updated for ${thresholdProduct.name}.`)
      setIsThresholdOpen(false)
      fetchStock(pagination.page)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update threshold.')
    } finally {
      setThresholdSubmitting(false)
    }
  }

  const renderStockBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="success" size="sm" dot>In Stock</Badge>
      case 'LOW_STOCK':
        return <Badge variant="warning" size="sm" dot>Low Stock</Badge>
      case 'OUT_OF_STOCK':
        return <Badge variant="danger" size="sm" dot>Out of Stock</Badge>
      default:
        return <Badge size="sm">{status}</Badge>
    }
  }

  const renderMovementBadge = (type) => {
    switch (type) {
      case 'STOCK_IN':
      case 'PURCHASE':
        return <Badge variant="success" size="sm">STOCK IN</Badge>
      case 'STOCK_OUT':
      case 'SALE':
        return <Badge variant="danger" size="sm">STOCK OUT</Badge>
      case 'ADJUSTMENT':
        return <Badge variant="purple" size="sm">ADJUSTMENT</Badge>
      case 'RETURN':
        return <Badge variant="primary" size="sm">RETURN</Badge>
      default:
        return <Badge size="sm">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Boxes className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory & Warehouse Valuation
            </h1>
            <Badge variant="primary" size="sm">
              Colombo Main
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock ledger, inventory valuation, stock adjustments, and low-threshold alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStockInProductId(nonSerializedProducts[0]?.id || '')
                  setStockInQty('10')
                  setStockInCost('')
                  setStockInRef('')
                  setStockInNotes('')
                  setStockInError('')
                  setIsStockInOpen(true)
                }}
                leftIcon={<Plus className="w-4 h-4 text-emerald-500" />}
              >
                Stock In (Accessories)
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setAdjustProductId(nonSerializedProducts[0]?.id || '')
                  setAdjustType('SET')
                  setAdjustQuantity('10')
                  setAdjustReason('Physical stock audit recount')
                  setAdjustNotes('')
                  setAdjustError('')
                  setIsAdjustOpen(true)
                }}
                leftIcon={<Sliders className="w-4 h-4" />}
                className="shadow-glow-blue"
              >
                Stock Adjustment
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              fetchDashboard()
              if (activeTab === 'stock') fetchStock(pagination.page)
              if (activeTab === 'movements') fetchMovements(movementPagination.page)
            }}
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Cost Valuation</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatLKR(dashboard?.valuation?.totalCostValuation || 0)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dashboard?.totalStockUnits || 0} Total Units in Store
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Retail Potential</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatLKR(dashboard?.valuation?.totalRetailValuation || 0)}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
                +{dashboard?.valuation?.marginPercentage || 0}% Expected Margin
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Serialized Phones</p>
              <h3 className="text-xl font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">
                {dashboard?.totalSerializedDevices || 0} Units
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict IMEI tracking</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purpleAccent-600">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Stock Attention</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {(dashboard?.lowStockCount || 0) + (dashboard?.outOfStockCount || 0)} SKUs
              </h3>
              <p className="text-[11px] text-rose-500 mt-0.5">
                {dashboard?.lowStockCount || 0} Low • {dashboard?.outOfStockCount || 0} Out • {dashboard?.damagedCount || 0} Damaged
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'stock'
              ? 'bg-brand-600 text-white shadow-glow-blue'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
          }`}
        >
          Stock Overview & Bins
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'movements'
              ? 'bg-brand-600 text-white shadow-glow-blue'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Stock Movements Ledger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('adjustments')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
            activeTab === 'adjustments'
              ? 'bg-brand-600 text-white shadow-glow-blue'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Audit Adjustments
        </button>
      </div>

      {/* TAB 1: STOCK OVERVIEW */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <select
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="">All Stock Levels</option>
                    <option value="IN_STOCK">Optimal Stock</option>
                    <option value="LOW_STOCK">Low Stock (≤ Reorder)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
                  </select>

                  <select
                    value={trackingFilter}
                    onChange={(e) => setTrackingFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Tracking Engines</option>
                    <option value="true">Serialized (IMEI)</option>
                    <option value="false">Accessories (Quantity)</option>
                  </select>

                  <Button type="submit" variant="secondary" size="sm">
                    Filter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : stockItems.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Boxes}
                    title="No inventory records found"
                    description="No stock items matched your filter query."
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product & SKU</TableHead>
                      <TableHead>Tracking Engine</TableHead>
                      <TableHead>Available Stock</TableHead>
                      <TableHead>Reorder Threshold</TableHead>
                      <TableHead>Storage Bin Location</TableHead>
                      <TableHead>Unit Cost (LKR)</TableHead>
                      <TableHead>Stock Valuation (LKR)</TableHead>
                      <TableHead>Health</TableHead>
                      {canManage && <TableHead className="text-right">Configure</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <code className="font-mono text-brand-600 dark:text-brand-400">{item.sku}</code>
                              <span>• {item.category}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.isSerialized ? (
                            <Badge variant="purple" size="sm" dot>IMEI Serialized</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Quantity Bulk</Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                            item.currentStock === 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : item.currentStock <= item.reorderLevel
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {item.currentStock} {item.isSerialized ? 'Units' : 'in Stock'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-slate-500 font-medium">
                            ≤ {item.reorderLevel} Units
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Warehouse className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-slate-500">{formatLKR(item.costPrice)}</span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatLKR(item.totalCostValue)}
                          </span>
                        </TableCell>

                        <TableCell>
                          {renderStockBadge(item.status)}
                        </TableCell>

                        {canManage && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setThresholdProduct(item)
                                setThresholdReorder(String(item.reorderLevel))
                                setThresholdLocation(item.location || 'Store Floor')
                                setIsThresholdOpen(true)
                              }}
                              title="Set Threshold & Bin Location"
                            >
                              <Sliders className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
                  <span className="text-xs text-slate-400">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchStock(pagination.page - 1)}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchStock(pagination.page + 1)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENTS LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  placeholder="Filter movements by reference or note..."
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  className="w-full sm:max-w-xs px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={movementTypeFilter}
                    onChange={(e) => setMovementTypeFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface font-medium"
                  >
                    <option value="">All Movement Types</option>
                    <option value="STOCK_IN">STOCK IN</option>
                    <option value="STOCK_OUT">STOCK OUT</option>
                    <option value="PURCHASE">PURCHASE (GRN)</option>
                    <option value="SALE">SALE (POS)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="RETURN">RETURN</option>
                  </select>
                  <Button variant="secondary" size="sm" onClick={() => fetchMovements(1)}>
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : movements.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={History}
                    title="No stock movements recorded"
                    description="Every stock movement is recorded here automatically during intake, sales, or audits."
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Product Name & SKU</TableHead>
                      <TableHead>Movement Type</TableHead>
                      <TableHead>Quantity Changed</TableHead>
                      <TableHead>Stock Transition</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Reference & Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {m.product?.name}
                            </span>
                            <span className="text-[10px] text-brand-600 block font-mono">
                              {m.product?.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{renderMovementBadge(m.type)}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-bold ${
                            ['STOCK_IN', 'PURCHASE', 'RETURN'].includes(m.type)
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}>
                            {['STOCK_IN', 'PURCHASE', 'RETURN'].includes(m.type) ? '+' : '-'}{m.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <span>{m.previousQty}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">{m.newQty}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {m.unitCost ? formatLKR(m.unitCost) : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {m.reference || '—'}
                            </span>
                            {m.notes && (
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {m.notes}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: AUDIT ADJUSTMENTS */}
      {activeTab === 'adjustments' && (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : adjustments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Sliders}
                  title="No adjustments recorded"
                  description="When physical counts are corrected, audit records will appear here."
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference #</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Adjustment Type</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Before / After</TableHead>
                    <TableHead>Mandatory Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell>
                        <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                          {adj.referenceNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(adj.createdAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {adj.product?.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="purple" size="sm">{adj.type || 'SET'}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-bold ${
                          (adj.quantity || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {(adj.quantity || 0) >= 0 ? `+${adj.quantity}` : adj.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <span>{adj.previousQty}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">{adj.newQty}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{adj.reason}</p>
                          {adj.notes && <p className="text-[10px] text-slate-400">{adj.notes}</p>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL: Stock Adjustment */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Stock Adjustment (Audit Reconciliation)"
        description="Reconcile inventory discrepancies with physical shelf counts. Creates an audit trail log."
        maxWidth="lg"
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          {adjustError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {adjustError}
            </div>
          )}

          <Select
            label="Product (Accessories & Spare Parts)"
            value={adjustProductId}
            onChange={(e) => setAdjustProductId(e.target.value)}
            required
          >
            <option value="">Select Accessory / Component</option>
            {nonSerializedProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Action"
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              required
            >
              <option value="SET">SET (Exact Physical Count)</option>
              <option value="ADD">ADD (+ Increment Count)</option>
              <option value="SUBTRACT">SUBTRACT (- Decrement Count)</option>
            </Select>

            <Input
              label="Quantity"
              type="number"
              min="0"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(e.target.value)}
              placeholder="e.g. 15"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Mandatory Audit Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Physical inventory count discrepancy after monthly audit"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Discovered 2 units with crushed packaging in bin B2"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={adjustSubmitting}>
              Apply Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Manual Stock In */}
      <Modal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title="Direct Stock Receiving (Non-Serialized)"
        description="Add accessories, cables, or spare parts directly to inventory."
        maxWidth="md"
      >
        <form onSubmit={handleStockInSubmit} className="space-y-4">
          {stockInError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {stockInError}
            </div>
          )}

          <Select
            label="Select Product"
            value={stockInProductId}
            onChange={(e) => {
              setStockInProductId(e.target.value)
              const p = nonSerializedProducts.find((item) => item.id === e.target.value)
              if (p) setStockInCost(String(p.costPrice || ''))
            }}
            required
          >
            <option value="">Select Accessory</option>
            {nonSerializedProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity to Add"
              type="number"
              min="1"
              value={stockInQty}
              onChange={(e) => setStockInQty(e.target.value)}
              placeholder="e.g. 50"
              required
            />
            <Input
              label="Unit Cost (LKR)"
              type="number"
              step="0.01"
              value={stockInCost}
              onChange={(e) => setStockInCost(e.target.value)}
              placeholder="e.g. 1200"
            />
          </div>

          <Input
            label="Reference # (Optional)"
            value={stockInRef}
            onChange={(e) => setStockInRef(e.target.value)}
            placeholder="e.g. INVOICE-8821"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsStockInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={stockInSubmitting}>
              Receive Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Threshold & Bin Location */}
      <Modal
        isOpen={isThresholdOpen}
        onClose={() => setIsThresholdOpen(false)}
        title="Reorder Threshold & Location"
        description={`Product: ${thresholdProduct?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleThresholdSubmit} className="space-y-4">
          <Input
            label="Low Stock Warning Threshold"
            type="number"
            min="0"
            value={thresholdReorder}
            onChange={(e) => setThresholdReorder(e.target.value)}
            placeholder="e.g. 5"
            required
          />

          <Input
            label="Storage Bin / Shelf Location"
            value={thresholdLocation}
            onChange={(e) => setThresholdLocation(e.target.value)}
            placeholder="e.g. Main Vault - Shelf A1"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsThresholdOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={thresholdSubmitting}>
              Save Threshold
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
