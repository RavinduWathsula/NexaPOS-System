import React, { useState, useEffect } from 'react'
import {
  ScanLine,
  Search,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Smartphone,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Layers,
  ArrowRight,
  Barcode,
  Truck,
  Check,
  AlertTriangle,
  X,
  FileText,
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
import { devicesAPI, productsAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function IMEIDevices() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)
  const canUpdateStatus = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER', 'TECHNICIAN'].includes(user?.role)

  const [devices, setDevices] = useState([])
  const [serializedProducts, setSerializedProducts] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')

  // Single Device Intake Modal
  const [isIntakeOpen, setIsIntakeOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [intakeVariants, setIntakeVariants] = useState([])
  const [imei1, setImei1] = useState('')
  const [imei2, setImei2] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [deviceColor, setDeviceColor] = useState('')
  const [deviceStorage, setDeviceStorage] = useState('')
  const [batteryHealth, setBatteryHealth] = useState('100')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [intakeSubmitting, setIntakeSubmitting] = useState(false)
  const [intakeError, setIntakeError] = useState('')

  // Bulk Shipment Intake Modal
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkProductId, setBulkProductId] = useState('')
  const [bulkCost, setBulkCost] = useState('')
  const [bulkSelling, setBulkSelling] = useState('')
  const [bulkColor, setBulkColor] = useState('')
  const [bulkStorage, setBulkStorage] = useState('')
  const [bulkRawText, setBulkRawText] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkError, setBulkError] = useState('')

  // Status Change Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [targetDevice, setTargetDevice] = useState(null)
  const [newStatus, setNewStatus] = useState('UNDER_REPAIR')
  const [statusReason, setStatusReason] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [statusSubmitting, setStatusSubmitting] = useState(false)
  const [statusError, setStatusError] = useState('')

  // Device Details & History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyDevice, setHistoryDevice] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Quick Verification Scanner Modal
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  // Copy feedback
  const [copiedImei, setCopiedImei] = useState('')

  const fetchAuxiliary = async () => {
    try {
      const res = await productsAPI.list({ isSerialized: true, limit: 100 })
      setSerializedProducts(res.data?.data?.items || [])
    } catch (e) {
      console.error('Error fetching serialized products:', e)
    }
  }

  const fetchDevices = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await devicesAPI.list({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        productId: productFilter || undefined,
        page,
        limit: 15,
      })
      setDevices(res.data?.data?.items || [])
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load serialized devices.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuxiliary()
    fetchDevices(1)
  }, [statusFilter, productFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchDevices(1)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedImei(text)
    setTimeout(() => setCopiedImei(''), 2000)
  }

  // Handle product select change in Single Intake
  const handleProductSelect = (pId) => {
    setSelectedProductId(pId)
    setSelectedVariantId('')
    const found = serializedProducts.find((p) => p.id === pId)
    if (found) {
      setIntakeVariants(found.variants || [])
      setPurchaseCost(String(found.costPrice || ''))
      setSellingPrice(String(found.retailPrice || ''))
    } else {
      setIntakeVariants([])
    }
  }

  // Handle variant select in Single Intake
  const handleVariantSelect = (vId) => {
    setSelectedVariantId(vId)
    const v = intakeVariants.find((item) => item.id === vId)
    if (v) {
      if (v.color) setDeviceColor(v.color)
      if (v.storage) setDeviceStorage(v.storage)
      if (v.costPrice) setPurchaseCost(String(v.costPrice))
      if (v.retailPrice) setSellingPrice(String(v.retailPrice))
    }
  }

  // Submit Single Intake
  const handleSingleIntakeSubmit = async (e) => {
    e.preventDefault()
    setIntakeError('')
    setIntakeSubmitting(true)

    try {
      await devicesAPI.register({
        productId: selectedProductId,
        variantId: selectedVariantId || undefined,
        imei1: imei1.trim(),
        imei2: imei2.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        color: deviceColor.trim() || undefined,
        storage: deviceStorage.trim() || undefined,
        batteryHealth: batteryHealth ? Number(batteryHealth) : 100,
        purchaseCost: Number(purchaseCost),
        sellingPrice: sellingPrice ? Number(sellingPrice) : undefined,
        notes: notes.trim() || undefined,
      })

      setSuccessMsg(`Device with IMEI ${imei1} successfully registered into inventory.`)
      setIsIntakeOpen(false)
      fetchDevices(1)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setIntakeError(err.response?.data?.error?.message || 'Failed to register device.')
    } finally {
      setIntakeSubmitting(false)
    }
  }

  // Submit Bulk Shipment Scanner Intake
  const handleBulkIntakeSubmit = async (e) => {
    e.preventDefault()
    setBulkError('')
    setBulkSubmitting(true)

    try {
      // Split lines/commas and extract IMEIs
      const lines = bulkRawText
        .split(/[\r\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 8)

      if (lines.length === 0) {
        setBulkError('Please enter or scan at least one valid IMEI number.')
        setBulkSubmitting(false)
        return
      }

      // Check duplicates in input
      const uniqueSet = new Set(lines)
      if (uniqueSet.size !== lines.length) {
        setBulkError('Duplicate IMEIs found within the scanned list. Please remove duplicates before submitting.')
        setBulkSubmitting(false)
        return
      }

      const devicesPayload = lines.map((item) => ({ imei1: item }))

      const res = await devicesAPI.bulkRegister({
        productId: bulkProductId,
        purchaseCost: Number(bulkCost),
        sellingPrice: bulkSelling ? Number(bulkSelling) : undefined,
        color: bulkColor.trim() || undefined,
        storage: bulkStorage.trim() || undefined,
        devices: devicesPayload,
      })

      setSuccessMsg(`Successfully intake ${res.data?.data?.count || lines.length} serialized devices into inventory.`)
      setIsBulkOpen(false)
      setBulkRawText('')
      fetchDevices(1)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setBulkError(err.response?.data?.error?.message || 'Bulk intake failed.')
    } finally {
      setBulkSubmitting(false)
    }
  }

  // Open Status Change Modal
  const handleOpenStatusModal = (dev) => {
    setTargetDevice(dev)
    setNewStatus(dev.status === 'IN_STOCK' ? 'UNDER_REPAIR' : 'IN_STOCK')
    setStatusReason('')
    setReferenceId('')
    setStatusError('')
    setIsStatusModalOpen(true)
  }

  // Submit Status Change
  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (!targetDevice) return
    setStatusError('')
    setStatusSubmitting(true)

    try {
      await devicesAPI.updateStatus(targetDevice.id, {
        status: newStatus,
        reason: statusReason.trim(),
        referenceId: referenceId.trim() || undefined,
      })

      setSuccessMsg(`Device ${targetDevice.imei1} status changed to ${newStatus}.`)
      setIsStatusModalOpen(false)
      fetchDevices(pagination.page)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setStatusError(err.response?.data?.error?.message || 'Failed to update device status.')
    } finally {
      setStatusSubmitting(false)
    }
  }

  // Open History & Details Modal
  const handleOpenHistory = async (dev) => {
    setIsHistoryModalOpen(true)
    setHistoryLoading(true)
    try {
      const res = await devicesAPI.get(dev.id)
      setHistoryDevice(res.data?.data || dev)
    } catch (err) {
      console.error('Failed to get device history:', err)
      setHistoryDevice(dev)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Fast Verification Scanner
  const handleVerifyLookup = async (e) => {
    if (e) e.preventDefault()
    if (!verifyInput.trim()) return
    setVerifyLoading(true)
    setVerifyError('')
    setVerifyResult(null)

    try {
      const res = await devicesAPI.verify(verifyInput.trim())
      setVerifyResult(res.data?.data)
    } catch (err) {
      setVerifyError(err.response?.data?.error?.message || 'Verification lookup failed.')
    } finally {
      setVerifyLoading(false)
    }
  }

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="success" size="sm" dot>In Stock</Badge>
      case 'SOLD':
        return <Badge variant="purple" size="sm" dot>Sold</Badge>
      case 'RESERVED':
        return <Badge variant="primary" size="sm" dot>Reserved</Badge>
      case 'UNDER_REPAIR':
        return <Badge variant="warning" size="sm" dot>Under Repair</Badge>
      case 'DEFECTIVE':
      case 'DAMAGED':
        return <Badge variant="danger" size="sm" dot>Damaged / RMA</Badge>
      case 'RETURNED':
        return <Badge variant="default" size="sm">Returned</Badge>
      default:
        return <Badge size="sm">{status}</Badge>
    }
  }

  // Metrics summary
  const inStockCount = devices.filter((d) => d.status === 'IN_STOCK').length
  const soldCount = devices.filter((d) => d.status === 'SOLD').length
  const underRepairCount = devices.filter((d) => d.status === 'UNDER_REPAIR').length
  const defectiveCount = devices.filter((d) => d.status === 'DEFECTIVE' || d.status === 'DAMAGED').length

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purpleAccent-600 dark:text-purpleAccent-400">
              <ScanLine className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              IMEI & Serial Number Registry
            </h1>
            <Badge variant="purple" size="sm">
              Strict Anti-Duplicate Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track lifecycle, warranty status, hardware specifications, and ownership history for every individual phone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVerifyInput('')
              setVerifyResult(null)
              setVerifyError('')
              setIsVerifyOpen(true)
            }}
            leftIcon={<Barcode className="w-4 h-4 text-purpleAccent-500" />}
          >
            Scanner Verification
          </Button>

          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkProductId(serializedProducts[0]?.id || '')
                  setBulkCost(String(serializedProducts[0]?.costPrice || ''))
                  setBulkSelling(String(serializedProducts[0]?.retailPrice || ''))
                  setBulkColor('')
                  setBulkStorage('')
                  setBulkRawText('')
                  setBulkError('')
                  setIsBulkOpen(true)
                }}
                leftIcon={<Truck className="w-4 h-4 text-brand-500" />}
              >
                Bulk Shipment Intake
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (serializedProducts.length > 0) {
                    handleProductSelect(serializedProducts[0].id)
                  }
                  setImei1('')
                  setImei2('')
                  setSerialNumber('')
                  setDeviceColor('')
                  setDeviceStorage('')
                  setNotes('')
                  setIntakeError('')
                  setIsIntakeOpen(true)
                }}
                leftIcon={<Plus className="w-4 h-4" />}
                className="shadow-glow-blue"
              >
                Intake Device
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchDevices(pagination.page)}
            title="Refresh Registry"
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">In-Stock Units</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{inStockCount}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Ready for POS sale</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Sold & Active</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{soldCount}</h3>
              <p className="text-[11px] text-purpleAccent-600 dark:text-purpleAccent-400 mt-0.5">Customer devices</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purpleAccent-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Under Repair</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{underRepairCount}</h3>
              <p className="text-[11px] text-amber-600 mt-0.5">Technician bench</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Damaged / RMA</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{defectiveCount}</h3>
              <p className="text-[11px] text-rose-600 mt-0.5">Awaiting supplier RMA</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Scan or search IMEI 1, IMEI 2, or Serial No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Status Tabs */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All Lifecycle Statuses</option>
                <option value="IN_STOCK">In Stock (Available)</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="UNDER_REPAIR">Under Repair</option>
                <option value="DEFECTIVE">Defective / RMA</option>
                <option value="DAMAGED">Damaged</option>
                <option value="RETURNED">Returned</option>
              </select>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Phone Models</option>
                {serializedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Devices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : devices.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ScanLine}
                title="No IMEI devices found"
                description="No serialized devices match your filter query. Intake new devices using the button above."
                actionLabel={canManage ? 'Intake Device' : undefined}
                onAction={() => setIsIntakeOpen(true)}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary IMEI 1 / Serial</TableHead>
                  <TableHead>Phone Model & Variant</TableHead>
                  <TableHead>Color / Storage</TableHead>
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sale / Warranty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((dev) => (
                  <TableRow key={dev.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                          {dev.imei1}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(dev.imei1)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                          title="Copy IMEI"
                        >
                          {copiedImei === dev.imei1 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {(dev.imei2 || dev.serialNumber) && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {dev.imei2 && <span>IMEI 2: {dev.imei2} </span>}
                          {dev.serialNumber && <span>SN: {dev.serialNumber}</span>}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">
                          {dev.product?.name || 'Unknown Device'}
                        </p>
                        <div className="text-[10px] text-slate-400">
                          <span>{dev.product?.brand?.name || ''}</span>
                          {dev.variant?.sku && (
                            <span className="font-mono text-purpleAccent-600 dark:text-purpleAccent-400 ml-1">
                              • {dev.variant.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        {dev.storage && (
                          <span className="font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mr-1.5">
                            {dev.storage}
                          </span>
                        )}
                        <span className="text-slate-700 dark:text-slate-300">
                          {dev.color || 'Standard'}
                        </span>
                        {dev.batteryHealth && dev.batteryHealth < 100 && (
                          <span className="text-[10px] text-amber-500 block">
                            BH: {dev.batteryHealth}%
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formatLKR(dev.purchaseCost)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {renderStatusBadge(dev.status)}
                    </TableCell>

                    <TableCell>
                      {dev.status === 'SOLD' && dev.saleItemDevice?.saleItem?.sale ? (
                        <div className="text-xs">
                          <span className="font-semibold text-brand-600 dark:text-brand-400 block">
                            #{dev.saleItemDevice.saleItem.sale.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {dev.saleItemDevice.saleItem.sale.customer?.name || 'Walk-in'}
                          </span>
                        </div>
                      ) : dev.warranties && dev.warranties[0] ? (
                        <div className="text-xs">
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {dev.warranties[0].warrantyCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Available</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenHistory(dev)}
                          title="View Lifecycle Timeline"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                        </Button>

                        {canUpdateStatus && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenStatusModal(dev)}
                            title="Update Device Status"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500 hover:text-amber-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} registered devices)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchDevices(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchDevices(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: Single Device Intake */}
      <Modal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        title="Intake Serialized Electronic Device"
        description="Register a single unit with a strictly unique primary IMEI. Duplicate IMEIs are rejected."
        maxWidth="2xl"
      >
        <form onSubmit={handleSingleIntakeSubmit} className="space-y-4">
          {intakeError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
              {intakeError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Phone / Hardware Model"
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              required
            >
              <option value="">Select Serialized Product</option>
              {serializedProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>

            <Select
              label="Select Variant (Optional)"
              value={selectedVariantId}
              onChange={(e) => handleVariantSelect(e.target.value)}
              disabled={intakeVariants.length === 0}
            >
              <option value="">None / Base Model</option>
              {intakeVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.storage || ''} {v.color || ''} ({v.sku})
                </option>
              ))}
            </Select>
          </div>

          <div className="p-3.5 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/30 dark:bg-brand-950/20 space-y-3">
            <p className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
              <ScanLine className="w-4 h-4" />
              IMEI & Hardware Identification
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary IMEI 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 354892019482910"
                  value={imei1}
                  onChange={(e) => setImei1(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Secondary IMEI 2 (Dual SIM)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 354892019482911"
                  value={imei2}
                  onChange={(e) => setImei2(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Serial Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. F2LXM0J0Q1"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Battery Health (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Color"
              value={deviceColor}
              onChange={(e) => setDeviceColor(e.target.value)}
              placeholder="e.g. Natural Titanium"
            />
            <Input
              label="Storage"
              value={deviceStorage}
              onChange={(e) => setDeviceStorage(e.target.value)}
              placeholder="e.g. 256GB"
            />
            <Input
              label="Purchase Cost (LKR)"
              type="number"
              step="0.01"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="385000"
              required
            />
            <Input
              label="Selling Price (LKR)"
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="435000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Intake Notes / Supplier Reference
            </label>
            <input
              type="text"
              placeholder="e.g. Shipment PO-2024-08, Sealed Box with Apple Sri Lanka warranty"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsIntakeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={intakeSubmitting}
            >
              Register Device
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Bulk Shipment Scanner Intake */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Shipment Scanner Intake"
        description="Scan multiple phone boxes continuously. Each barcode scan will register an individual unit in inventory."
        maxWidth="2xl"
      >
        <form onSubmit={handleBulkIntakeSubmit} className="space-y-4">
          {bulkError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
              {bulkError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <Select
                label="Product Model"
                value={bulkProductId}
                onChange={(e) => {
                  setBulkProductId(e.target.value)
                  const found = serializedProducts.find((p) => p.id === e.target.value)
                  if (found) {
                    setBulkCost(String(found.costPrice || ''))
                    setBulkSelling(String(found.retailPrice || ''))
                  }
                }}
                required
              >
                <option value="">Select Phone Model for Batch</option>
                {serializedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Batch Color"
              value={bulkColor}
              onChange={(e) => setBulkColor(e.target.value)}
              placeholder="e.g. Midnight Black"
            />
            <Input
              label="Batch Storage"
              value={bulkStorage}
              onChange={(e) => setBulkStorage(e.target.value)}
              placeholder="e.g. 128GB"
            />
            <Input
              label="Unit Cost (LKR)"
              type="number"
              value={bulkCost}
              onChange={(e) => setBulkCost(e.target.value)}
              placeholder="65000"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-brand-600" />
                Scanned IMEI List (One per line)
              </label>
              <span className="text-[11px] font-bold text-brand-600">
                {bulkRawText.split(/[\r\n,]+/).filter((s) => s.trim().length >= 8).length} IMEIs detected
              </span>
            </div>
            <textarea
              rows={8}
              value={bulkRawText}
              onChange={(e) => setBulkRawText(e.target.value)}
              placeholder="Point your optical barcode scanner at the IMEI box label and scan repeatedly:&#10;354892019482910&#10;354892019482911&#10;354892019482912"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={bulkSubmitting}
            >
              Register All Units
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Update Device Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Device Lifecycle Status"
        description={`IMEI: ${targetDevice?.imei1 || ''} • Current: ${targetDevice?.status || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {statusError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {statusError}
            </div>
          )}

          <Select
            label="Target Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
          >
            <option value="IN_STOCK">IN_STOCK (Available for POS billing)</option>
            <option value="RESERVED">RESERVED (Customer hold / deposit)</option>
            <option value="UNDER_REPAIR">UNDER_REPAIR (Transferred to technician bench)</option>
            <option value="DEFECTIVE">DEFECTIVE (Faulty hardware / RMA)</option>
            <option value="DAMAGED">DAMAGED (Physical damage)</option>
            <option value="RETURNED">RETURNED (Customer return)</option>
          </Select>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Reason for Status Change <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a mandatory reason (e.g. Screen flickering reported, moving to technician bench for diagnosis)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
              required
            />
          </div>

          <Input
            label="Reference ID (Optional)"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. REP-2024-001 or RMA-SUP-99"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={statusSubmitting}
            >
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Device History & Specifications */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Device History & Warranty Tracking"
        description={`IMEI 1: ${historyDevice?.imei1 || ''}`}
        maxWidth="2xl"
      >
        {historyLoading || !historyDevice ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Model</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {historyDevice.product?.name}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Spec</span>
                <p className="text-xs font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-0.5">
                  {historyDevice.storage || 'Standard'} • {historyDevice.color || 'Default'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Purchase Cost</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatLKR(historyDevice.purchaseCost)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <div className="mt-1">{renderStatusBadge(historyDevice.status)}</div>
              </div>
            </div>

            {/* Sale & Warranty Info */}
            {historyDevice.status === 'SOLD' && historyDevice.saleItemDevice?.saleItem?.sale && (
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-2">
                <h4 className="text-xs font-bold text-purpleAccent-700 dark:text-purpleAccent-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Retail Sale Record
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Invoice:</span>{' '}
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      #{historyDevice.saleItemDevice.saleItem.sale.invoiceNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Customer:</span>{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {historyDevice.saleItemDevice.saleItem.sale.customer?.name || 'Walk-in'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">
                      {new Date(historyDevice.saleItemDevice.saleItem.sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Lifecycle History Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                Lifecycle Audit Timeline
              </h4>

              {!historyDevice.statusHistory || historyDevice.statusHistory.length === 0 ? (
                <p className="text-xs text-slate-400">No status transitions recorded yet.</p>
              ) : (
                <div className="space-y-2.5 pl-2 border-l-2 border-slate-200 dark:border-dark-border ml-2">
                  {historyDevice.statusHistory.map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[1.3rem] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-dark-card" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.fromStatus} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-1" /> {item.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {item.reason && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Reason: {item.reason}
                        </p>
                      )}
                      {item.referenceId && (
                        <p className="text-[11px] font-mono text-purpleAccent-600 dark:text-purpleAccent-400">
                          Ref: {item.referenceId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 5: Fast IMEI Verification Scanner */}
      <Modal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        title="Optical Scanner IMEI Verification"
        description="Verify warranty authenticity, inventory readiness, or customer sale history instantly."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleVerifyLookup} className="flex gap-2">
            <input
              type="text"
              placeholder="Scan or type IMEI or Serial Number..."
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card font-mono focus:outline-none focus:ring-1 focus:ring-purpleAccent-500"
              autoFocus
              required
            />
            <Button type="submit" variant="primary" size="sm" isLoading={verifyLoading}>
              Verify
            </Button>
          </form>

          {verifyError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {verifyError}
            </div>
          )}

          {verifyResult && (
            <div className="space-y-3">
              {!verifyResult.exists ? (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-1.5" />
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    Not Registered in Store Database
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    IMEI {verifyResult.imei} was never inventoried or sold by this NexaPOS store.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {verifyResult.device.product.name}
                      </h4>
                      <code className="text-[11px] font-mono text-brand-600 dark:text-brand-400">
                        IMEI: {verifyResult.device.imei1}
                      </code>
                    </div>
                    {renderStatusBadge(verifyResult.device.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-100 dark:border-emerald-900">
                    <div>
                      <span className="text-slate-400">Availability:</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {verifyResult.device.availability.reason}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Selling Price:</span>{' '}
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {formatLKR(verifyResult.device.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  {verifyResult.device.saleInfo && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs">
                      <span className="font-bold text-purpleAccent-600 block">Sold Device Details:</span>
                      <span>Invoice: #{verifyResult.device.saleInfo.invoiceNumber}</span>
                      <span className="ml-2">• Customer: {verifyResult.device.saleInfo.customer || 'Walk-in'}</span>
                    </div>
                  )}

                  {verifyResult.device.warrantyInfo && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs">
                      <span className="font-bold text-emerald-600 block">Warranty Status:</span>
                      <span>Code: {verifyResult.device.warrantyInfo.warrantyCode}</span>
                      <span className="ml-2">
                        • {verifyResult.device.warrantyInfo.isValid ? 'Valid' : 'Expired'} (Ends: {new Date(verifyResult.device.warrantyInfo.endDate).toLocaleDateString()})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
