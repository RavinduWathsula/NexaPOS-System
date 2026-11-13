import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuthStore, DEMO_USERS, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

export function Login() {
  const navigate = useNavigate()
  const { login, loginAsPreset, isLoading } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [email, setEmail] = useState('admin@nexapos.lk')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please provide your email address and password.')
      return
    }

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Authentication failed. Please check your credentials.')
    }
  }

  const handleSelectPreset = (user) => {
    setEmail(user.email)
    setPassword('demoPass123')
    loginAsPreset(user)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Theme toggle corner pill */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Left Column: Visual Brand & Key Value Proposition */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-dark-bg to-dark-card p-12 flex-col justify-between overflow-hidden border-r border-dark-border">
        {/* Glow backdrop accents */}
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-purpleAccent-600/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-purpleAccent-500 text-white shadow-glow-blue">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                NexaPOS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mobile Phone & Electronics Retail Management
            </p>
          </div>
        </div>

        {/* Middle Value Showcase */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Precision POS, IMEI Tracking & Retail Operations in Sri Lanka
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed specifically for multi-branch mobile phone shops, repair centers,
              and electronic distributors. Complete lifecycle control from supplier intake
              to warranty fulfillment.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              'Individual IMEI & Serial number tracking prevents double-sales',
              'Sub-second POS billing with split cash, card & installment payments',
              'Integrated warranty issuance and technician repair queue',
              'Role-based access security for Admins, Cashiers & Technicians',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <p>© 2024 NexaPOS Retail OS. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-Grade Encryption</span>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form & Role Tester Presets */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Mobile brand header (only on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purpleAccent-500 text-white shadow-glow-blue">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                NexaPOS
              </span>
              <p className="text-xs text-slate-400">Electronics Retail Management</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to your terminal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enter your staff credentials or select a role preset below to test.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@nexapos.lk"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember this terminal</span>
              </label>
              <button
                type="button"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-glow-blue"
              isLoading={isLoading}
            >
              Sign In to NexaPOS
            </Button>
          </form>

          {/* Role Presets Section for immediate testing without backend */}
          <div className="pt-4 border-t border-slate-200 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Role Testing Presets
              </span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                Phase 1 Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectPreset(demo)}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-dark-surface transition-all text-left group"
                >
                  <img
                    src={demo.avatar}
                    alt={demo.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-dark-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {demo.name}
                    </p>
                    <span
                      className={cn(
                        'inline-block px-1.5 py-0.2 text-[9px] font-bold rounded border',
                        ROLE_BADGE_COLORS[demo.role]
                      )}
                    >
                      {ROLE_LABELS[demo.role]}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

