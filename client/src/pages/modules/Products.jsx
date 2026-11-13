import React, { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ScanLine,
  Boxes,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Sparkles,
  Shield,
  Tag,
  Warehouse,
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
import { productsAPI, categoriesAPI, brandsAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function Products() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [serializedFilter, setSerializedFilter] = useState('')

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [modalError, setModalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [detailsTab, setDetailsTab] = useState('overview')
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Variant addition form state inside Details Modal
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [variantSku, setVariantSku] = useState('')
  const [variantColor, setVariantColor] = useState('')
  const [variantStorage, setVariantStorage] = useState('')
  const [variantRam, setVariantRam] = useState('')
  const [variantModel, setVariantModel] = useState('')
  const [variantBarcode, setVariantBarcode] = useState('')
  const [variantCost, setVariantCost] = useState('')
  const [variantRetail, setVariantRetail] = useState('')
  const [variantSubmitting, setVariantSubmitting] = useState(false)
  const [variantError, setVariantError] = useState('')

  // Image addition state inside Details Modal
  const [showAddImage, setShowAddImage] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [imageSubmitting, setImageSubmitting] = useState(false)

  // Form Fields for Add / Edit
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [isSerialized, setIsSerialized] = useState(false)
  const [costPrice, setCostPrice] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [defaultWarrantyMonths, setDefaultWarrantyMonths] = useState('12')
  const [initialStock, setInitialStock] = useState('0')
  const [reorderLevel, setReorderLevel] = useState('5')
  const [location, setLocation] = useState('Main Store')
  const [imageUrl, setImageUrl] = useState('')

  const fetchAuxiliary = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        categoriesAPI.list(),
        brandsAPI.list(),
      ])
      setCategories(catsRes.data?.data || [])
      setBrands(brandsRes.data?.data || [])
    } catch (e) {
      console.error('Error fetching categories/brands:', e)
    }
  }

  const fetchProducts = async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await productsAPI.list({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
        isSerialized: serializedFilter !== '' ? serializedFilter : undefined,
        page,
        limit: 15,
      })
      setProducts(res.data?.data?.items || [])
      setPagination(res.data?.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuxiliary()
    fetchProducts(1)
  }, [selectedCategory, selectedBrand, serializedFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts(1)
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName('')
    setSku('')
    setBarcode('')
    setDescription('')
    setCategoryId(categories[0]?.id || '')
    setBrandId(brands[0]?.id || '')
    setIsSerialized(false)
    setCostPrice('')
    setRetailPrice('')
    setMinPrice('')
    setDefaultWarrantyMonths('12')
    setInitialStock('0')
    setReorderLevel('5')
    setLocation('Store Floor')
    setImageUrl('')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod)
    setName(prod.name)
    setSku(prod.sku)
    setBarcode(prod.barcode || '')
    setDescription(prod.description || '')
    setCategoryId(prod.categoryId)
    setBrandId(prod.brandId || '')
    setIsSerialized(prod.isSerialized)
    setCostPrice(String(prod.costPrice))
    setRetailPrice(String(prod.retailPrice))
    setMinPrice(prod.minPrice ? String(prod.minPrice) : '')
    setDefaultWarrantyMonths(String(prod.defaultWarrantyMonths || 0))
    setImageUrl(prod.images?.[0]?.url || '')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenDetails = async (prod) => {
    setIsDetailsOpen(true)
    setIsDetailsLoading(true)
    setDetailsTab('overview')
    setShowAddVariant(false)
    setShowAddImage(false)
    try {
      const res = await productsAPI.get(prod.id)
      setActiveProduct(res.data?.data || prod)
    } catch (err) {
      console.error('Failed to get product details:', err)
      setActiveProduct(prod)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const generateAutoSku = () => {
    if (!name) return
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase()
    const random = Math.floor(1000 + Math.random() * 9000)
    setSku(`${prefix}-${random}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name,
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        description: description.trim() || undefined,
        categoryId,
        brandId: brandId || null,
        isSerialized,
        costPrice: Number(costPrice),
        retailPrice: Number(retailPrice),
        minPrice: minPrice ? Number(minPrice) : undefined,
        defaultWarrantyMonths: Number(defaultWarrantyMonths),
        initialStock: Number(initialStock),
        reorderLevel: Number(reorderLevel),
        location,
        imageUrl: imageUrl.trim() || undefined,
      }

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload)
        setSuccessMsg(`Product "${name}" updated successfully.`)
      } else {
        await productsAPI.create(payload)
        setSuccessMsg(`Product "${name}" registered successfully.`)
      }

      setIsModalOpen(false)
      fetchProducts(pagination.page)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to save product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (prod) => {
    if (!window.confirm(`Delete product "${prod.name}" (${prod.sku})?`)) {
      return
    }

    try {
      await productsAPI.delete(prod.id)
      setSuccessMsg(`Product "${prod.name}" removed from catalog.`)
      fetchProducts(pagination.page)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not delete product.')
    }
  }

  // Variant addition handler
  const handleAddVariant = async (e) => {
    e.preventDefault()
    if (!activeProduct) return
    setVariantSubmitting(true)
    setVariantError('')

    try {
      const autoVariantSku = variantSku.trim() || `${activeProduct.sku}-${(variantStorage || 'VAR').toUpperCase()}-${(variantColor || 'STD').slice(0, 3).toUpperCase()}`
      await productsAPI.addVariant(activeProduct.id, {
        sku: autoVariantSku,
        color: variantColor.trim() || undefined,
        storage: variantStorage.trim() || undefined,
        ram: variantRam.trim() || undefined,
        model: variantModel.trim() || undefined,
        barcode: variantBarcode.trim() || undefined,
        costPrice: variantCost ? Number(variantCost) : undefined,
        retailPrice: variantRetail ? Number(variantRetail) : undefined,
      })

      // Refresh product details
      const refreshed = await productsAPI.get(activeProduct.id)
      setActiveProduct(refreshed.data?.data)
      setShowAddVariant(false)
      setVariantSku('')
      setVariantColor('')
      setVariantStorage('')
      setVariantRam('')
      setVariantModel('')
      setVariantBarcode('')
      setVariantCost('')
      setVariantRetail('')
      setSuccessMsg('Product variant added successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setVariantError(err.response?.data?.error?.message || 'Failed to add variant.')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Delete this variant?')) return
    try {
      await productsAPI.deleteVariant(activeProduct.id, variantId)
      const refreshed = await productsAPI.get(activeProduct.id)
      setActiveProduct(refreshed.data?.data)
      setSuccessMsg('Variant removed.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not remove variant.')
    }
  }

  // Image addition handler
  const handleAddImage = async (e) => {
    e.preventDefault()
    if (!activeProduct || !newImageUrl.trim()) return
    setImageSubmitting(true)
    try {
      await productsAPI.addImage(activeProduct.id, {
        url: newImageUrl.trim(),
        isPrimary: !activeProduct.images || activeProduct.images.length === 0,
      })
      const refreshed = await productsAPI.get(activeProduct.id)
      setActiveProduct(refreshed.data?.data)
      setShowAddImage(false)
      setNewImageUrl('')
      setSuccessMsg('Image attached.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to attach image.')
    } finally {
      setImageSubmitting(false)
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Remove this product image?')) return
    try {
      await productsAPI.deleteImage(activeProduct.id, imageId)
      const refreshed = await productsAPI.get(activeProduct.id)
      setActiveProduct(refreshed.data?.data)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to remove image.')
    }
  }

  // Summary Metrics calculations
  const totalProducts = pagination.total
  const serializedCount = products.filter((p) => p.isSerialized).length
  const quantityCount = products.filter((p) => !p.isSerialized).length
  const lowStockCount = products.filter((p) => (p.stockCount || 0) <= 2).length

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Product & Hardware Catalog
            </h1>
            <Badge variant="primary" size="sm">
              {totalProducts} Total SKUs
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage serialized smartphones, variants (storage, color), warranty terms, and stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts(pagination.page)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow-blue"
            >
              New Product
            </Button>
          )}
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

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4 border-l-4 border-l-brand-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Catalog SKUs</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalProducts}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Active retail items</p>
        </Card>
        <Card hover className="p-4 border-l-4 border-l-purpleAccent-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Serialized Devices</p>
          <h3 className="text-lg font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">{serializedCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Strict IMEI tracking</p>
        </Card>
        <Card hover className="p-4 border-l-4 border-l-sky-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Accessories</p>
          <h3 className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1">{quantityCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Bulk quantity inventory</p>
        </Card>
        <Card hover className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Low Stock Notice</p>
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{lowStockCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Below reorder limit</p>
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
                placeholder="Search by name, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={serializedFilter}
                onChange={(e) => setSerializedFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200"
              >
                <option value="">All Stock Types</option>
                <option value="true">IMEI Serialized Only</option>
                <option value="false">Quantity Accessories</option>
              </select>

              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title="No products found"
                description="No products match your filter parameters."
                actionLabel={canManage ? 'Register New Product' : undefined}
                onAction={handleOpenAdd}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name & SKU</TableHead>
                  <TableHead>Category / Brand</TableHead>
                  <TableHead>Tracking Type</TableHead>
                  <TableHead>Cost Price (LKR)</TableHead>
                  <TableHead>Retail Price (LKR)</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.images && p.images[0] ? (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-dark-border shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-dark-surface flex items-center justify-center shrink-0 text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(p)}
                            className="font-semibold text-slate-900 dark:text-white text-xs hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors"
                          >
                            {p.name}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <code className="font-mono text-brand-600 dark:text-brand-400">{p.sku}</code>
                            {p.variants?.length > 0 && (
                              <span className="text-purpleAccent-600 font-medium">
                                • {p.variants.length} Variants
                              </span>
                            )}
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <span>{p.category?.name || 'Uncategorized'}</span>
                        {p.brand && <span className="text-slate-400 text-[11px] block">{p.brand.name}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.isSerialized ? (
                        <Badge variant="purple" size="sm" dot>
                          IMEI Tracked
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Quantity
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatLKR(p.costPrice)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{formatLKR(p.retailPrice)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                            (p.stockCount || 0) <= 2
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {p.stockCount || 0} {p.isSerialized ? 'Units' : 'in Stock'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {p.defaultWarrantyMonths > 0 ? `${p.defaultWarrantyMonths} Mos` : 'No Warranty'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDetails(p)}
                          title="View Specifications & Variants"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(p)}
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-dark-border">
              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchProducts(pagination.page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchProducts(pagination.page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Register New Catalog Product'}
        description="Configure hardware specifications, SKU, LKR prices, and IMEI tracking rules."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samsung Galaxy S24 Ultra"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  SKU Code
                </label>
                <button
                  type="button"
                  onClick={generateAutoSku}
                  className="text-[10px] text-brand-600 hover:underline font-semibold"
                >
                  Auto-Generate
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SAM-S24U-256"
                className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm"
                required
              />
            </div>

            <Input
              label="Barcode / EAN (Optional)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 195949019283"
            />

            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">Select Brand (Optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Image URL preview */}
          <div>
            <Input
              label="Product Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <span className="text-[11px] text-slate-500">Image preview valid</span>
              </div>
            )}
          </div>

          {/* Tracking Mode Switch */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-200 dark:border-dark-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-purpleAccent-500" />
                Serialized Device (IMEI Tracking)
              </p>
              <p className="text-[11px] text-slate-400">
                {isSerialized
                  ? 'Each unit will require a unique IMEI 1. Individual unit inventory managed in IMEI Registry.'
                  : 'Ordinary accessory: Managed using numeric quantity count.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSerialized}
                disabled={Boolean(editingProduct)}
                onChange={(e) => setIsSerialized(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {/* Financials & Stock Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Cost Price (LKR)"
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 385000"
              required
            />
            <Input
              label="Retail Price (LKR)"
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              placeholder="e.g. 435000"
              required
            />
            <Input
              label="Min Selling Price (LKR)"
              type="number"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 420000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Warranty (Months)"
              type="number"
              value={defaultWarrantyMonths}
              onChange={(e) => setDefaultWarrantyMonths(e.target.value)}
              placeholder="12"
            />
            {!editingProduct && !isSerialized ? (
              <Input
                label="Initial Quantity"
                type="number"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                placeholder="0"
              />
            ) : (
              <Input
                label="Reorder Threshold"
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="5"
              />
            )}
            <Input
              label="Storage Bin / Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rack A2, Vault"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingProduct ? 'Update Product' : 'Register Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Details & Variants Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={activeProduct?.name || 'Product Details'}
        description={`SKU: ${activeProduct?.sku || ''} • ${activeProduct?.category?.name || ''}`}
        maxWidth="3xl"
      >
        {isDetailsLoading || !activeProduct ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border pb-2">
              <button
                type="button"
                onClick={() => setDetailsTab('overview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  detailsTab === 'overview'
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                }`}
              >
                Overview & Pricing
              </button>
              <button
                type="button"
                onClick={() => setDetailsTab('variants')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  detailsTab === 'variants'
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Hardware Variants ({activeProduct.variants?.length || 0})
              </button>
              {activeProduct.isSerialized && (
                <button
                  type="button"
                  onClick={() => setDetailsTab('devices')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    detailsTab === 'devices'
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                  }`}
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  In-Stock Devices ({activeProduct.devices?.length || 0})
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailsTab('images')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  detailsTab === 'images'
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Gallery ({activeProduct.images?.length || 0})
              </button>
            </div>

            {/* Tab: Overview */}
            {detailsTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cost Price</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatLKR(activeProduct.costPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Retail Price</span>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {formatLKR(activeProduct.retailPrice)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Default Warranty</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeProduct.defaultWarrantyMonths} Months
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <span className="text-[10px] uppercase font-bold text-purpleAccent-600">Tracking Engine</span>
                    <p className="text-sm font-bold text-purpleAccent-700 dark:text-purpleAccent-300 mt-0.5">
                      {activeProduct.isSerialized ? 'Serialized IMEI' : 'Quantity Stock'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Specifications & Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Brand:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeProduct.brand?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Category:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeProduct.category?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Barcode:</span>{' '}
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {activeProduct.barcode || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Minimum Allowed Sale:</span>{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {activeProduct.minPrice ? formatLKR(activeProduct.minPrice) : 'Not Set'}
                      </span>
                    </div>
                  </div>
                  {activeProduct.description && (
                    <div className="pt-2 border-t border-slate-100 dark:border-dark-border text-xs text-slate-600 dark:text-slate-400">
                      {activeProduct.description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Hardware Variants */}
            {detailsTab === 'variants' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Product Variations (Storage, Color & Spec)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      E.g. 128GB Black, 256GB Black, 256GB Silver with custom prices.
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddVariant(!showAddVariant)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      {showAddVariant ? 'Cancel' : 'Add Variant'}
                    </Button>
                  )}
                </div>

                {/* Add Variant Form */}
                {showAddVariant && (
                  <form onSubmit={handleAddVariant} className="p-4 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
                    <h5 className="text-xs font-bold text-brand-700 dark:text-brand-300">
                      Create Hardware Variation
                    </h5>

                    {variantError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{variantError}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Storage Capacity</label>
                        <input
                          type="text"
                          placeholder="e.g. 128GB, 256GB, 512GB"
                          value={variantStorage}
                          onChange={(e) => setVariantStorage(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Color</label>
                        <input
                          type="text"
                          placeholder="e.g. Titanium Black, Silver"
                          value={variantColor}
                          onChange={(e) => setVariantColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">RAM (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 8GB, 12GB"
                          value={variantRam}
                          onChange={(e) => setVariantRam(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Hardware Model</label>
                        <input
                          type="text"
                          placeholder="e.g. SM-S928B"
                          value={variantModel}
                          onChange={(e) => setVariantModel(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Variant Barcode</label>
                        <input
                          type="text"
                          placeholder="e.g. 8806095328192"
                          value={variantBarcode}
                          onChange={(e) => setVariantBarcode(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Custom SKU (Optional)</label>
                        <input
                          type="text"
                          placeholder="Auto-generated if empty"
                          value={variantSku}
                          onChange={(e) => setVariantSku(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Cost Price (LKR)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={String(activeProduct.costPrice)}
                          value={variantCost}
                          onChange={(e) => setVariantCost(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Retail Price (LKR)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={String(activeProduct.retailPrice)}
                          value={variantRetail}
                          onChange={(e) => setVariantRetail(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddVariant(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={variantSubmitting}
                      >
                        Save Variant
                      </Button>
                    </div>
                  </form>
                )}

                {/* Variants List Table */}
                {!activeProduct.variants || activeProduct.variants.length === 0 ? (
                  <div className="p-6 text-center border rounded-xl border-dashed border-slate-200 dark:border-dark-border">
                    <p className="text-xs text-slate-500">
                      No hardware variations created yet for this product.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variant SKU</TableHead>
                          <TableHead>Color / Storage / RAM</TableHead>
                          <TableHead>Model / Barcode</TableHead>
                          <TableHead>Cost (LKR)</TableHead>
                          <TableHead>Retail (LKR)</TableHead>
                          {canManage && <TableHead className="text-right">Action</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeProduct.variants.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell>
                              <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                                {v.sku}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                {v.storage && <span className="font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mr-1.5">{v.storage}</span>}
                                {v.color && <span>{v.color}</span>}
                                {v.ram && <span className="text-slate-400 ml-1.5">({v.ram} RAM)</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-[11px] text-slate-500">
                                {v.model && <div>Model: {v.model}</div>}
                                {v.barcode && <div className="font-mono">BC: {v.barcode}</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-500">
                                {formatLKR(v.costPrice || activeProduct.costPrice)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {formatLKR(v.retailPrice || activeProduct.retailPrice)}
                              </span>
                            </TableCell>
                            {canManage && (
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDeleteVariant(v.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: In-Stock Serialized Devices */}
            {detailsTab === 'devices' && activeProduct.isSerialized && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      In-Stock Serialized Inventory
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Devices currently stored and available for POS checkout.
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {activeProduct.devices?.length || 0} Units Ready
                  </Badge>
                </div>

                {!activeProduct.devices || activeProduct.devices.length === 0 ? (
                  <div className="p-6 text-center border rounded-xl border-dashed border-slate-200 dark:border-dark-border">
                    <p className="text-xs text-slate-500">
                      Zero units currently in stock. Go to IMEI Registry to intake new device stock.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-xl border-slate-200 dark:border-dark-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Primary IMEI 1</TableHead>
                          <TableHead>Serial No</TableHead>
                          <TableHead>Color / Storage</TableHead>
                          <TableHead>Cost (LKR)</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeProduct.devices.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>
                              <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                                {d.imei1}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-mono text-slate-500">
                                {d.serialNumber || '—'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-700 dark:text-slate-300">
                                {d.color || ''} {d.storage ? `• ${d.storage}` : ''}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-slate-500">{formatLKR(d.purchaseCost)}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="success" size="sm" dot>
                                {d.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Images Gallery */}
            {detailsTab === 'images' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Product Imagery & Assets
                  </h4>
                  {canManage && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddImage(!showAddImage)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      {showAddImage ? 'Cancel' : 'Add Image URL'}
                    </Button>
                  )}
                </div>

                {showAddImage && (
                  <form onSubmit={handleAddImage} className="flex gap-2 items-center p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card"
                      required
                    />
                    <Button type="submit" variant="primary" size="sm" isLoading={imageSubmitting}>
                      Attach
                    </Button>
                  </form>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeProduct.images?.map((img) => (
                    <div key={img.id} className="relative group border rounded-xl overflow-hidden border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-surface aspect-square">
                      <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
