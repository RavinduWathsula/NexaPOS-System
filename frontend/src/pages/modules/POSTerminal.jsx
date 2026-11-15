import React, { useState, useEffect, useRef } from 'react'
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
  const [invoiceDiscount, setInvoiceDiscount] = useState(0)
  const [invoiceTax, setInvoiceTax] = useState(0)

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

  // Product Card Click
  const handleProductClick = (product) => {
    if (product.availableStock <= 0) {
      setErrorMsg(`'${product.name}' is currently out of stock.`)
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }

    if (product.isSerialized) {
      // Serialized product: open IMEI selection modal
      setTargetSerializedProduct(product)
      setSelectedImeiDevices([])
      setIsImeiModalOpen(true)
    } else {
      // Non-serialized item: add or increment quantity
      addNonSerializedToCart(product)
    }
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
      setSelectedCustomer(newCust)
      setIsCustomerModalOpen(false)
      setCustName('')
      setCustPhone('')
      showToast(`Customer ${newCust.name} selected`)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create customer.')
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
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-card flex items-center justify-center mb-2">
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
                            className="w-full h-full object-cover"
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
                      </div>

                      {/* Info */}
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {p.sku}
                        </span>
                      </div>

                      {/* Stock & Price */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatLKR(p.retailPrice)}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
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
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Shopping Cart & Checkout (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border min-h-0 shadow-sm">
          {/* Customer Selection */}
          <div className="pb-3 border-b border-slate-100 dark:border-dark-border shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                Customer
              </span>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-[10px] font-bold text-brand-600 hover:underline"
              >
                + Quick Add
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCustomer ? selectedCustomer.id : ''}
                onChange={(e) => {
                  const found = customers.find((c) => c.id === e.target.value)
                  setSelectedCustomer(found || null)
                }}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface"
              >
                <option value="">Walk-in Customer (Cash)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                  title="Remove customer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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
        title="Quick Customer Registration"
        description="Register a new customer for warranty tracking and loyalty points."
        maxWidth="md"
      >
        <form onSubmit={handleQuickCustomerSubmit} className="space-y-3">
          <Input
            label="Customer Full Name"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            placeholder="e.g. Nadeeka Senanayake"
            required
          />
          <Input
            label="Phone Number"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
            placeholder="e.g. 0771234567"
            required
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            value={custEmail}
            onChange={(e) => setCustEmail(e.target.value)}
            placeholder="nadeeka@gmail.com"
          />
          <Input
            label="NIC / National ID (Optional)"
            value={custNic}
            onChange={(e) => setCustNic(e.target.value)}
            placeholder="e.g. 199028192831"
          />
          <Input
            label="Address (Optional)"
            value={custAddress}
            onChange={(e) => setCustAddress(e.target.value)}
            placeholder="Colombo 05"
          />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={custSubmitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
