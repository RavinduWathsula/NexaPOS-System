import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Smartphone,
  Search,
  Barcode,
  ScanLine,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Split,
  User,
  UserPlus,
  Phone,
  RefreshCw,
  CheckCircle2,
  X,
  Receipt,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Percent,
  AlertCircle,
  Building,
  ShieldCheck,
  Check,
  Tag,
  Warehouse,
  Globe,
  MapPin,
  Info,
  Eye,
  Package,
  ShoppingCart,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { ThermalReceipt } from '@/components/pos/ThermalReceipt'
import { posAPI, categoriesAPI, brandsAPI } from '@/services/api'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

export function POSTerminal() {
  const { user } = useAuthStore()

  // Catalog & Filters
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [search, setSearch] = useState('')
  const [scannerInput, setScannerInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Shopping Cart State
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)
  const customerDropdownRef = useRef(null)
  const [invoiceDiscount, setInvoiceDiscount] = useState(0)
  const [invoiceTax, setInvoiceTax] = useState(0)

  // Filtered customer list for instant search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 10)
    const q = customerSearch.toLowerCase().trim()
    return customers
      .filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.nic && c.nic.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
      .slice(0, 10)
  }, [customers, customerSearch])

  // Product Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [detailsProduct, setDetailsProduct] = useState(null)
  const [detailsQty, setDetailsQty] = useState(1)
  const [detailsSelectedImeis, setDetailsSelectedImeis] = useState([])

  // IMEI Picker Modal State
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false)
  const [targetSerializedProduct, setTargetSerializedProduct] = useState(null)
  const [selectedImeiDevices, setSelectedImeiDevices] = useState([])

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH') // CASH, CARD, BANK_TRANSFER, SPLIT
  const [cashTendered, setCashTendered] = useState('')
  const [cardLastFour, setCardLastFour] = useState('')
  const [bankRef, setBankRef] = useState('')
  const [splitPayments, setSplitPayments] = useState([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // Quick Customer Registration Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custEmail, setCustEmail] = useState('')
  const [custNic, setCustNic] = useState('')
  const [custAddress, setCustAddress] = useState('')
  const [custSubmitting, setCustSubmitting] = useState(false)

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Notifications
  const [toastMsg, setToastMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const scannerRef = useRef(null)

  // Fetch Aux Data
  const fetchAux = async () => {
    try {
      const [catsRes, brandsRes, custRes] = await Promise.all([
        categoriesAPI.list(),
        brandsAPI.list(),
        posAPI.customers(),
      ])
      setCategories(catsRes.data?.data || [])
      setBrands(brandsRes.data?.data || [])
      setCustomers(custRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load aux POS data:', err)
    }
  }

  // Fetch POS Catalog
  const fetchCatalog = async () => {
    setIsLoading(true)
    try {
      const res = await posAPI.catalog({
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
        search: search.trim() || undefined,
      })
      setProducts(res.data?.data || [])
    } catch (err) {
      setErrorMsg('Failed to load products for POS.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAux()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [selectedCategory, selectedBrand, search])

  // Barcode / IMEI Fast Scanner Handler
  const handleScannerSubmit = async (e) => {
    e.preventDefault()
    const code = scannerInput.trim()
    if (!code) return
    setScannerInput('')

    try {
      // 1. First try direct IMEI lookup
      const imeiRes = await posAPI.lookupIMEI(code)
      if (imeiRes.data?.data) {
        const { product, device } = imeiRes.data.data
        addDeviceToCart(product, device)
        showToast(`Added ${product.name} (IMEI: ${device.imei1})`)
        return
      }
    } catch (err) {
      // If not an exact IMEI, search by barcode or SKU in products list
      const matched = products.find(
        (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
      )
      if (matched) {
        handleProductClick(matched)
      } else {
        setErrorMsg(`No product or device found matching code '${code}'.`)
        setTimeout(() => setErrorMsg(''), 3000)
      }
    }
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Product Details Modal Open (Triggered when user clicks product card)
  const handleOpenDetails = (product) => {
    setDetailsProduct(product)
    setDetailsQty(1)
    if (product.isSerialized && product.availableDevices?.length > 0) {
      setDetailsSelectedImeis([product.availableDevices[0]])
    } else {
      setDetailsSelectedImeis([])
    }
    setIsDetailsModalOpen(true)
  }

  // Add to Cart from Details Modal
  const handleAddFromDetails = () => {
    if (!detailsProduct) return
    if (detailsProduct.availableStock <= 0) {
      setErrorMsg(`'${detailsProduct.name}' is currently out of stock.`)
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }

    if (detailsProduct.isSerialized) {
      if (detailsSelectedImeis.length === 0) {
        setErrorMsg('Please select at least one in-stock IMEI device.')
        setTimeout(() => setErrorMsg(''), 3000)
        return
      }

      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.productId === detailsProduct.id && item.isSerialized
        )
        const newDeviceObjects = detailsSelectedImeis.map((dev) => ({
          deviceId: dev.id,
          imei1: dev.imei1,
          serialNumber: dev.serialNumber || '',
          color: dev.color || '',
          storage: dev.storage || '',
          sellingPrice: dev.sellingPrice || detailsProduct.retailPrice,
        }))

        if (existingIdx >= 0) {
          const updated = [...prev]
          const existingDevices = updated[existingIdx].devices || []
          const uniqueDevices = [...existingDevices]
          newDeviceObjects.forEach((nd) => {
            if (!uniqueDevices.some((d) => d.deviceId === nd.deviceId)) {
              uniqueDevices.push(nd)
            }
          })
          updated[existingIdx].quantity = uniqueDevices.length
          updated[existingIdx].devices = uniqueDevices
          return updated
        } else {
          return [
            ...prev,
            {
              productId: detailsProduct.id,
              name: detailsProduct.name,
              sku: detailsProduct.sku,
              unitPrice: detailsProduct.retailPrice,
              quantity: newDeviceObjects.length,
              discount: 0,
              isSerialized: true,
              devices: newDeviceObjects,
              availableStock: detailsProduct.availableStock,
            },
          ]
        }
      })
      showToast(`Added ${detailsSelectedImeis.length} device(s) of ${detailsProduct.name}`)
      setIsDetailsModalOpen(false)
    } else {
      // Non-serialized accessory with selected quantity
      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.productId === detailsProduct.id && !item.isSerialized
        )
        if (existingIdx >= 0) {
          const currentQty = prev[existingIdx].quantity
          const newQty = currentQty + detailsQty
          if (newQty > detailsProduct.availableStock) {
            setErrorMsg(`Cannot add more than ${detailsProduct.availableStock} units in stock.`)
            setTimeout(() => setErrorMsg(''), 3000)
            return prev
          }
          const updated = [...prev]
          updated[existingIdx].quantity = newQty
          return updated
        } else {
          if (detailsQty > detailsProduct.availableStock) {
            setErrorMsg(`Cannot add more than ${detailsProduct.availableStock} units in stock.`)
            setTimeout(() => setErrorMsg(''), 3000)
            return prev
          }
          return [
            ...prev,
            {
              productId: detailsProduct.id,
              name: detailsProduct.name,
              sku: detailsProduct.sku,
              unitPrice: detailsProduct.retailPrice,
              quantity: detailsQty,
              discount: 0,
              isSerialized: false,
              availableStock: detailsProduct.availableStock,
            },
          ]
        }
      })
      showToast(`Added ${detailsQty} × ${detailsProduct.name}`)
      setIsDetailsModalOpen(false)
    }
  }

  // Quick 1-click addition directly from the card button
  const handleQuickAdd = (product) => {
    if (product.availableStock <= 0) {
      setErrorMsg(`'${product.name}' is currently out of stock.`)
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }

    if (product.isSerialized) {
      handleOpenDetails(product)
    } else {
      addNonSerializedToCart(product)
    }
  }

  // Product Card Click (Opens Rich Details Modal)
  const handleProductClick = (product) => {
    handleOpenDetails(product)
  }

  // Add Non-Serialized Accessory to Cart
  const addNonSerializedToCart = (product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id && !item.isSerialized)
      if (existingIdx >= 0) {
        const currentQty = prev[existingIdx].quantity
        if (currentQty >= product.availableStock) {
          setErrorMsg(`Cannot add more than ${product.availableStock} units in stock.`)
          setTimeout(() => setErrorMsg(''), 3000)
          return prev
        }
        const updated = [...prev]
        updated[existingIdx].quantity += 1
        return updated
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.retailPrice,
            quantity: 1,
            discount: 0,
            isSerialized: false,
            availableStock: product.availableStock,
          },
        ]
      }
    })
    showToast(`Added ${product.name}`)
  }

  // Add Specific Serialized Device to Cart
  const addDeviceToCart = (product, device) => {
    setCart((prev) => {
      // Check if this exact device is already in cart
      const isAlreadyInCart = prev.some(
        (item) => item.device && item.device.id === device.id
      )
      if (isAlreadyInCart) {
        setErrorMsg(`Device with IMEI ${device.imei1} is already in your cart.`)
        setTimeout(() => setErrorMsg(''), 3000)
        return prev
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: device.sellingPrice || product.retailPrice,
          quantity: 1,
          discount: 0,
          isSerialized: true,
          device,
          deviceIds: [device.id],
        },
      ]
    })
  }

  // Confirm Selection from IMEI Modal
  const handleConfirmImeiSelection = () => {
    if (selectedImeiDevices.length === 0) return
    selectedImeiDevices.forEach((dev) => {
      addDeviceToCart(targetSerializedProduct, dev)
    })
    showToast(`Added ${selectedImeiDevices.length} phone(s) to cart`)
    setIsImeiModalOpen(false)
  }

  // Cart Controls
  const handleUpdateQty = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev]
      const item = updated[index]

      if (item.isSerialized) {
        // Serialized items are 1 unit per device
        return prev
      }

      const newQty = item.quantity + delta
      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== index)
      }
      if (newQty > item.availableStock) {
        setErrorMsg(`Max available stock is ${item.availableStock}.`)
        setTimeout(() => setErrorMsg(''), 3000)
        return prev
      }

      item.quantity = newQty
      return updated
    })
  }

  const handleUpdateLineDiscount = (index, amount) => {
    setCart((prev) => {
      const updated = [...prev]
      updated[index].discount = Math.max(0, Number(amount) || 0)
      return updated
    })
  }

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleClearCart = () => {
    if (cart.length === 0) return
    if (window.confirm('Clear all items from the current cart?')) {
      setCart([])
      setInvoiceDiscount(0)
      setSelectedCustomer(null)
    }
  }

  // Cart Totals Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - (Number(item.discount) || 0),
    0
  )
  const grandTotal = Math.max(0, cartSubtotal - Number(invoiceDiscount) + Number(invoiceTax))

  // Open Payment Modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return
    setPaymentMethod('CASH')
    setCashTendered(String(grandTotal))
    setCardLastFour('')
    setBankRef('')
    setSplitPayments([
      { method: 'CASH', amount: grandTotal },
    ])
    setCheckoutError('')
    setIsPaymentModalOpen(true)
  }

  // Checkout Submission
  const handleProcessCheckout = async (e) => {
    e.preventDefault()
    setCheckoutError('')
    setIsCheckingOut(true)

    try {
      // Build payment payload
      let paymentsPayload = []
      if (paymentMethod === 'CASH') {
        paymentsPayload = [{ method: 'CASH', amount: grandTotal }]
      } else if (paymentMethod === 'CARD') {
        paymentsPayload = [
          { method: 'CARD', amount: grandTotal, cardLastFour: cardLastFour.trim() || undefined },
        ]
      } else if (paymentMethod === 'BANK_TRANSFER') {
        paymentsPayload = [
          { method: 'BANK_TRANSFER', amount: grandTotal, transactionRef: bankRef.trim() || undefined },
        ]
      } else if (paymentMethod === 'SPLIT') {
        const splitSum = splitPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
        if (splitSum < grandTotal - 0.01) {
          throw new Error(
            `Split payments total (Rs. ${splitSum.toLocaleString()}) does not cover the invoice total (Rs. ${grandTotal.toLocaleString()}).`
          )
        }
        paymentsPayload = splitPayments.map((p) => ({
          method: p.method,
          amount: Number(p.amount),
        }))
      }

      // Build cart items payload
      const itemsPayload = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: Number(item.discount) || 0,
        deviceIds: item.isSerialized ? item.deviceIds : undefined,
      }))

      const payload = {
        customerId: selectedCustomer ? selectedCustomer.id : null,
        items: itemsPayload,
        discount: Number(invoiceDiscount) || 0,
        tax: Number(invoiceTax) || 0,
        payments: paymentsPayload,
        cashReceived: paymentMethod === 'CASH' ? Number(cashTendered) : grandTotal,
      }

      const res = await posAPI.checkout(payload)
      const sale = res.data?.data

      // Success: clear cart, show receipt modal
      setCompletedSale(sale)
      setCart([])
      setInvoiceDiscount(0)
      setSelectedCustomer(null)
      setIsPaymentModalOpen(false)
      setIsReceiptOpen(true)

      // Refresh catalog stock
      fetchCatalog()
    } catch (err) {
      setCheckoutError(err.response?.data?.error?.message || err.message || 'Transaction failed.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Quick Customer Registration
  const handleQuickCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!custName.trim() || !custPhone.trim()) {
      showToast('Customer name and phone number are required')
      return
    }
    setCustSubmitting(true)
    try {
      const res = await posAPI.quickCustomer({
        name: custName.trim(),
        phone: custPhone.trim(),
        email: custEmail.trim() || undefined,
        nic: custNic.trim() || undefined,
        address: custAddress.trim() || undefined,
      })
      const newCust = res.data?.data
      // Add to customers state list so it's immediately cached and visible
      setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)])
      setSelectedCustomer(newCust)
      setIsCustomerModalOpen(false)
      setIsCustomerDropdownOpen(false)
      setCustName('')
      setCustPhone('')
      setCustEmail('')
      setCustNic('')
      setCustAddress('')
      setCustomerSearch('')
      showToast(`Customer ${newCust.name} (${newCust.phone}) linked to active bill`)
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to create customer.')
    } finally {
      setCustSubmitting(false)
    }
  }

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col space-y-3 pb-2">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-20 right-8 z-50 p-3.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* POS Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border shrink-0 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black shadow-glow-blue">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              NexaPOS Billing Terminal
            </h1>
            <p className="text-[11px] text-slate-400">
              Cashier: <span className="font-semibold text-brand-600 dark:text-brand-400">{user?.name}</span> • Colombo Main
            </p>
          </div>
        </div>

        {/* Optical Scanner Barcode / IMEI Fast Input */}
        <form onSubmit={handleScannerSubmit} className="relative w-full sm:max-w-md">
          <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purpleAccent-500" />
          <input
            ref={scannerRef}
            type="text"
            placeholder="Scan barcode, SKU, or IMEI to instantly add..."
            value={scannerInput}
            onChange={(e) => setScannerInput(e.target.value)}
            className="w-full pl-9 pr-24 py-1.5 text-xs rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-dark-surface font-mono focus:outline-none focus:ring-2 focus:ring-purpleAccent-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold bg-purpleAccent-600 text-white rounded-lg hover:bg-purpleAccent-700 transition-colors"
          >
            Scan Item
          </button>
        </form>
      </div>

      {/* POS 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* LEFT COLUMN: Categories & Brand Filters (2 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-2 flex-col space-y-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === ''
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                }`}
              >
                All Departments
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors truncate ${
                    selectedCategory === c.id
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-dark-border">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Brands</h3>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CENTER COLUMN: Products Grid (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col space-y-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border min-h-0">
          {/* Search bar inside products */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No products match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((p) => {
                  const isOutOfStock = p.availableStock <= 0
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleProductClick(p)}
                      className={`relative flex flex-col justify-between p-3 rounded-2xl border transition-all text-left group ${
                        isOutOfStock
                          ? 'opacity-60 bg-slate-50 dark:bg-dark-surface/40 border-slate-200 cursor-not-allowed'
                          : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border hover:border-brand-500 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/60 flex items-center justify-center mb-2 p-2 shadow-2xs">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex'
                              }
                            }}
                            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center text-slate-300 ${
                            p.image ? 'hidden' : 'flex'
                          }`}
                        >
                          <Smartphone className="w-8 h-8" />
                        </div>
                        {p.isSerialized && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purpleAccent-600 text-white flex items-center gap-1 shadow">
                            <ScanLine className="w-2.5 h-2.5" /> IMEI
                          </span>
                        )}
                        <span
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 dark:bg-dark-surface/90 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs"
                          title="View Specifications & Details"
                        >
                          <Eye className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-1 mb-1 flex-wrap">
                          {p.brand && (
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded">
                              {p.brand}
                            </span>
                          )}
                          {p.brandCountry && (
                            <span className="text-[9px] font-medium text-slate-500 bg-slate-100 dark:bg-dark-card px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5 text-slate-400" />
                              {p.brandCountry}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {p.sku}
                        </span>
                      </div>

                      {/* Stock & Price + Quick Add Button */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between gap-1">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {formatLKR(p.retailPrice)}
                          </span>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                                : p.availableStock <= 3
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                            }`}
                          >
                            {isOutOfStock ? 'Out' : `${p.availableStock} in stock`}
                          </span>
                        </div>

                        {!isOutOfStock && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickAdd(p)
                            }}
                            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white flex items-center justify-center transition-colors shadow-2xs shrink-0"
                            title="Quick Add to Cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Shopping Cart & Checkout (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border min-h-0 shadow-sm">
          {/* Customer Selection & Profile Hub */}
          <div className="pb-3 border-b border-slate-100 dark:border-dark-border shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                Customer & Digital Bill
              </span>
              {selectedCustomer ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Linked to Invoice
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (customerSearch) {
                      const isDigits = /^\d+$/.test(customerSearch.trim())
                      if (isDigits) {
                        setCustPhone(customerSearch.trim())
                        setCustName('')
                      } else {
                        setCustName(customerSearch.trim())
                        setCustPhone('')
                      }
                    }
                    setIsCustomerModalOpen(true)
                  }}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  + New Customer
                </button>
              )}
            </div>

            {selectedCustomer ? (
              /* SELECTED CUSTOMER PROFILE CARD */
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {selectedCustomer.name
                        ? selectedCustomer.name
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'CU'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {selectedCustomer.name}
                        </span>
                        <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedCustomer.loyaltyTier || 'STANDARD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <strong className="font-mono text-slate-800 dark:text-slate-200">
                            {selectedCustomer.phone}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          SMS Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setCustomerSearch('')
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-dark-surface transition-colors"
                      title="Switch to Walk-in customer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {selectedCustomer.nic ? (
                      <span className="px-1.5 py-0.5 rounded bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border font-mono font-semibold text-slate-700 dark:text-slate-300">
                        NIC: {selectedCustomer.nic}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        No NIC provided (Walk-in)
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Hotline: 0713857835
                  </span>
                </div>
              </div>
            ) : (
              /* CUSTOMER SEARCH & SELECTION (WALK-IN MODE) */
              <div className="relative" ref={customerDropdownRef}>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setIsCustomerDropdownOpen(true)
                    }}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    placeholder="Search phone (07X...), name, or NIC..."
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Floating Customer Suggestions Dropdown */}
                {isCustomerDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {/* Default Walk-in Option */}
                    <div
                      onClick={() => {
                        setSelectedCustomer(null)
                        setIsCustomerDropdownOpen(false)
                      }}
                      className="p-2 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-surface flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          WI
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            Walk-in Customer (Cash)
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            No registered details required
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Default</span>
                    </div>

                    {/* Filtered Customer Matches */}
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c)
                            setIsCustomerDropdownOpen(false)
                            setCustomerSearch('')
                            showToast(`Selected customer ${c.name}`)
                          }}
                          className="p-2 border-b border-slate-100 dark:border-dark-border hover:bg-blue-50/60 dark:hover:bg-blue-950/30 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-extrabold shrink-0">
                              {c.name ? c.name[0].toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {c.name}
                                </span>
                                {c.nic && (
                                  <span className="text-[9px] bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 px-1 rounded font-mono">
                                    {c.nic}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                                {c.phone}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 shrink-0">
                            Select
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No customer found matching "{customerSearch}"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const isDigits = /^\d+$/.test(customerSearch.trim())
                            if (isDigits) {
                              setCustPhone(customerSearch.trim())
                              setCustName('')
                            } else {
                              setCustName(customerSearch.trim())
                              setCustPhone('')
                            }
                            setIsCustomerDropdownOpen(false)
                            setIsCustomerModalOpen(true)
                          }}
                          className="mt-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Register "{customerSearch}" as New Customer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-2 min-h-0 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">Cart is currently empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click products or scan barcodes</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h4>
                      {item.isSerialized && item.device && (
                        <div className="text-[10px] text-purpleAccent-600 font-mono font-bold flex items-center gap-1">
                          <ScanLine className="w-3 h-3" />
                          IMEI: {item.device.imei1}
                          {item.device.storage && <span>({item.device.storage})</span>}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(idx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity controls */}
                    {!item.isSerialized ? (
                      <div className="flex items-center gap-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purpleAccent-700 rounded-md">
                        1 Unit
                      </span>
                    )}

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatLKR(item.quantity * item.unitPrice - (Number(item.discount) || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div className="pt-3 border-t border-slate-200 dark:border-dark-border shrink-0 space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Discount (LKR):</span>
                <input
                  type="number"
                  min="0"
                  value={invoiceDiscount}
                  onChange={(e) => setInvoiceDiscount(e.target.value)}
                  className="w-20 px-1.5 py-0.5 text-right font-bold text-xs rounded border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
                />
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-dark-border">
                <span>Total Payable:</span>
                <span className="text-base text-brand-600 dark:text-brand-400">{formatLKR(grandTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="col-span-1 text-xs text-rose-600 hover:bg-rose-50"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenPayment}
                disabled={cart.length === 0}
                className="col-span-2 shadow-glow-blue font-bold text-xs"
              >
                Pay Now (F9)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 0: PRODUCT SPECIFICATIONS & DETAILS QUICK VIEW */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Product Specifications & Details"
        description={
          detailsProduct
            ? `SKU: ${detailsProduct.sku} • Barcode: ${detailsProduct.barcode || 'N/A'}`
            : ''
        }
        maxWidth="2xl"
      >
        {detailsProduct && (
          <div className="space-y-4">
            {/* Top Identity Card */}
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-200 dark:border-dark-border">
              {/* Image Preview */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                {detailsProduct.image ? (
                  <img
                    src={detailsProduct.image}
                    alt={detailsProduct.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex'
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center text-slate-400 ${
                    detailsProduct.image ? 'hidden' : 'flex'
                  }`}
                >
                  <Package className="w-10 h-10" />
                </div>
              </div>

              {/* Product Info & Specs */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detailsProduct.brand && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Brand: {detailsProduct.brand}
                    </span>
                  )}
                  {detailsProduct.brandCountry && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Country: {detailsProduct.brandCountry}
                    </span>
                  )}
                  {detailsProduct.category && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border text-xs font-medium">
                      Category: {detailsProduct.category}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {detailsProduct.name}
                </h3>

                {detailsProduct.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {detailsProduct.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Storage Bin:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailsProduct.location || 'Store Floor'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Stock Level:{' '}
                    <strong
                      className={
                        detailsProduct.availableStock <= detailsProduct.reorderLevel
                          ? 'text-amber-600 font-bold'
                          : 'text-emerald-600 font-bold'
                      }
                    >
                      {detailsProduct.availableStock} Units In Stock
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tracking:{' '}
                    <strong>
                      {detailsProduct.isSerialized ? 'Serialized IMEI' : 'Quantity Count'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Warranty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Retail Selling Price */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                  Retail Selling Price
                </span>
                <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                  {formatLKR(detailsProduct.retailPrice)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Official customer retail price
                </span>
              </div>

              {/* Min Floor Price */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Min Selling Floor
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                  {detailsProduct.minPrice
                    ? formatLKR(detailsProduct.minPrice)
                    : 'No Minimum Floor'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Maximum allowed cashier discount
                </span>
              </div>

              {/* Hardware Warranty */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Official Warranty
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  {detailsProduct.defaultWarrantyMonths || 0} Months
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Full Store Hardware Warranty
                </span>
              </div>
            </div>

            {/* Serialized Devices / IMEI Selector (If Serialized Phone) */}
            {detailsProduct.isSerialized ? (
              <div className="space-y-2 border-t border-slate-200 dark:border-dark-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ScanLine className="w-4 h-4 text-purpleAccent-500" />
                    Available In-Stock IMEI Units ({detailsProduct.availableDevices?.length || 0})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click to select device(s)
                  </span>
                </div>

                {detailsProduct.availableDevices?.length === 0 ? (
                  <p className="text-xs text-rose-600 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 text-center font-semibold">
                    No IMEI devices available in stock for this product.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-dark-border rounded-xl p-2 bg-slate-50/50 dark:bg-dark-surface/40">
                    {detailsProduct.availableDevices?.map((dev) => {
                      const isSelected = detailsSelectedImeis.some((d) => d.id === dev.id)
                      return (
                        <div
                          key={dev.id}
                          onClick={() => {
                            if (isSelected) {
                              setDetailsSelectedImeis((prev) =>
                                prev.filter((d) => d.id !== dev.id)
                              )
                            } else {
                              setDetailsSelectedImeis((prev) => [...prev, dev])
                            }
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-white shadow-2xs'
                              : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected
                                  ? 'bg-brand-600 border-brand-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                IMEI: {dev.imei1}
                              </span>
                              {dev.imei2 && (
                                <span className="text-[10px] text-slate-400 font-mono ml-2">
                                  SIM2: {dev.imei2}
                                </span>
                              )}
                              <div className="text-[10px] text-slate-500">
                                {dev.storage ? `${dev.storage} • ` : ''}
                                {dev.color || 'Standard Color'}
                                {dev.serialNumber ? ` • S/N: ${dev.serialNumber}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                              {formatLKR(dev.sellingPrice || detailsProduct.retailPrice)}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              Ready
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Non-Serialized Quantity Selector */
              <div className="border-t border-slate-200 dark:border-dark-border pt-3 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                    Quantity to Add
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Available in stock: <strong>{detailsProduct.availableStock}</strong> units
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailsQty((q) => Math.max(1, q - 1))}
                    disabled={detailsQty <= 1}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={detailsProduct.availableStock}
                    value={detailsQty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1
                      setDetailsQty(Math.min(detailsProduct.availableStock, Math.max(1, v)))
                    }}
                    className="w-16 text-center font-bold text-sm py-1 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsQty((q) => Math.min(detailsProduct.availableStock, q + 1))
                    }
                    disabled={detailsQty >= detailsProduct.availableStock}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-dark-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddFromDetails}
                disabled={
                  detailsProduct.availableStock <= 0 ||
                  (detailsProduct.isSerialized && detailsSelectedImeis.length === 0)
                }
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                {detailsProduct.isSerialized
                  ? `Add ${
                      detailsSelectedImeis.length > 0
                        ? `${detailsSelectedImeis.length} Unit(s)`
                        : ''
                    } to Cart • ${formatLKR(
                      detailsProduct.retailPrice * (detailsSelectedImeis.length || 1)
                    )}`
                  : `Add ${detailsQty} Unit(s) to Cart • ${formatLKR(
                      detailsProduct.retailPrice * detailsQty
                    )}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 1: SERIALIZED PHONE IMEI PICKER */}
      <Modal
        isOpen={isImeiModalOpen}
        onClose={() => setIsImeiModalOpen(false)}
        title="Select In-Stock Phone IMEI"
        description={`Model: ${targetSerializedProduct?.name || ''}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            This smartphone requires assigning a specific unique IMEI. Select the unit from the shelf:
          </p>

          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-xl p-2 border-slate-200 dark:border-dark-border">
            {targetSerializedProduct?.availableDevices?.length === 0 ? (
              <p className="text-xs text-rose-600 p-4 text-center">No units currently available in stock.</p>
            ) : (
              targetSerializedProduct?.availableDevices?.map((dev) => {
                const isSelected = selectedImeiDevices.some((d) => d.id === dev.id)
                return (
                  <div
                    key={dev.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedImeiDevices((prev) => prev.filter((d) => d.id !== dev.id))
                      } else {
                        setSelectedImeiDevices([dev]) // Single unit select per click
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface'
                    }`}
                  >
                    <div>
                      <code className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        {dev.imei1}
                      </code>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {dev.storage || ''} {dev.color || ''}
                      </span>
                    </div>
                    <Badge variant={isSelected ? 'primary' : 'success'} size="sm">
                      {isSelected ? 'Selected' : 'Available'}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" onClick={() => setIsImeiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedImeiDevices.length === 0}
              onClick={handleConfirmImeiSelection}
            >
              Add Selected IMEI to Cart
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: PAYMENT & TENDER DIALOG */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="POS Payment & Checkout"
        description={`Invoice Total: ${formatLKR(grandTotal)}`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessCheckout} className="space-y-4">
          {checkoutError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
              {checkoutError}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'BANK_TRANSFER', label: 'Bank', icon: Building },
              { id: 'SPLIT', label: 'Split', icon: Split },
            ].map((m) => {
              const Icon = m.icon
              const isSelected = paymentMethod === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
                      : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* Cash Details */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3">
              <Input
                label="Cash Tendered (LKR)"
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                required
              />

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[grandTotal, 5000, 10000, 50000, 100000].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashTendered(String(amt))}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface"
                  >
                    {idx === 0 ? 'Exact' : formatLKR(amt, false)}
                  </button>
                ))}
              </div>

              {Number(cashTendered) > grandTotal && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex justify-between text-xs font-bold">
                  <span>Change to Return:</span>
                  <span>{formatLKR(Number(cashTendered) - grandTotal)}</span>
                </div>
              )}
            </div>
          )}

          {/* Card Details */}
          {paymentMethod === 'CARD' && (
            <Input
              label="Card Last 4 Digits (Optional)"
              maxLength={4}
              value={cardLastFour}
              onChange={(e) => setCardLastFour(e.target.value)}
              placeholder="e.g. 4829"
            />
          )}

          {/* Bank Transfer Details */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <Input
              label="Bank Reference / Approval Code"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="e.g. COMM-TR-908129"
            />
          )}

          {/* Split Payment Details */}
          {paymentMethod === 'SPLIT' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Split Tenders (Must total {formatLKR(grandTotal)})
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Cash Amount</label>
                  <input
                    type="number"
                    placeholder="0"
                    onChange={(e) => {
                      const cashVal = Number(e.target.value) || 0
                      const cardVal = Math.max(0, grandTotal - cashVal)
                      setSplitPayments([
                        { method: 'CASH', amount: cashVal },
                        { method: 'CARD', amount: cardVal },
                      ])
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-dark-border"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Card Amount</label>
                  <input
                    type="number"
                    value={splitPayments.find((p) => p.method === 'CARD')?.amount || ''}
                    readOnly
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-surface font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isCheckingOut} className="font-bold">
              Complete Sale & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: INVOICE & RECEIPT DISPLAY */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Transaction Completed"
        description={`Invoice #${completedSale?.invoiceNumber || ''}`}
        maxWidth="4xl"
      >
        <ThermalReceipt sale={completedSale} onClose={() => setIsReceiptOpen(false)} />
      </Modal>

      {/* MODAL 4: QUICK CUSTOMER REGISTRATION */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Register Customer to Active Bill"
        description="Attach customer profile to this invoice for digital bill SMS dispatch, warranty certification, and sales history."
        maxWidth="md"
      >
        <form onSubmit={handleQuickCustomerSubmit} className="space-y-3.5">
          {/* Information Notice */}
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Official Hotline: 0713857835.</strong> Customer mobile number will receive the digital invoice and warranty message via normal SMS text message. NIC is optional for walk-in customers.
            </div>
          </div>

          <Input
            label="Customer Full Name *"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            placeholder="e.g. Kasun Jayasuriya"
            required
            autoFocus
          />

          <Input
            label="Customer Mobile Number * (Normal SMS Delivery)"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
            placeholder="e.g. 0771234567 or 0713857835"
            required
          />

          <Input
            label="NIC / National ID (Optional — Leave blank if walk-in)"
            value={custNic}
            onChange={(e) => setCustNic(e.target.value)}
            placeholder="e.g. 19982341234V (Optional)"
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            value={custEmail}
            onChange={(e) => setCustEmail(e.target.value)}
            placeholder="kasun@gmail.com"
          />

          <Input
            label="Address / City (Optional)"
            value={custAddress}
            onChange={(e) => setCustAddress(e.target.value)}
            placeholder="e.g. Colombo 03, Kandy, Galle"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsCustomerModalOpen(false)
                setCustName('')
                setCustPhone('')
                setCustEmail('')
                setCustNic('')
                setCustAddress('')
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={custSubmitting} className="font-bold">
              Save & Link Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
