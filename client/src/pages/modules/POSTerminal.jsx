import React, { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'

// Sample products for POS fast billing
const SAMPLE_POS_PRODUCTS = [
  {
    id: 'pos_p1',
    name: 'Apple iPhone 15 Pro',
    category: 'Smartphones',
    price: 435000,
    stock: 8,
    isSerialized: true,
    imeiSample: '354892019482910',
    image: '📱',
  },
  {
    id: 'pos_p2',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Smartphones',
    price: 465000,
    stock: 5,
    isSerialized: true,
    imeiSample: '357281098231902',
    image: '📱',
  },
  {
    id: 'pos_p3',
    name: 'Xiaomi Redmi Note 13',
    category: 'Smartphones',
    price: 78000,
    stock: 14,
    isSerialized: true,
    imeiSample: '861928374619283',
    image: '📱',
  },
  {
    id: 'pos_p4',
    name: 'Apple 20W USB-C Adapter',
    category: 'Charging',
    price: 8500,
    stock: 42,
    isSerialized: false,
    image: '🔌',
  },
  {
    id: 'pos_p5',
    name: 'Anker PowerCore 20K Powerbank',
    category: 'Charging',
    price: 19500,
    stock: 18,
    isSerialized: false,
    image: '🔋',
  },
  {
    id: 'pos_p6',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Audio',
    price: 135000,
    stock: 3,
    isSerialized: true,
    imeiSample: 'SN-SNY-9982103',
    image: '🎧',
  },
  {
    id: 'pos_p7',
    name: 'Apple AirPods Pro (Gen 2)',
    category: 'Audio',
    price: 84000,
    stock: 12,
    isSerialized: true,
    imeiSample: 'SN-APP-7712391',
    image: '🎧',
  },
  {
    id: 'pos_p8',
    name: 'Spigen Ultra Hybrid Clear Case',
    category: 'Protection',
    price: 6500,
    stock: 35,
    isSerialized: false,
    image: '🛡️',
  },
]

const CATEGORIES = ['All Products', 'Smartphones', 'Audio', 'Charging', 'Protection']

export function POSTerminal() {
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([
    {
      ...SAMPLE_POS_PRODUCTS[0],
      cartQty: 1,
      selectedIMEI: SAMPLE_POS_PRODUCTS[0].imeiSample,
    },
    {
      ...SAMPLE_POS_PRODUCTS[3],
      cartQty: 2,
    },
  ])
  const [customer, setCustomer] = useState('Walk-in Customer')
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [paymentType, setPaymentType] = useState('cash') // 'cash', 'card', 'split'

  // Filter products
  const filteredProducts = SAMPLE_POS_PRODUCTS.filter((p) => {
    const matchesCat =
      selectedCategory === 'All Products' || p.category === selectedCategory
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.imeiSample && p.imeiSample.includes(searchQuery))
    return matchesCat && matchesSearch
  })

  // Add to Cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (product.isSerialized) {
          alert('Serialized devices must be added with a unique IMEI per unit.')
          return prev
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQty: item.cartQty + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          ...product,
          cartQty: 1,
          selectedIMEI: product.isSerialized ? product.imeiSample : undefined,
        },
      ]
    })
  }

  // Update Cart Quantity
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.cartQty + delta
            return newQty > 0 ? { ...item, cartQty: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  // Remove Cart Item
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0)
  const discount = 0
  const tax = 0 // Net price
  const total = subtotal - discount + tax

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 overflow-hidden">
      {/* Left Area: Product Browser & Barcode Search */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-subtle">
        {/* Search & Barcode Header */}
        <div className="p-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-surface/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Scan Barcode or Search by IMEI / Serial / Device Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              leftIcon={<ScanLine className="w-4 h-4 text-purpleAccent-500" />}
              className="shrink-0"
              onClick={() => alert('IMEI Scanner Camera or Optical reader activated.')}
            >
              Scan IMEI
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-glow-blue'
                    : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-dark-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="flex flex-col justify-between p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/30 hover:border-brand-500/60 hover:shadow-subtle hover:bg-white dark:hover:bg-dark-surface transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{p.image}</span>
                  {p.isSerialized ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purpleAccent-50 text-purpleAccent-700 dark:bg-purpleAccent-950/60 dark:text-purpleAccent-300 border border-purpleAccent-200 dark:border-purpleAccent-800">
                      IMEI
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Qty: {p.stock}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatLKR(p.price, false)}
                </span>
                <span className="p-1 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: POS Live Billing Cart */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl overflow-hidden">
        {/* Cart Header & Customer Selector */}
        <div className="p-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-surface/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-brand-500" />
              Active Bill (#INV-10493)
            </span>
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {customer}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = prompt('Enter customer name or phone:', customer)
                if (name) setCustomer(name)
              }}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              Change
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Smartphone className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs font-semibold">Cart is currently empty</p>
              <p className="text-[10px] mt-1">Scan or tap products from catalog to bill.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/40 dark:bg-dark-surface/40 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatLKR(item.price)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Serialized IMEI Indicator */}
                {item.isSerialized && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purpleAccent-50 dark:bg-purpleAccent-950/40 border border-purpleAccent-200/50 dark:border-purpleAccent-900/50 text-[10px] text-purpleAccent-700 dark:text-purpleAccent-300">
                    <ScanLine className="w-3 h-3 shrink-0" />
                    <span className="font-mono truncate">IMEI: {item.selectedIMEI}</span>
                  </div>
                )}

                {/* Qty & Line Total */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {!item.isSerialized ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1">{item.cartQty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500">1 Unit</span>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatLKR(item.price * item.cartQty)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Payment Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-surface/60 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatLKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Discount</span>
              <span>Rs. 0.00</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-dark-border">
              <span>Payable Total</span>
              <span className="text-brand-600 dark:text-brand-400">{formatLKR(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentType('cash')
                setIsCheckoutModalOpen(true)
              }}
              disabled={cart.length === 0}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-500 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-semibold gap-1"
            >
              <Banknote className="w-4 h-4 text-emerald-500" />
              Cash
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentType('card')
                setIsCheckoutModalOpen(true)
              }}
              disabled={cart.length === 0}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-500 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-semibold gap-1"
            >
              <CreditCard className="w-4 h-4 text-brand-500" />
              Card
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentType('split')
                setIsCheckoutModalOpen(true)
              }}
              disabled={cart.length === 0}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-500 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-semibold gap-1"
            >
              <Split className="w-4 h-4 text-purpleAccent-500" />
              Split
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full shadow-glow-blue font-bold text-sm"
          >
            Complete Sale ({formatLKR(total, false)})
          </Button>
        </div>
      </div>

      {/* Checkout Preview Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Finalize POS Sale & Print Invoice"
        description="Verify IMEI allocation, payment settlement and warranty certificate."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('Sale completed! Warranty certificate generated for registered IMEI units.')
                setIsCheckoutModalOpen(false)
                setCart([])
              }}
            >
              Confirm & Print Invoice
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Amount Due</p>
              <p className="text-xl font-black text-brand-600 dark:text-brand-400">
                {formatLKR(total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Selected Method</p>
              <Badge variant="purple" size="md" className="uppercase">
                {paymentType} Payment
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-slate-400">
              Warranty & Serialized Items:
            </p>
            {cart
              .filter((i) => i.isSerialized)
              .map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-dark-border text-xs"
                >
                  <span className="font-semibold">{i.name}</span>
                  <span className="font-mono text-purpleAccent-600 dark:text-purpleAccent-400">
                    IMEI: {i.selectedIMEI}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

