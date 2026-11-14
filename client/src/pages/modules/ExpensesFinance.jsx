import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  Key,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  PieChart as PieIcon,
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { expensesAPI, cashSessionsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatLKR } from '@/utils/currency'
import { useAuthStore } from '@/stores/authStore'

const PIE_COLORS = ['#8b5cf6', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#64748b']

export function ExpensesFinance() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('expenses') // 'expenses' or 'cash-sessions'

  // EXPENSES STATE
  const [expenses, setExpenses] = useState([])
  const [expenseSummary, setExpenseSummary] = useState({ totalAmount: 0, totalCount: 0, categoryBreakdown: [] })
  const [expenseLoading, setExpenseLoading] = useState(true)
  const [expenseSearch, setExpenseSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedMethod, setSelectedMethod] = useState('ALL')
  const [categoriesList, setCategoriesList] = useState([])

  // EXPENSE MODAL STATE
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Rent',
    amount: '',
    paymentMethod: 'CASH',
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [expenseSubmitting, setExpenseSubmitting] = useState(false)
  const [expenseError, setExpenseError] = useState('')

  // CASH SESSIONS STATE
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])
  const [sessionLoading, setSessionLoading] = useState(true)

  // CASH SESSION MODALS
  const [openModalOpen, setOpenModalOpen] = useState(false)
  const [openingFloatInput, setOpeningFloatInput] = useState('')
  const [openNotesInput, setOpenNotesInput] = useState('')
  const [openingSession, setOpeningSession] = useState(false)

  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [actualClosingInput, setActualClosingInput] = useState('')
  const [closeNotesInput, setCloseNotesInput] = useState('')
  const [closingSession, setClosingSession] = useState(false)

  // Selected Session Details Modal
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null)

  // 1. Load Expenses
  const loadExpenses = async () => {
    try {
      setExpenseLoading(true)
      const [res, catRes] = await Promise.all([
        expensesAPI.list({
          search: expenseSearch,
          category: selectedCategory,
          paymentMethod: selectedMethod,
        }),
        expensesAPI.categories(),
      ])
      setExpenses(res.data.data?.items || [])
      setExpenseSummary(res.data.data?.summary || { totalAmount: 0, totalCount: 0, categoryBreakdown: [] })
      setCategoriesList(catRes.data.data || [])
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setExpenseLoading(false)
    }
  }

  // 2. Load Cash Sessions
  const loadSessions = async () => {
    try {
      setSessionLoading(true)
      const [currRes, histRes] = await Promise.all([
        cashSessionsAPI.current(),
        cashSessionsAPI.list({ limit: 50 }),
      ])
      setCurrentSession(currRes.data.data || null)
      setSessionHistory(histRes.data.data?.items || [])
    } catch (err) {
      console.error('Failed to load cash sessions:', err)
    } finally {
      setSessionLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'expenses') {
      const timer = setTimeout(() => {
        loadExpenses()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      loadSessions()
    }
  }, [activeTab, expenseSearch, selectedCategory, selectedMethod])

  // Open Expense Modal
  const handleOpenNewExpense = () => {
    setEditingExpense(null)
    setExpenseForm({
      title: '',
      category: categoriesList[0] || 'Rent',
      amount: '',
      paymentMethod: 'CASH',
      expenseDate: new Date().toISOString().slice(0, 10),
      notes: '',
    })
    setExpenseError('')
    setExpenseModalOpen(true)
  }

  const handleOpenEditExpense = (exp) => {
    setEditingExpense(exp)
    setExpenseForm({
      title: exp.title,
      category: exp.category,
      amount: String(exp.amount),
      paymentMethod: exp.paymentMethod,
      expenseDate: new Date(exp.expenseDate).toISOString().slice(0, 10),
      notes: exp.notes || '',
    })
    setExpenseError('')
    setExpenseModalOpen(true)
  }

  // Submit Expense Form
  const handleSubmitExpense = async (e) => {
    e.preventDefault()
    if (!expenseForm.title.trim()) {
      setExpenseError('Title is required.')
      return
    }
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      setExpenseError('Please enter a valid expense amount.')
      return
    }

    try {
      setExpenseSubmitting(true)
      setExpenseError('')
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, {
          ...expenseForm,
          amount: Number(expenseForm.amount),
        })
      } else {
        await expensesAPI.create({
          ...expenseForm,
          amount: Number(expenseForm.amount),
        })
      }
      setExpenseModalOpen(false)
      loadExpenses()
    } catch (err) {
      setExpenseError(err.response?.data?.message || 'Failed to save expense.')
    } finally {
      setExpenseSubmitting(false)
    }
  }

  // Delete Expense
  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete expense "${title}"?`)) return
    try {
      await expensesAPI.delete(id)
      loadExpenses()
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete expense record.')
    }
  }

  // Open Cash Register Session
  const handleOpenSessionSubmit = async (e) => {
    e.preventDefault()
    try {
      setOpeningSession(true)
      await cashSessionsAPI.open({
        openingBalance: Number(openingFloatInput) || 0,
        notes: openNotesInput,
      })
      setOpenModalOpen(false)
      setOpeningFloatInput('')
      setOpenNotesInput('')
      loadSessions()
      alert('Cash register session opened successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open cash session.')
    } finally {
      setOpeningSession(false)
    }
  }

  // Close & Reconcile Cash Register Session
  const handleCloseSessionSubmit = async (e) => {
    e.preventDefault()
    if (actualClosingInput === '') {
      alert('Please enter actual physical counted cash in drawer.')
      return
    }

    try {
      setClosingSession(true)
      const res = await cashSessionsAPI.close(currentSession.id, {
        closingBalance: Number(actualClosingInput),
        notes: closeNotesInput,
      })
      setCloseModalOpen(false)
      setActualClosingInput('')
      setCloseNotesInput('')
      loadSessions()

      const rec = res.data.data?.reconciliation
      if (rec?.isBalanced) {
        alert('Session closed! Drawer balanced perfectly with expected count.')
      } else if (rec?.isShortage) {
        alert(`Session closed! Note: Drawer has a shortage of ${formatLKR(Math.abs(rec.difference))}`)
      } else {
        alert(`Session closed! Note: Drawer has a surplus of ${formatLKR(rec.difference)}`)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close cash session.')
    } finally {
      setClosingSession(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Expenses & Cash Register Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Operating expenses ledger, drawer float reconciliation, and cashier shift audits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'expenses' ? (
            <Button
              size="sm"
              onClick={handleOpenNewExpense}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log New Expense
            </Button>
          ) : currentSession ? (
            <Button
              size="sm"
              onClick={() => {
                setActualClosingInput(String(currentSession.metrics?.expectedClosingBalance || ''))
                setCloseNotesInput('')
                setCloseModalOpen(true)
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Close Register & Reconcile
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setOpeningFloatInput('')
                setOpenNotesInput('')
                setOpenModalOpen(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Unlock className="h-4 w-4 mr-1.5" />
              Open Register Shift
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Operating Expenses
        </button>

        <button
          onClick={() => setActiveTab('cash-sessions')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'cash-sessions'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Cash Register Shifts & Reconciliations
        </button>
      </div>

      {/* TAB 1: OPERATING EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Total Operating Outflow
              </span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                {formatLKR(expenseSummary.totalAmount)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {expenseSummary.totalCount} expense records logged
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Highest Expense Category
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                {expenseSummary.categoryBreakdown?.[0]?.category || 'N/A'}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {formatLKR(expenseSummary.categoryBreakdown?.[0]?.amount || 0)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-xs uppercase font-medium text-slate-400 block">
                Expense Categories
              </span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                {expenseSummary.categoryBreakdown?.length || 0}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">Active cost centers</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense title..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Expenses Table & Category Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Expense Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Method & Date</th>
                    <th className="p-3 text-right">Amount (LKR)</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenseLoading && expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-rose-500" />
                        Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No expenses logged matching criteria.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {exp.title}
                          </span>
                          {exp.notes && (
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {exp.notes}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="purple" size="sm">
                            {exp.category}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300 block">
                            {exp.paymentMethod.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(exp.expenseDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400">
                          {formatLKR(exp.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              title="Edit Expense"
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Delete Expense"
                              onClick={() => handleDeleteExpense(exp.id, exp.title)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Category Pie Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-purple-500" />
                Expenses by Category
              </h3>

              {expenseSummary.categoryBreakdown?.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseSummary.categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
                        paddingAngle={3}
                      >
                        {expenseSummary.categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatLKR(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-10">No category breakdown data.</p>
              )}

              <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                {expenseSummary.categoryBreakdown?.map((cat, i) => (
                  <div key={cat.category} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      {cat.category}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatLKR(cat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASHIER REGISTER & CASH SESSIONS */}
      {activeTab === 'cash-sessions' && (
        <div className="space-y-6">
          {/* Active Session Status Widget */}
          {currentSession ? (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-500/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20">
                    <Unlock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Active Cash Register Session
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        OPEN & RECORDING
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cashier: <strong>{currentSession.cashier?.name}</strong> • Opened:{' '}
                      {new Date(currentSession.openedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setActualClosingInput(String(currentSession.metrics?.expectedClosingBalance || ''))
                    setCloseNotesInput('')
                    setCloseModalOpen(true)
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
                >
                  <Lock className="h-4 w-4 mr-1.5" />
                  Close Shift & Reconcile
                </Button>
              </div>

              {/* Live Drawer Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-200/60 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Opening Cash Float</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {formatLKR(currentSession.metrics?.openingFloat || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Cash Sales Collected</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    +{formatLKR(currentSession.metrics?.cashSales || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Cash Returns / Refunds</span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    -{formatLKR(currentSession.metrics?.cashRefunds || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold block">
                    Expected Drawer Cash
                  </span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-200 mt-0.5 block">
                    {formatLKR(currentSession.metrics?.expectedClosingBalance || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
              <Lock className="h-10 w-10 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Active Cash Session
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Open a new cash drawer shift before ringing up POS cash sales to maintain drawer integrity.
              </p>
              <Button
                onClick={() => {
                  setOpeningFloatInput('')
                  setOpenNotesInput('')
                  setOpenModalOpen(true)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Unlock className="h-4 w-4 mr-1.5" />
                Open Cash Register Float
              </Button>
            </div>
          )}

          {/* Session History Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Cash Session Audit History
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-3">Cashier</th>
                    <th className="p-3">Opened At</th>
                    <th className="p-3">Closed At</th>
                    <th className="p-3 text-right">Opening Float</th>
                    <th className="p-3 text-right">Expected Drawer</th>
                    <th className="p-3 text-right">Actual Count</th>
                    <th className="p-3 text-right">Difference</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessionHistory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No previous cash sessions recorded.
                      </td>
                    </tr>
                  ) : (
                    sessionHistory.map((s) => {
                      const diff = Number(s.difference || 0)
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {s.cashier?.name}
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(s.openedAt).toLocaleString()}
                          </td>
                          <td className="p-3 text-slate-500">
                            {s.closedAt ? new Date(s.closedAt).toLocaleString() : 'In Progress'}
                          </td>
                          <td className="p-3 text-right font-medium">{formatLKR(s.openingBalance)}</td>
                          <td className="p-3 text-right font-medium">
                            {s.expectedBalance !== null ? formatLKR(s.expectedBalance) : '—'}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                            {s.closingBalance !== null ? formatLKR(s.closingBalance) : '—'}
                          </td>
                          <td className="p-3 text-right">
                            {s.status === 'CLOSED' ? (
                              Math.abs(diff) < 0.01 ? (
                                <span className="text-emerald-600 font-semibold">Balanced ✓</span>
                              ) : diff < 0 ? (
                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                  {formatLKR(diff)} (Shortage)
                                </span>
                              ) : (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  +{formatLKR(diff)} (Surplus)
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={s.status === 'OPEN' ? 'success' : 'outline'} size="sm">
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Log / Edit Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title={editingExpense ? 'Edit Operating Expense' : 'Record Operating Expense'}
        description="Track store rent, utility charges, technician tools, and operational overheads."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
          {expenseError && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {expenseError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Expense Title *
            </label>
            <Input
              required
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              placeholder="e.g. Ceylon Electricity Board Commercial Bill"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category *
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount (LKR) *
              </label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Method
              </label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="CASH">Cash / Petty Cash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Company Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Internal Description & Voucher Reference
            </label>
            <textarea
              rows={2}
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              placeholder="Receipt / Voucher #, bank slip details, payee name..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={expenseSubmitting} className="bg-rose-600 text-white hover:bg-rose-700">
              {expenseSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Open Cash Register Shift Modal */}
      <Modal
        isOpen={openModalOpen}
        onClose={() => setOpenModalOpen(false)}
        title="Open Cash Register Shift"
        description="Verify initial physical cash float placed in the drawer before starting transactions."
        maxWidth="md"
      >
        <form onSubmit={handleOpenSessionSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Opening Cash Float (LKR) *
            </label>
            <Input
              type="number"
              min="0"
              step="100"
              required
              value={openingFloatInput}
              onChange={(e) => setOpeningFloatInput(e.target.value)}
              placeholder="e.g. 10000"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Coins & small denomination bills provided for customer change.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Shift Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={openNotesInput}
              onChange={(e) => setOpenNotesInput(e.target.value)}
              placeholder="Morning shift opening, drawer verified by manager..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setOpenModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={openingSession} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {openingSession ? 'Opening...' : 'Confirm Opening Float'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Cash Register Shift Modal */}
      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title="Close & Reconcile Register Shift"
        description="Count physical cash in the drawer to calculate discrepancies against system expected totals."
        maxWidth="md"
      >
        <form onSubmit={handleCloseSessionSubmit} className="space-y-4 pt-2">
          {currentSession && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Float:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatLKR(currentSession.metrics?.openingFloat || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Sales:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatLKR(currentSession.metrics?.cashSales || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Refunds:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatLKR(currentSession.metrics?.cashRefunds || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-800 dark:text-slate-200">System Expected Cash:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatLKR(currentSession.metrics?.expectedClosingBalance || 0)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Actual Physical Cash Counted (LKR) *
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              required
              value={actualClosingInput}
              onChange={(e) => setActualClosingInput(e.target.value)}
              placeholder="Counted cash total"
            />
          </div>

          {actualClosingInput !== '' && currentSession && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between font-bold ${
                Number(actualClosingInput) - (currentSession.metrics?.expectedClosingBalance || 0) === 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30'
                  : Number(actualClosingInput) - (currentSession.metrics?.expectedClosingBalance || 0) < 0
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30'
              }`}
            >
              <span>Discrepancy / Variance:</span>
              <span>
                {formatLKR(Number(actualClosingInput) - (currentSession.metrics?.expectedClosingBalance || 0))}
                {Number(actualClosingInput) - (currentSession.metrics?.expectedClosingBalance || 0) < 0
                  ? ' (Shortage)'
                  : Number(actualClosingInput) - (currentSession.metrics?.expectedClosingBalance || 0) > 0
                  ? ' (Surplus)'
                  : ' (Perfect Balance)'}
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Closing & Discrepancy Reason Notes
            </label>
            <textarea
              rows={2}
              value={closeNotesInput}
              onChange={(e) => setCloseNotesInput(e.target.value)}
              placeholder="Any explanation for discrepancy, petty cash payout notes..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={closingSession} className="bg-rose-600 text-white hover:bg-rose-700">
              {closingSession ? 'Closing...' : 'Confirm Reconcile & Close'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default ExpensesFinance
