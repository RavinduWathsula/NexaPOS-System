import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/stores/authStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authAPI } from '@/services/api'
import { cn } from '@/utils/cn'

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/login')
  }

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'New password and confirm password do not match.' })
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword)
      setPwMessage({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setIsChangePasswordOpen(false)
        setPwMessage({ type: '', text: '' })
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update password. Please check your current password.'
      setPwMessage({ type: 'error', text: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-subtle text-left"
        >
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-brand-500/30"
          />
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight">
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-surface/50">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border',
                        ROLE_BADGE_COLORS[user.role]
                      )}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="p-2 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsChangePasswordOpen(true)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
              >
                <KeyRound className="w-4 h-4 text-purpleAccent-500" />
                Change Password
              </button>

              {user.role === 'SUPER_ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Store Settings
                </button>
              )}

              {['SUPER_ADMIN', 'MANAGER', 'CASHIER'].includes(user.role) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/pos')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-brand-500" />
                  Launch POS Terminal
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/30">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Staff Password"
        description="Ensure your new password contains at least 6 characters."
        maxWidth="md"
      >
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          {pwMessage.text && (
            <div
              className={cn(
                'p-3 rounded-xl flex items-center gap-2 text-xs font-medium',
                pwMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              )}
            >
              {pwMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{pwMessage.text}</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            helperText="Minimum 6 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
