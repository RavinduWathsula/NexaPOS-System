import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { useNotificationStore } from '@/stores/notificationStore'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotificationStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch real system notifications on initial load & poll periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 45000) // check every 45s for fresh system updates
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Refetch when opening dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = (category, type) => {
    if (type === 'danger') {
      return <AlertOctagon className="w-4 h-4 text-rose-500" />
    }
    switch (category) {
      case 'inventory':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'repairs':
        return <Wrench className="w-4 h-4 text-brand-500" />
      case 'warranty':
        return <ShieldCheck className="w-4 h-4 text-purpleAccent-500" />
      case 'sales':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />
      case 'purchases':
        return <Truck className="w-4 h-4 text-sky-500" />
      default:
        return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id)
    if (notif.actionUrl) {
      navigate(notif.actionUrl)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-subtle"
        aria-label="System Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-bg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border bg-slate-50/80 dark:bg-dark-surface/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                System Updates & Alerts
              </span>
              {unreadCount > 0 ? (
                <Badge variant="danger" size="sm">
                  {unreadCount} new
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Live
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchNotifications()}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw
                  className={cn('w-3.5 h-3.5', isLoading && 'animate-spin text-brand-500')}
                />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
            </div>
          </div>

          {/* List of Real System Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  All Systems Normal
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  No active stock alerts or pending actions in the database.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'flex items-start gap-3 p-3.5 transition-colors cursor-pointer group',
                    notif.read
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-dark-surface/40'
                      : 'bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50/70 dark:hover:bg-brand-950/30'
                  )}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border shadow-xs shrink-0">
                    {getIcon(notif.category, notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {notif.timestamp}
                      </span>
                      {notif.actionUrl && (
                        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details →
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notif.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-dark-surface/50 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-[11px] text-slate-500">
              <span>{notifications.length} system events</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-400 hover:text-rose-500 transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
