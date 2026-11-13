import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Smartphone,
} from 'lucide-react'
import { useAuthStore, ROLES, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout, switchRole } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
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
                src={user.avatar}
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
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Switcher (Preview Simulator for Testing All Roles) */}
          <div className="p-3 border-b border-slate-100 dark:border-dark-border">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Role Simulator (Testing)
            </p>
            <div className="space-y-1">
              {Object.entries(ROLES).map(([roleKey, roleVal]) => (
                <button
                  key={roleVal}
                  type="button"
                  onClick={() => {
                    switchRole(roleVal)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                    user.role === roleVal
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    {ROLE_LABELS[roleVal]}
                  </span>
                  {user.role === roleVal && (
                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Menu */}
          <div className="p-2 space-y-0.5">
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
  )
}

