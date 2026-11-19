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
  ArrowLeftRight,
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
  ArrowRight,
  Zap,
  Star,
  MessageSquare,
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
import { cn } from '@/utils/cn'

// Sri Lankan Mobile Operator Detection Helper
const getSriLankanCarrier = (phone) => {
  if (!phone) return null
  const clean = String(phone).replace(/\D/g, '')
  let prefix = ''
  if (clean.startsWith('94') && clean.length >= 4) {
    prefix = '0' + clean.slice(2, 4)
  } else if (clean.startsWith('0') && clean.length >= 3) {
    prefix = clean.slice(0, 3)
  } else if (clean.length >= 2 && !clean.startsWith('0')) {
    prefix = '0' + clean.slice(0, 2)
  }

  if (['077', '076', '074'].includes(prefix)) {
    return { name: 'Dialog', brand: 'Dialog 4G', badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900', ring: 'ring-red-400' }
  }
  if (['071', '070'].includes(prefix)) {
    return { name: 'Mobitel', brand: 'Mobitel 4G', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900', ring: 'ring-blue-400' }
  }
  if (['078', '072'].includes(prefix)) {
    return { name: 'Hutch', brand: 'Hutch 4G', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900', ring: 'ring-orange-400' }
  }
  if (['075'].includes(prefix)) {
    return { name: 'Airtel', brand: 'Airtel 4G', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900', ring: 'ring-rose-400' }
  }
  return null
}

const getCustomerInitials = (name) => {
  if (!name || !name.trim()) return 'CU'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatSLPhone = (phone) => {
  if (!phone) return '07X XXX XXXX'
  const clean = String(phone).replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`
}

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

  // Trade-In Exchange State
  const [tradeInItem, setTradeInItem] = useState(null)
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false)
  const [tradeInBrand, setTradeInBrand] = useState('Apple')
  const [tradeInModel, setTradeInModel] = useState('')
  const [tradeInStorage, setTradeInStorage] = useState('128GB')
  const [tradeInColor, setTradeInColor] = useState('')
  const [tradeInImei, setTradeInImei] = useState('')
  const [tradeInGrade, setTradeInGrade] = useState('GRADE_B')
  const [tradeInBattery, setTradeInBattery] = useState('85')
  const [tradeInScreen, setTradeInScreen] = useState('FLAWLESS')
  const [tradeInValue, setTradeInValue] = useState('')
  const [tradeInNotes, setTradeInNotes] = useState('')

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Mobile POS Responsive Tab Switcher ('products' | 'cart')
  const [mobileTab, setMobileTab] = useState('products')

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
    if (cart.length === 0 && !tradeInItem) return
    if (window.confirm('Clear all items and trade-in from the current cart?')) {
      setCart([])
      setInvoiceDiscount(0)
      setSelectedCustomer(null)
      setTradeInItem(null)
    }
  }

  // Trade-In Device Submission
  const handleSaveTradeIn = (e) => {
    e.preventDefault()
    if (!tradeInModel.trim()) {
      showToast('Please enter the device model')
      return
    }
    if (!tradeInImei.trim() || tradeInImei.trim().length < 7) {
      showToast('Please enter a valid IMEI number (at least 7 characters)')
      return
    }
    const val = Number(tradeInValue) || 0
    if (val <= 0) {
      showToast('Please enter a valid approved trade-in value')
      return
    }

    setTradeInItem({
      brand: tradeInBrand.trim(),
      modelName: tradeInModel.trim(),
      storage: tradeInStorage.trim() || undefined,
      color: tradeInColor.trim() || undefined,
      imei1: tradeInImei.trim(),
      conditionGrade: tradeInGrade,
      batteryHealth: Number(tradeInBattery) || undefined,
      screenCondition: tradeInScreen,
      tradeInValue: val,
      notes: tradeInNotes.trim() || undefined,
      defectsSummary: tradeInNotes.trim() || undefined,
    })
    setIsTradeInModalOpen(false)
    showToast(`Trade-In allowance applied: Rs. ${val.toLocaleString()}`)
  }

  // Cart Totals Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - (Number(item.discount) || 0),
    0
  )
  const tradeInAllowance = tradeInItem ? Number(tradeInItem.tradeInValue) || 0 : 0
  const grandTotal = Math.max(0, cartSubtotal - Number(invoiceDiscount) + Number(invoiceTax) - tradeInAllowance)

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
        tradeIn: tradeInItem
          ? {
              brand: tradeInItem.brand,
              modelName: tradeInItem.modelName,
              storage: tradeInItem.storage,
              color: tradeInItem.color,
              imei1: tradeInItem.imei1,
              conditionGrade: tradeInItem.conditionGrade,
              batteryHealth: tradeInItem.batteryHealth,
              screenCondition: tradeInItem.screenCondition,
              defectsSummary: tradeInItem.defectsSummary,
              tradeInValue: Number(tradeInItem.tradeInValue),
              notes: tradeInItem.notes,
            }
          : undefined,
      }

      const res = await posAPI.checkout(payload)
      const sale = res.data?.data

      // Success: clear cart, show receipt modal
      setCompletedSale(sale)
      setCart([])
      setInvoiceDiscount(0)
      setSelectedCustomer(null)
      setTradeInItem(null)
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
    <div className="h-[calc(100dvh-5rem)] min-h-[500px] lg:h-[calc(100vh-5.5rem)] flex flex-col space-y-2.5 pb-1 min-h-0">
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

      {/* Mobile Mode Switcher Bar (< lg) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shrink-0 gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'products'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products Catalog ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart & Checkout ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          {(cart.length > 0 || tradeInItem) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          )}
        </button>
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
        <div
          className={cn(
            'lg:col-span-6 flex-col space-y-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border min-h-0 shadow-sm',
            mobileTab === 'products' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
          )}
        >
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

          {/* Mobile & Tablet Category Horizontal Scroll (< lg) */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300'
              }`}
            >
              All Departments
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300'
                }`}
              >
                {c.name}
              </button>
            ))}
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
        <div
          className={cn(
            'lg:col-span-4 flex-col bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200 dark:border-dark-border min-h-0 shadow-sm',
            mobileTab === 'cart' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
          )}
        >
          {/* Customer Selection & Profile Hub */}
          <div className="pb-3 border-b border-slate-100 dark:border-dark-border shrink-0 space-y-2">
            {/* Creative Customer Header Bar */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-50/80 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('products')}
                  className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-dark-card flex items-center gap-1 text-xs font-bold shrink-0 transition-colors shadow-2xs"
                  title="Return to products catalog"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Catalog</span>
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-600 to-purpleAccent-600 text-white flex items-center justify-center shadow-xs shrink-0 ring-2 ring-brand-500/20">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        Customer & Digital Bill
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Sparkles className="w-2.5 h-2.5 text-blue-500" /> SMS e-Bill
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      Auto-SMS from <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">0713857835</span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedCustomer ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Linked
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null)
                      setCustomerSearch('')
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-dark-card transition-colors"
                    title="Unlink and switch to Walk-in customer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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
                  className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white text-xs font-extrabold shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                  <span>+ New Customer</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-200"></span>
                  </span>
                </button>
              )}
            </div>

            {selectedCustomer ? (
              /* SELECTED CUSTOMER PROFILE CARD */
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900/60 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purpleAccent-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm ring-2 ring-blue-400/40">
                        {getCustomerInitials(selectedCustomer.name)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-card animate-pulse" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {selectedCustomer.name}
                        </span>
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md bg-blue-600 text-white shadow-2xs">
                          {selectedCustomer.loyaltyTier || 'STANDARD'}
                        </span>
                        {getSriLankanCarrier(selectedCustomer.phone) && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getSriLankanCarrier(selectedCustomer.phone).badge}`}>
                            {getSriLankanCarrier(selectedCustomer.phone).brand}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <Phone className="w-3 h-3 text-brand-500" />
                          {formatSLPhone(selectedCustomer.phone)}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> SMS Linked
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null)
                      setCustomerSearch('')
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-dark-surface transition-colors"
                    title="Unlink and switch to Walk-in customer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {selectedCustomer.nic ? (
                      <span className="px-1.5 py-0.5 rounded bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border font-mono font-bold text-slate-700 dark:text-slate-300">
                        NIC: {selectedCustomer.nic}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        Walk-in (No NIC)
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> SMS Sender: 0713857835
                  </span>
                </div>
              </div>
            ) : (
              /* CUSTOMER SEARCH & SELECTION (WALK-IN MODE) */
              <div className="space-y-1.5">
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
                      className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                      {/* Default Walk-in Option */}
                      <div
                        onClick={() => {
                          setSelectedCustomer(null)
                          setIsCustomerDropdownOpen(false)
                        }}
                        className="p-2.5 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-dark-surface flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            WI
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              Walk-in Customer (Cash)
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Standard anonymous receipt • No phone registered
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded">Default</span>
                      </div>

                      {/* Filtered Customer Matches */}
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((c) => {
                          const carrier = getSriLankanCarrier(c.phone)
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c)
                                setIsCustomerDropdownOpen(false)
                                setCustomerSearch('')
                                showToast(`Selected customer ${c.name}`)
                              }}
                              className="p-2.5 border-b border-slate-100 dark:border-dark-border hover:bg-blue-50/60 dark:hover:bg-blue-950/30 cursor-pointer flex items-center justify-between transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                                  {c.name ? c.name[0].toUpperCase() : 'C'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {c.name}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                      {c.loyaltyTier || 'STANDARD'}
                                    </span>
                                    {carrier && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${carrier.badge}`}>
                                        {carrier.name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                    <span>{formatSLPhone(c.phone)}</span>
                                    {c.nic && (
                                      <span className="text-[10px] text-slate-400">NIC: {c.nic}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                                Select →
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-3.5 bg-gradient-to-b from-slate-50 to-blue-50/40 dark:from-dark-surface dark:to-blue-950/30 text-center">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            No customer found matching "{customerSearch}"
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs mx-auto">
                            Customer at the counter? Fast register and link digital bill in 5 seconds.
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
                            className="mt-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Register "{customerSearch}" Now</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 1-Tap Sri Lankan Mobile Prefix Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-500" /> 1-Tap:
                  </span>
                  {[
                    { prefix: '077', carrier: 'Dialog', color: 'hover:border-red-400 hover:text-red-600' },
                    { prefix: '071', carrier: 'Mobitel', color: 'hover:border-blue-400 hover:text-blue-600' },
                    { prefix: '076', carrier: 'Dialog', color: 'hover:border-red-400 hover:text-red-600' },
                    { prefix: '078', carrier: 'Hutch', color: 'hover:border-orange-400 hover:text-orange-600' },
                    { prefix: '075', carrier: 'Airtel', color: 'hover:border-rose-400 hover:text-rose-600' },
                    { prefix: '070', carrier: 'Mobitel', color: 'hover:border-blue-400 hover:text-blue-600' },
                  ].map((item) => (
                    <button
                      key={item.prefix}
                      type="button"
                      onClick={() => {
                        setCustPhone(item.prefix)
                        setCustName('')
                        setIsCustomerModalOpen(true)
                      }}
                      className={`px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border font-mono font-bold shrink-0 transition-all ${item.color} active:scale-95`}
                      title={`Fast register customer with prefix ${item.prefix} (${item.carrier})`}
                    >
                      {item.prefix}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Scrollable Body: Items + Trade-In (Everything inside so it never clips!) */}
          <div className="flex-1 overflow-y-auto py-2 space-y-2.5 min-h-0 pr-1">
            {cart.length === 0 ? (
              <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center text-slate-400">
                <ShoppingBag className="w-9 h-9 mb-1.5 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cart is currently empty</p>
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

            {/* Creative Interactive Trade-In / Exchange Section (Inside the scroll area!) */}
            {!tradeInItem ? (
              <div
                onClick={() => setIsTradeInModalOpen(true)}
                className="my-1.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/20 border-2 border-dashed border-emerald-400/90 dark:border-emerald-600/70 hover:border-emerald-500 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden select-none"
              >
                {/* Background ambient glow effect */}
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

                <div className="flex items-center justify-between gap-2.5 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                      <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                          Customer Device Trade-In
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                          Exchange Credit
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Customer trading in an old phone? Apply instant discount
                      </p>
                    </div>
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 shrink-0 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Phone</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Traded-In Device Card */
              <div className="my-1.5 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-amber-500/10 border-2 border-emerald-500 dark:border-emerald-600 shadow-sm relative overflow-hidden animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-200/90 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-mono">
                          {tradeInItem.brand}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {tradeInItem.modelName}
                        </h4>
                        {tradeInItem.storage && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            ({tradeInItem.storage} {tradeInItem.color || ''})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-600 dark:text-slate-400 flex-wrap">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          IMEI: {tradeInItem.imei1}
                        </span>
                        {tradeInItem.batteryHealth && (
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 px-1 rounded text-[9.5px]">
                            ⚡ {tradeInItem.batteryHealth}%
                          </span>
                        )}
                        <span className="text-[9.5px] px-1 py-0.2 rounded bg-slate-200 dark:bg-dark-card text-slate-800 dark:text-slate-200 font-bold uppercase">
                          {tradeInItem.conditionGrade?.replace('GRADE_', 'Grade ') || 'Good'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      -{formatLKR(tradeInAllowance, false)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsTradeInModalOpen(true)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Edit Device Details or Valuation"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeInItem(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove Trade-In"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Micro-Badge */}
                <div className="mt-2 pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Instant Trade-In credit deducted from bill
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-emerald-900 dark:text-emerald-200">
                    VERIFIED & UNLOCKED
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout (Pinned Cleanly at the Bottom) */}
          <div className="pt-2 border-t border-slate-200 dark:border-dark-border shrink-0 space-y-2 bg-white dark:bg-dark-card">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatLKR(cartSubtotal)}</span>
              </div>
              {tradeInItem && (
                <div className="flex items-center justify-between font-bold text-xs p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
                    Trade-In Credit ({tradeInItem.brand} {tradeInItem.modelName}):
                  </span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                    -{formatLKR(tradeInAllowance)}
                  </span>
                </div>
              )}
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
              <div className="flex justify-between items-baseline text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t-2 border-slate-200 dark:border-dark-border">
                <div>
                  <span className="block text-xs uppercase text-slate-500 dark:text-slate-400">Total Payable</span>
                  {tradeInItem && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Saved {formatLKR(tradeInAllowance, false)} on exchange!
                    </span>
                  )}
                </div>
                <span className="text-lg font-mono font-black text-brand-600 dark:text-brand-400">
                  {formatLKR(grandTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                disabled={cart.length === 0 && !tradeInItem}
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

      {/* Floating Bottom Bar for Mobile (< lg) when browsing catalog */}
      {mobileTab === 'products' && (cart.length > 0 || tradeInItem) && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700/80 animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-glow-blue">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">
                {cart.reduce((s, i) => s + i.quantity, 0)} Items {tradeInItem ? '+ 1 Trade-In' : ''}
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono block">
                {formatLKR(grandTotal)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>View Cart & Pay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

          {/* Trade-In Allowance Breakdown (if applied) */}
          {tradeInItem && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-1.5 truncate">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Exchange: {tradeInItem.brand} {tradeInItem.modelName}</span>
                </span>
                <span className="shrink-0">- {formatLKR(tradeInAllowance, false)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 dark:text-emerald-400 pt-0.5 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span>Items Subtotal: {formatLKR(cartSubtotal, false)}</span>
                <span className="font-bold text-emerald-900 dark:text-emerald-200">Net Remaining: {formatLKR(grandTotal, false)}</span>
              </div>
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

      {/* MODAL 4: CREATIVE QUICK CUSTOMER REGISTRATION & DIGITAL BILL PASS */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Register Customer & Digital Bill Pass"
        description="Instant cellular SMS e-Bill dispatch (0713857835), warranty certification, and customer loyalty profile."
        maxWidth="lg"
      >
        <form onSubmit={handleQuickCustomerSubmit} className="space-y-4 pt-1">
          {/* Hero: Interactive Live Virtual Customer Pass Preview */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-4 border border-indigo-500/30 shadow-xl">
            {/* Ambient Glows */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Pass Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  NexaPOS Digital Customer Pass
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-amber-300" /> Standard Tier
              </span>
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purpleAccent-600 text-white font-black text-base flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  {getCustomerInitials(custName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white truncate">
                  {custName.trim() || 'Enter Customer Full Name...'}
                </h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    {formatSLPhone(custPhone)}
                  </span>
                  {getSriLankanCarrier(custPhone) ? (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${getSriLankanCarrier(custPhone).badge}`}>
                      ● {getSriLankanCarrier(custPhone).brand}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Sri Lankan Mobile (+94)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Pass Details */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] relative z-10 text-slate-300">
              <span className="flex items-center gap-1 text-[10px] text-slate-300">
                NIC: <strong className="font-mono text-white">{custNic.trim() || 'Walk-in (None)'}</strong>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-SMS Sender: 0713857835
              </span>
            </div>
          </div>

          {/* Simulated Live SMS Bubble */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs">
            <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-brand-600" />
                Live SMS Preview (To Customer's Mobile):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Normal Cellular SMS</span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
              "NexaPOS: Dear {custName.trim() || 'Customer'}, thank you! Invoice #INV-... for Rs. {grandTotal > 0 ? grandTotal.toLocaleString() : '0.00'} is confirmed. Warranty cert active. Inquiries: 0713857835. www.nexapos.lk"
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <Input
              label="Customer Full Name *"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Kasun Jayasuriya"
              required
              autoFocus
            />

            {/* Mobile Number with 1-Tap Sri Lankan Prefix Row */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  Customer Mobile Number * (Normal SMS Delivery)
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-semibold hidden sm:inline">1-Tap Prefix:</span>
                  {[
                    { prefix: '077', label: '077 Dialog' },
                    { prefix: '071', label: '071 Mobitel' },
                    { prefix: '076', label: '076 Dialog' },
                    { prefix: '078', label: '078 Hutch' },
                    { prefix: '075', label: '075 Airtel' },
                    { prefix: '070', label: '070 Mobitel' },
                  ].map((item) => (
                    <button
                      key={item.prefix}
                      type="button"
                      onClick={() => {
                        const currentDigits = custPhone.replace(/\D/g, '')
                        const rest = currentDigits.length >= 3 ? currentDigits.slice(3) : ''
                        setCustPhone(item.prefix + rest)
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-brand-50 dark:bg-dark-surface dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-600 border border-slate-200 dark:border-dark-border font-mono font-bold text-[10px] transition-colors"
                    >
                      {item.prefix}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="e.g. 0771234567 or 0713857835"
                required
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Delivered via standard cellular SMS (Strictly NO WhatsApp)</span>
                <span className="font-mono">
                  {custPhone.replace(/\D/g, '').length}/10 digits
                  {custPhone.replace(/\D/g, '').length === 10 && (
                    <span className="text-emerald-500 font-bold ml-1">✓ Valid</span>
                  )}
                </span>
              </div>
            </div>

            {/* NIC & Email in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="NIC / National ID (Optional for Walk-ins)"
                  value={custNic}
                  onChange={(e) => setCustNic(e.target.value)}
                  placeholder="e.g. 19982341234V (Optional)"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Optional for standard sales, recommended for Trade-Ins
                </span>
              </div>
              <div>
                <Input
                  label="Email Address (Optional)"
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="kasun@gmail.com"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Optional backup for PDF invoices
                </span>
              </div>
            </div>

            {/* City / Address with 1-click popular city chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Address / City (Optional)
                </label>
                <div className="flex items-center gap-1 text-[10px] overflow-x-auto no-scrollbar">
                  {['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Negombo', 'Jaffna'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setCustAddress(city)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="e.g. Colombo 03, Kandy, Galle..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
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
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={custSubmitting}
              className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 text-white font-extrabold shadow-md flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Save & Link Customer</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: DEVICE TRADE-IN & UPGRADE EVALUATION */}
      <Modal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        title="Device Trade-In & Upgrade Evaluation"
        description="Inspect customer's pre-owned smartphone and apply approved trade-in credit directly against this sale."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTradeIn} className="space-y-4">
          {/* Information & Live Upgrade Calculator Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  Instant Bill Credit Offset
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Approved valuation is deducted directly from customer's cart total
                </span>
              </div>
            </div>

            {cartSubtotal > 0 && (
              <div className="bg-white/90 dark:bg-dark-surface px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700/60 text-right shrink-0">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                  Customer Remaining Balance
                </span>
                <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono">
                  {formatLKR(Math.max(0, cartSubtotal - (Number(tradeInValue) || 0)))}
                </span>
              </div>
            )}
          </div>

          {/* Quick Brand Selector Pills */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Device Brand *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                { name: 'Apple', label: ' Apple' },
                { name: 'Samsung', label: 'Samsung' },
                { name: 'Xiaomi', label: 'Xiaomi' },
                { name: 'Google Pixel', label: 'Google Pixel' },
                { name: 'OnePlus', label: 'OnePlus' },
                { name: 'Huawei', label: 'Huawei' },
                { name: 'Oppo / Vivo', label: 'Oppo / Vivo' },
                { name: 'Other', label: 'Other' },
              ].map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setTradeInBrand(b.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tradeInBrand === b.name
                      ? 'bg-brand-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-dark-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <Input
              label="Model Name *"
              value={tradeInModel}
              onChange={(e) => setTradeInModel(e.target.value)}
              placeholder="e.g. iPhone 11, Galaxy S21 Ultra, Redmi Note 13"
              required
            />
          </div>

          {/* Storage, Color & Primary IMEI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Storage (Capacity)"
              value={tradeInStorage}
              onChange={(e) => setTradeInStorage(e.target.value)}
              placeholder="e.g. 64GB, 128GB, 256GB"
            />
            <Input
              label="Device Color"
              value={tradeInColor}
              onChange={(e) => setTradeInColor(e.target.value)}
              placeholder="e.g. Space Black, Silver"
            />
            <Input
              label="Primary IMEI *"
              value={tradeInImei}
              onChange={(e) => setTradeInImei(e.target.value)}
              placeholder="e.g. 358912345678901"
              required
            />
          </div>

          {/* Visual Condition Diagnostic Grade Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Condition Diagnostic Grade *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'GRADE_A_PLUS', label: 'Grade A+', desc: 'Mint / Like New', color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100' },
                { id: 'GRADE_A', label: 'Grade A', desc: 'Micro-scratches', color: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100' },
                { id: 'GRADE_B', label: 'Grade B', desc: 'Normal Light Wear', color: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100' },
                { id: 'GRADE_C', label: 'Grade C', desc: 'Visible Scuffs', color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100' },
                { id: 'FAULTY', label: 'Faulty', desc: 'Cracked / For Parts', color: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setTradeInGrade(g.id)}
                  className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                    tradeInGrade === g.id
                      ? `${g.color} shadow-xs font-bold ring-2 ring-brand-500/30 scale-[1.02]`
                      : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">{g.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Battery Health & Screen Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Battery Health % (e.g. 85)"
              type="number"
              min="1"
              max="100"
              value={tradeInBattery}
              onChange={(e) => setTradeInBattery(e.target.value)}
              placeholder="e.g. 84"
            />
            <Select
              label="Screen Condition"
              value={tradeInScreen}
              onChange={(e) => setTradeInScreen(e.target.value)}
              options={[
                { value: 'FLAWLESS', label: 'Flawless / Pristine (No Scratches)' },
                { value: 'LIGHT_SCRATCHES', label: 'Light Hairline Scratches' },
                { value: 'HEAVY_SCRATCHES', label: 'Deep / Heavy Scratches' },
                { value: 'CRACKED_GLASS', label: 'Cracked Glass / Display Lines' },
              ]}
            />
          </div>

          {/* Approved Valuation & Defect Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border space-y-2.5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Approved Trade-In Value (LKR) *
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick chips:</span>
                  {[25000, 45000, 65000, 85000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTradeInValue(String(amt))}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
              <Input
                type="number"
                min="1"
                value={tradeInValue}
                onChange={(e) => setTradeInValue(e.target.value)}
                placeholder="e.g. 45000"
                required
              />
            </div>

            <Input
              label="Defects Summary / Inspection Notes"
              value={tradeInNotes}
              onChange={(e) => setTradeInNotes(e.target.value)}
              placeholder="e.g. Back scuffed, screen clean, iCloud/Google unlinked & reset"
            />

            <div className="pt-2 text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Customer certifies legal ownership. Device unlocked and wiped for inventory intake.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTradeInModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-bold flex items-center gap-1.5 shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Apply Trade-In to Cart</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
