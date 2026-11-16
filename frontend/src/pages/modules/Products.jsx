import React, { useState, useEffect, useRef } from 'react'
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
  AlertTriangle,
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
  Upload,
  X,
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
import { productsAPI, categoriesAPI, brandsAPI, inventoryAPI, devicesAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

function ProductThumbnail({ src, alt, className = 'w-10 h-10' }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div className={`rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center shrink-0 text-slate-400 ${className}`}>
        <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || 'Product'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`rounded-xl object-contain bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shrink-0 p-0.5 shadow-2xs ${className}`}
    />
  )
}

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
  const [stockStatusFilter, setStockStatusFilter] = useState('')

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [modalError, setModalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState(null)
  const [restockMode, setRestockMode] = useState('ADD') // 'ADD' or 'SET'
  const [restockQuantity, setRestockQuantity] = useState('10')
  const [restockReason, setRestockReason] = useState('Stock replenishment')
  const [restockNotes, setRestockNotes] = useState('')
  const [restockUnitCost, setRestockUnitCost] = useState('')
  const [isRestocking, setIsRestocking] = useState(false)
  const [restockError, setRestockError] = useState('')

  // Serialized quick restock device fields
  const [quickImei1, setQuickImei1] = useState('')
  const [quickImei2, setQuickImei2] = useState('')
  const [quickColor, setQuickColor] = useState('')
  const [quickStorage, setQuickStorage] = useState('')

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

  // Quick Create Category & Brand State inside Modal
  const [showQuickCategory, setShowQuickCategory] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickCategoryLoading, setQuickCategoryLoading] = useState(false)

  const [showQuickBrand, setShowQuickBrand] = useState(false)
  const [quickBrandName, setQuickBrandName] = useState('')
  const [quickBrandLoading, setQuickBrandLoading] = useState(false)

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
  const [location, setLocation] = useState('Store Floor')
  const [imageUrl, setImageUrl] = useState('')
  const [imageLoadStatus, setImageLoadStatus] = useState('idle')
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds the 5MB size limit.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result)
      setImageLoadStatus('valid')
    }
    reader.readAsDataURL(file)
  }

  const handleImageUrlChange = (val) => {
    setImageUrl(val)
    if (!val.trim()) {
      setImageLoadStatus('idle')
    } else {
      setImageLoadStatus('loading')
    }
  }

  const fetchAuxiliary = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        categoriesAPI.list(),
        brandsAPI.list(),
      ])
      const cats = catsRes.data?.data || []
      const brs = brandsRes.data?.data || []
      setCategories(cats)
      setBrands(brs)
      return { categories: cats, brands: brs }
    } catch (e) {
      console.error('Error fetching categories/brands:', e)
      return { categories: [], brands: [] }
    }
  }

  const handleQuickCreateCategory = async () => {
    if (!quickCategoryName.trim()) return
    setQuickCategoryLoading(true)
    try {
      const res = await categoriesAPI.create({ name: quickCategoryName.trim() })
      const newCat = res.data?.data
      if (newCat) {
        setCategories((prev) => [...prev, newCat])
        setCategoryId(newCat.id)
        setQuickCategoryName('')
        setShowQuickCategory(false)
      }
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to create category.')
    } finally {
      setQuickCategoryLoading(false)
    }
  }

  const handleQuickCreateBrand = async () => {
    if (!quickBrandName.trim()) return
    setQuickBrandLoading(true)
    try {
      const res = await brandsAPI.create({ name: quickBrandName.trim() })
      const newBrand = res.data?.data
      if (newBrand) {
        setBrands((prev) => [...prev, newBrand])
        setBrandId(newBrand.id)
        setQuickBrandName('')
        setShowQuickBrand(false)
      }
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to create brand.')
    } finally {
      setQuickBrandLoading(false)
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

  const handleOpenAdd = async () => {
    setEditingProduct(null)
    setName('')
    setSku('')
    setBarcode('')
    setDescription('')
    setIsSerialized(false)
    setCostPrice('')
    setRetailPrice('')
    setMinPrice('')
    setDefaultWarrantyMonths('12')
    setInitialStock('0')
    setReorderLevel('5')
    setLocation('Store Floor')
    setImageUrl('')
    setImageLoadStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setModalError('')
    setShowQuickCategory(false)
    setShowQuickBrand(false)
    setIsModalOpen(true)

    // Freshly fetch categories & brands every time modal opens
    const aux = await fetchAuxiliary()
    if (aux.categories?.length > 0) {
      setCategoryId(aux.categories[0].id)
    } else {
      setCategoryId('')
    }
    if (aux.brands?.length > 0) {
      setBrandId(aux.brands[0].id)
    } else {
      setBrandId('')
    }
  }

  const getProductThreshold = (p) => Number(p?.inventory?.[0]?.reorderLevel ?? 5)
  const getProductStock = (p) => Number(p?.stockCount ?? p?.inventory?.[0]?.quantity ?? 0)

  const handleOpenEdit = async (prod) => {
    setEditingProduct(prod)
    setName(prod.name)
    setSku(prod.sku)
    setBarcode(prod.barcode || '')
    setDescription(prod.description || '')
    setCategoryId(prod.categoryId || '')
    setBrandId(prod.brandId || '')
    setIsSerialized(Boolean(prod.isSerialized))
    setCostPrice(String(prod.costPrice))
    setRetailPrice(String(prod.retailPrice))
    setMinPrice(prod.minPrice ? String(prod.minPrice) : '')
    setDefaultWarrantyMonths(String(prod.defaultWarrantyMonths || 0))
    const initialImg = prod.images?.[0]?.url || ''
    setImageUrl(initialImg)
    setImageLoadStatus(initialImg ? 'loading' : 'idle')
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Current stock & threshold setup
    const curQty = getProductStock(prod)
    const curThreshold = getProductThreshold(prod)
    const curLocation = prod.inventory?.[0]?.location || 'Store Floor'

    setInitialStock(String(curQty))
    setReorderLevel(String(curThreshold))
    setLocation(curLocation)

    setModalError('')
    setShowQuickCategory(false)
    setShowQuickBrand(false)
    setIsModalOpen(true)

    await fetchAuxiliary()
  }

  const handleOpenRestock = (prod) => {
    setRestockProduct(prod)
    setRestockQuantity('10')
    setRestockMode('ADD')
    setRestockReason('Stock replenishment')
    setRestockNotes('')
    setRestockUnitCost(String(prod.costPrice || ''))
    setQuickImei1('')
    setQuickImei2('')
    setQuickColor(prod.variants?.[0]?.color || '')
    setQuickStorage(prod.variants?.[0]?.storage || '')
    setRestockError('')
    setIsRestockModalOpen(true)
  }

  const handleConfirmRestock = async (e) => {
    e.preventDefault()
    if (!restockProduct) return
    setIsRestocking(true)
    setRestockError('')

    try {
      if (restockProduct.isSerialized) {
        if (!quickImei1.trim()) {
          setRestockError('Primary IMEI (IMEI 1) is required to intake a serialized device.')
          setIsRestocking(false)
          return
        }
        await devicesAPI.register({
          productId: restockProduct.id,
          imei1: quickImei1.trim(),
          imei2: quickImei2.trim() || undefined,
          purchaseCost: Number(restockUnitCost) || restockProduct.costPrice,
          sellingPrice: restockProduct.retailPrice,
          color: quickColor.trim() || undefined,
          storage: quickStorage.trim() || undefined,
          notes: restockNotes.trim() || undefined,
        })
        setSuccessMsg(`Device IMEI ${quickImei1.trim()} registered. Stock updated for "${restockProduct.name}".`)
      } else {
        const qty = Number(restockQuantity)
        if (isNaN(qty) || qty <= 0) {
          setRestockError('Please enter a valid numeric quantity greater than 0.')
          setIsRestocking(false)
          return
        }
        await inventoryAPI.adjust({
          productId: restockProduct.id,
          type: restockMode,
          quantity: qty,
          reason: restockReason || 'Stock replenishment',
          notes: restockNotes.trim() || undefined,
        })
        const curStock = getProductStock(restockProduct)
        const finalStock = restockMode === 'ADD' ? curStock + qty : qty
        setSuccessMsg(`Restocked "${restockProduct.name}" successfully (New Stock: ${finalStock} units).`)
      }

      setIsRestockModalOpen(false)
      fetchProducts(pagination.page)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setRestockError(err.response?.data?.error?.message || 'Failed to complete restock operation.')
    } finally {
      setIsRestocking(false)
    }
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
        initialStock: Number(initialStock || 0),
        quantity: Number(initialStock || 0),
        reorderLevel: Number(reorderLevel || 5),
        location: location || 'Store Floor',
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
  const outOfStockCount = products.filter((p) => getProductStock(p) === 0).length
  const lowStockCount = products.filter((p) => {
    const s = getProductStock(p)
    const t = getProductThreshold(p)
    return s > 0 && s <= t
  }).length

  // Filtered displayed products
  const displayedProducts = products.filter((p) => {
    if (!stockStatusFilter) return true
    const s = getProductStock(p)
    const t = getProductThreshold(p)
    if (stockStatusFilter === 'OUT_OF_STOCK') return s === 0
    if (stockStatusFilter === 'LOW_STOCK') return s > 0 && s <= t
    if (stockStatusFilter === 'IN_STOCK') return s > t
    return true
  })

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
        <Card
          hover
          className={`p-4 border-l-4 border-l-brand-500 cursor-pointer transition-all ${
            stockStatusFilter === '' ? 'ring-1 ring-brand-500 shadow-sm' : ''
          }`}
          onClick={() => setStockStatusFilter('')}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Total Catalog SKUs</p>
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalProducts}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click to view all products</p>
        </Card>

        <Card
          hover
          className={`p-4 border-l-4 border-l-purpleAccent-500 cursor-pointer transition-all ${
            serializedFilter === 'true' ? 'ring-1 ring-purpleAccent-500 shadow-sm' : ''
          }`}
          onClick={() => setSerializedFilter(serializedFilter === 'true' ? '' : 'true')}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Serialized Devices</p>
            <ScanLine className="w-4 h-4 text-purpleAccent-500" />
          </div>
          <h3 className="text-xl font-bold text-purpleAccent-600 dark:text-purpleAccent-400 mt-1">{serializedCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Strict IMEI tracking</p>
        </Card>

        <Card
          hover
          className={`p-4 border-l-4 border-l-amber-500 cursor-pointer transition-all ${
            stockStatusFilter === 'LOW_STOCK' ? 'ring-1 ring-amber-500 shadow-sm bg-amber-50/20 dark:bg-amber-950/20' : ''
          }`}
          onClick={() => setStockStatusFilter(stockStatusFilter === 'LOW_STOCK' ? '' : 'LOW_STOCK')}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Low Stock Notice</p>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{lowStockCount}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">At or below reorder limit (Filter)</p>
        </Card>

        <Card
          hover
          className={`p-4 border-l-4 border-l-rose-500 cursor-pointer transition-all ${
            stockStatusFilter === 'OUT_OF_STOCK' ? 'ring-1 ring-rose-500 shadow-sm bg-rose-50/20 dark:bg-rose-950/20' : ''
          }`}
          onClick={() => setStockStatusFilter(stockStatusFilter === 'OUT_OF_STOCK' ? '' : 'OUT_OF_STOCK')}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">Out of Stock</p>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{outOfStockCount}</h3>
          <p className="text-[11px] text-rose-500/80 mt-0.5">0 units available (Filter & Restock)</p>
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

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">All Stock Levels</option>
                <option value="IN_STOCK">In Stock (Healthy)</option>
                <option value="LOW_STOCK">Low Stock (≤ Limit)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0 Units)</option>
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
          ) : displayedProducts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title="No products found"
                description={
                  stockStatusFilter
                    ? `No products currently match "${stockStatusFilter.replace('_', ' ')}".`
                    : "No products match your filter parameters."
                }
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
                  <TableHead>Available Stock & Limit</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProductThumbnail src={p.images?.[0]?.url} alt={p.name} />
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
                      {(() => {
                        const stock = getProductStock(p)
                        const limit = getProductThreshold(p)
                        const isOut = stock === 0
                        const isLow = stock > 0 && stock <= limit

                        if (isOut) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0" />
                              0 • OUT OF STOCK
                            </span>
                          )
                        }
                        if (isLow) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
                              {stock} left • LOW (Limit {limit})
                            </span>
                          )
                        }
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                            {stock} {p.isSerialized ? 'Units' : 'in Stock'}
                          </span>
                        )
                      })()}
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
                              onClick={() => handleOpenRestock(p)}
                              title="Restock Product"
                            >
                              <Boxes className="w-3.5 h-3.5 text-brand-600 hover:text-brand-700" />
                            </Button>
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

            {/* Category Selection with Quick Add */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {showQuickCategory ? 'New Category Name *' : 'Category *'}
                </label>
                {!showQuickCategory ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickCategory(true)
                      setQuickCategoryName('')
                    }}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Quick Add
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQuickCategory(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {showQuickCategory ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    placeholder="Enter new category name..."
                    className="flex-1 rounded-xl border border-brand-500 bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleQuickCreateCategory()
                      } else if (e.key === 'Escape') {
                        setShowQuickCategory(false)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleQuickCreateCategory}
                    isLoading={quickCategoryLoading}
                    className="shrink-0"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  <option value="">{categories.length === 0 ? 'No categories yet — click Quick Add' : 'Select Category'}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900 dark:text-white bg-white dark:bg-dark-surface">
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Brand Selection with Quick Add */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {showQuickBrand ? 'New Brand Name' : 'Brand (Optional)'}
                </label>
                {!showQuickBrand ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickBrand(true)
                      setQuickBrandName('')
                    }}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Quick Add
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQuickBrand(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {showQuickBrand ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={quickBrandName}
                    onChange={(e) => setQuickBrandName(e.target.value)}
                    placeholder="Enter new brand name..."
                    className="flex-1 rounded-xl border border-brand-500 bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleQuickCreateBrand()
                      } else if (e.key === 'Escape') {
                        setShowQuickBrand(false)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleQuickCreateBrand}
                    isLoading={quickBrandLoading}
                    className="shrink-0"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  <option value="">{brands.length === 0 ? 'No brands yet — click Quick Add' : 'Select Brand (Optional)'}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900 dark:text-white bg-white dark:bg-dark-surface">
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Product Image Section (Upload & URL) */}
          <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/60 dark:bg-dark-surface/40">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Product Image (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  className="bg-white dark:bg-dark-card"
                >
                  Upload from Computer
                </Button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="Or paste direct image URL (e.g. https://...image.jpg)"
                className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pr-8"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('')
                    setImageLoadStatus('idle')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border animate-in fade-in">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoadStatus('valid')}
                  onError={() => setImageLoadStatus('error')}
                  className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shrink-0 p-0.5"
                />
                <div className="flex-1 min-w-0">
                  {imageLoadStatus === 'valid' && (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Image loaded successfully</span>
                    </div>
                  )}
                  {imageLoadStatus === 'error' && (
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Could not display image from this link</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        Right-click the picture itself on the webpage and select <em>"Copy Image Address"</em>, or click <strong>"Upload from Computer"</strong> above.
                      </p>
                    </div>
                  )}
                  {imageLoadStatus === 'loading' && (
                    <span className="text-xs text-slate-400 animate-pulse">Testing image link...</span>
                  )}
                </div>
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
                  ? 'Each unit requires a unique IMEI 1. Inventory is tracked by individual IMEI numbers.'
                  : 'Bulk accessory: Tracked using numeric quantity count.'}
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

          {/* Financials & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Cost Price (LKR)"
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 55000"
              required
            />
            <Input
              label="Retail Price (LKR)"
              type="number"
              step="0.01"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              placeholder="e.g. 62000"
              required
            />
            <Input
              label="Min Selling Price (LKR)"
              type="number"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 60000"
            />
            <Input
              label="Warranty (Months)"
              type="number"
              value={defaultWarrantyMonths}
              onChange={(e) => setDefaultWarrantyMonths(e.target.value)}
              placeholder="12"
            />
          </div>

          {/* Stock & Inventory Thresholds Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Inventory & Stock Limits
                </span>
              </div>

              {/* Status Badge */}
              {!isSerialized ? (
                <div>
                  {Number(initialStock || 0) === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                      0 • OUT OF STOCK
                    </span>
                  ) : Number(initialStock) <= Number(reorderLevel || 5) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      LOW STOCK ({initialStock} left • Limit: {reorderLevel})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      IN STOCK ({initialStock} Units)
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="purple" size="sm">
                  IMEI Serialized ({editingProduct ? (editingProduct.stockCount || 0) : 0} Devices Active)
                </Badge>
              )}
            </div>

            {!isSerialized ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
                {/* Column 1: Quantity with Quick Add */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {editingProduct ? 'Current Quantity' : 'Initial Quantity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-slate-400 mr-0.5">Quick add:</span>
                    {[5, 10, 25, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setInitialStock(String(Math.max(0, (Number(initialStock) || 0) + num)))}
                        className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-dark-surface dark:hover:bg-brand-950 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Reorder Threshold */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Triggers low stock notice when quantity ≤ this limit.
                  </p>
                </div>

                {/* Column 3: Storage Location */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Storage Bin / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Store Floor, Rack A2"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Physical display or back-office storage bin.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Triggers alert when active serialized devices ≤ this limit.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Storage Bin / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Vault, Display 1"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Physical display or vault location.
                  </p>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
                  <span>
                    <strong>Serialized Inventory:</strong> Quantity is derived live from active IMEIs in the device registry.
                  </span>
                  <a
                    href="/imei-devices"
                    className="text-purple-700 dark:text-purple-300 font-bold underline hover:text-purple-900 ml-2"
                  >
                    Open IMEI Devices ➔
                  </a>
                </div>
              </div>
            )}
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

      {/* Quick Restock Inventory Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock Inventory — ${restockProduct?.name || ''}`}
        description={`SKU: ${restockProduct?.sku || ''} • Current Stock: ${getProductStock(restockProduct)} • Alert Limit: ${getProductThreshold(restockProduct)}`}
        maxWidth="lg"
      >
        {restockProduct && (
          <form onSubmit={handleConfirmRestock} className="space-y-4">
            {restockError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
                {restockError}
              </div>
            )}

            {/* Current Status banner */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Available Stock</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {getProductStock(restockProduct)} {restockProduct.isSerialized ? 'Units' : 'in Stock'}
                </p>
              </div>

              <div>
                {getProductStock(restockProduct) === 0 ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> OUT OF STOCK
                  </span>
                ) : getProductStock(restockProduct) <= getProductThreshold(restockProduct) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> LOW STOCK (Limit {getProductThreshold(restockProduct)})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> IN STOCK
                  </span>
                )}
              </div>
            </div>

            {!restockProduct.isSerialized ? (
              <div className="space-y-4">
                {/* Restock Mode Toggle */}
                <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setRestockMode('ADD')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      restockMode === 'ADD'
                        ? 'bg-white dark:bg-dark-card text-brand-600 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    + Add Units to Existing Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockMode('SET')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      restockMode === 'SET'
                        ? 'bg-white dark:bg-dark-card text-brand-600 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Set Exact Total Level
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {restockMode === 'ADD' ? 'Units to Add (+)' : 'New Total Quantity (=)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>

                {/* Quick Add Chips */}
                {restockMode === 'ADD' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">Quick increments:</span>
                    {[5, 10, 20, 50, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRestockQuantity(String(num))}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                )}

                {/* Real-time Calculation Summary */}
                <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 flex items-center justify-between text-xs">
                  <span className="text-brand-900 dark:text-brand-300 font-semibold">
                    Calculated New Stock Level:
                  </span>
                  <span className="font-bold text-base text-brand-700 dark:text-brand-400">
                    {restockMode === 'ADD'
                      ? getProductStock(restockProduct) + (Number(restockQuantity) || 0)
                      : Number(restockQuantity) || 0}{' '}
                    Units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Reason for Restock"
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    placeholder="e.g. Supplier delivery, Refill"
                  />
                  <Input
                    label="Supplier / Reference Note (Optional)"
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="e.g. Invoice #9021"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 space-y-1">
                  <p className="font-bold">Serialized Product IMEI Intake</p>
                  <p>
                    Stock for serialized models is increased by registering individual unique IMEI numbers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Primary IMEI (IMEI 1) *"
                      value={quickImei1}
                      onChange={(e) => setQuickImei1(e.target.value)}
                      placeholder="e.g. 352948110293847"
                      required
                    />
                  </div>
                  <Input
                    label="Secondary IMEI (IMEI 2 - Optional)"
                    value={quickImei2}
                    onChange={(e) => setQuickImei2(e.target.value)}
                    placeholder="e.g. 352948110293848"
                  />
                  <Input
                    label="Purchase Cost (LKR)"
                    type="number"
                    step="0.01"
                    value={restockUnitCost}
                    onChange={(e) => setRestockUnitCost(e.target.value)}
                    placeholder={String(restockProduct.costPrice)}
                  />
                  <Input
                    label="Color (Optional)"
                    value={quickColor}
                    onChange={(e) => setQuickColor(e.target.value)}
                    placeholder="e.g. Titanium Gray"
                  />
                  <Input
                    label="Storage (Optional)"
                    value={quickStorage}
                    onChange={(e) => setQuickStorage(e.target.value)}
                    placeholder="e.g. 256GB"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRestockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isRestocking}
                className="shadow-glow-blue"
              >
                {restockProduct.isSerialized ? 'Register Device & Add Stock' : 'Confirm Restock'}
              </Button>
            </div>
          </form>
        )}
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

                {/* Live Stock Level & Restock Callout */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/70 dark:bg-dark-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Inventory Status & Location
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {getProductStock(activeProduct)} {activeProduct.isSerialized ? 'Units (IMEI)' : 'in Stock'}
                      </span>
                      {getProductStock(activeProduct) === 0 ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                          OUT OF STOCK
                        </span>
                      ) : getProductStock(activeProduct) <= getProductThreshold(activeProduct) ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          LOW STOCK (≤ {getProductThreshold(activeProduct)})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          IN STOCK
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reorder Alert Limit: <strong>{getProductThreshold(activeProduct)}</strong> • Bin / Location: <strong>{activeProduct.inventory?.[0]?.location || 'Store Floor'}</strong>
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setIsDetailsOpen(false)
                        handleOpenRestock(activeProduct)
                      }}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="shadow-glow-blue shrink-0"
                    >
                      Restock Product
                    </Button>
                  )}
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
                    <div key={img.id} className="relative group border rounded-xl overflow-hidden border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface aspect-square flex items-center justify-center p-1.5">
                      <img
                        src={img.url}
                        alt="Product"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-slate-400">
                        <Package className="w-8 h-8" />
                      </div>
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
