import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Sun,
  Moon,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { authAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')

  // Anti-autofill focus states
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  // Force clean state on mount to prevent browser autofill injection
  useEffect(() => {
    setEmail('')
    setPassword('')
    const t1 = setTimeout(() => {
      setEmail('')
      setPassword('')
    }, 50)
    const t2 = setTimeout(() => {
      setEmail('')
      setPassword('')
    }, 250)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [generatedResetToken, setGeneratedResetToken] = useState('')
  const [isForgotLoading, setIsForgotLoading] = useState(false)

  // Reset password modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newResetPassword, setNewResetPassword] = useState('')
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })
  const [isResetLoading, setIsResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please provide both email address and password.')
      return
    }

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.'
      setError(msg)
    }
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setIsForgotLoading(true)
    setForgotMessage('')
    setGeneratedResetToken('')

    try {
      const res = await authAPI.forgotPassword(forgotEmail)
      setForgotMessage(res.data?.message || 'Password reset instructions have been generated.')
      if (res.data?.data?.resetToken) {
        setGeneratedResetToken(res.data.data.resetToken)
        setResetToken(res.data.data.resetToken)
      }
    } catch (err) {
      setForgotMessage('Could not initiate reset. Please check the email entered.')
    } finally {
      setIsForgotLoading(false)
    }
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    setIsResetLoading(true)
    setResetMessage({ type: '', text: '' })

    try {
      const res = await authAPI.resetPassword(resetToken, newResetPassword)
      setResetMessage({ type: 'success', text: res.data?.message || 'Password reset successfully!' })
      setPassword(newResetPassword)
      setTimeout(() => {
        setIsResetModalOpen(false)
        setIsForgotModalOpen(false)
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to reset password. Token may be invalid or expired.'
      setResetMessage({ type: 'error', text: msg })
    } finally {
      setIsResetLoading(false)
    }
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
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-purpleAccent-600/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-purpleAccent-500 text-white shadow-glow-blue">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">NexaPOS</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Mobile Phone & Electronics Retail Management</p>
          </div>
        </div>

        {/* Value Showcase */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Precision POS, IMEI Tracking & Retail Operations in Sri Lanka
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed specifically for multi-branch mobile phone shops, repair centers, and electronic distributors.
              Complete lifecycle control from supplier intake to warranty fulfillment.
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

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to your terminal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enter your staff credentials to access your terminal session.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
            {/* Decoy inputs to intercept Chrome password manager autofill */}
            <input
              type="text"
              name="prevent_autofill_username"
              tabIndex="-1"
              aria-hidden="true"
              style={{ display: 'none' }}
              autoComplete="off"
            />
            <input
              type="password"
              name="prevent_autofill_password"
              tabIndex="-1"
              aria-hidden="true"
              style={{ display: 'none' }}
              autoComplete="off"
            />

            <div className="relative">
              <Input
                label="Staff Email Address"
                type="text"
                inputMode="email"
                name="pos_terminal_user"
                id="pos_terminal_user"
                autoComplete="one-time-code"
                readOnly={!isEmailFocused}
                onFocus={() => setIsEmailFocused(true)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@nexapos.lk"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Clear email"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="pos_terminal_secret"
              id="pos_terminal_secret"
              autoComplete="new-password"
              readOnly={!isPasswordFocused}
              onFocus={() => setIsPasswordFocused(true)}
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

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
                onClick={() => setIsForgotModalOpen(true)}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-glow-blue font-bold"
              isLoading={isLoading}
            >
              Sign In to NexaPOS
            </Button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Forgot Password Workflow"
        description="Enter your registered staff email address to generate a secure reset token."
        maxWidth="md"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          {forgotMessage && (
            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs">
              {forgotMessage}
            </div>
          )}

          <Input
            label="Staff Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="e.g. cashier@nexapos.lk"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {generatedResetToken && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Generated Development Reset Token:
              </p>
              <div className="p-2 bg-white dark:bg-dark-card rounded-lg font-mono text-[11px] text-brand-600 dark:text-brand-400 break-all select-all border">
                {generatedResetToken}
              </div>
              <Button
                type="button"
                variant="accent"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setResetToken(generatedResetToken)
                  setIsResetModalOpen(true)
                }}
              >
                Proceed to Reset Password
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isForgotLoading}
            >
              Generate Reset Token
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Set New Staff Password"
        description="Enter your token and define a new secure password."
        maxWidth="md"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          {resetMessage.text && (
            <div
              className={cn(
                'p-3 rounded-xl text-xs font-medium',
                resetMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 border border-rose-200'
              )}
            >
              {resetMessage.text}
            </div>
          )}

          <Input
            label="Reset Token"
            type="text"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder="Paste reset token here..."
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newResetPassword}
            onChange={(e) => setNewResetPassword(e.target.value)}
            placeholder="••••••••••••"
            helperText="Minimum 6 characters"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetLoading}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
