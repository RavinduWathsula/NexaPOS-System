import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Smartphone,
  Package,
  FolderTree,
  Tag,
  ScanLine,
  Boxes,
  Receipt,
  RotateCcw,
  Users,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  ShoppingBag,
  Truck,
  UserCheck,
  BarChart3,
  DollarSign,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

export const NAVIGATION_GROUPS = [
  {
    title: 'Core',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER'],
      },
      {
        name: 'POS Terminal',
        path: '/pos',
        icon: Smartphone,
        highlight: true,
        badge: 'Live',
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'],
      },
    ],
  },
  {
    title: 'Catalog & IMEI Tracking',
    items: [
      {
        name: 'Products',
        path: '/products',
        icon: Package,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
      {
        name: 'Categories',
        path: '/categories',
        icon: FolderTree,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
      {
        name: 'Brands',
        path: '/brands',
        icon: Tag,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
      {
        name: 'IMEI & Devices',
        path: '/imei-devices',
        icon: ScanLine,
        badge: 'Unique',
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER', 'TECHNICIAN'],
      },
      {
        name: 'Inventory',
        path: '/inventory',
        icon: Boxes,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
    ],
  },
  {
    title: 'Sales & Services',
    items: [
      {
        name: 'Sales & Invoices',
        path: '/sales-invoices',
        icon: Receipt,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'],
      },
      {
        name: 'Returns & Refunds',
        path: '/returns',
        icon: RotateCcw,
        badge: 'RMA',
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'],
      },
      {
        name: 'Customers',
        path: '/customers',
        icon: Users,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'],
      },
      {
        name: 'Warranty Management',
        path: '/warranty-management',
        icon: ShieldCheck,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'],
      },
      {
        name: 'Repair Management',
        path: '/repair-management',
        icon: Wrench,
        badge: '4 Due',
        badgeColor: 'bg-amber-500',
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'],
      },
    ],
  },
  {
    title: 'Procurement',
    items: [
      {
        name: 'Purchases',
        path: '/purchases',
        icon: ShoppingBag,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
      {
        name: 'Suppliers',
        path: '/suppliers',
        icon: Truck,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        name: 'Employees',
        path: '/employees',
        icon: UserCheck,
        allowedRoles: ['SUPER_ADMIN'],
      },
      {
        name: 'Reports & Analytics',
        path: '/reports-analytics',
        icon: BarChart3,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER'],
      },
      {
        name: 'Expenses & Finance',
        path: '/expenses-finance',
        icon: DollarSign,
        allowedRoles: ['SUPER_ADMIN', 'MANAGER'],
      },
      {
        name: 'Audit Logs & Security',
        path: '/audit-logs',
        icon: ShieldAlert,
        badge: 'Secure',
        badgeColor: 'bg-indigo-600',
        allowedRoles: ['SUPER_ADMIN', 'MANAGER'],
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        allowedRoles: ['SUPER_ADMIN'],
      },
    ],
  },
]

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const location = useLocation()
  const { user } = useAuthStore()

  // Filter groups and items based on active user role
  const filteredGroups = NAVIGATION_GROUPS.map((group) => {
    const visibleItems = group.items.filter((item) => {
      if (!user) return false
      if (user.role === 'SUPER_ADMIN') return true
      return item.allowedRoles.includes(user.role)
    })
    return { ...group, items: visibleItems }
  }).filter((group) => group.items.length > 0)

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-dark-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-purpleAccent-500 text-white shadow-glow-blue shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-purpleAccent-500 bg-clip-text text-transparent">
                    NexaPOS
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    Retail
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  Mobile & Electronics
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  {group.title}
                </h4>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (isMobileOpen) onCloseMobile()
                    }}
                    title={isCollapsed && !isMobileOpen ? item.name : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-brand-600 to-purpleAccent-600 text-white shadow-glow-blue font-semibold'
                          : 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold'
                        : item.highlight
                        ? 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-dark-surface hover:text-slate-900 dark:hover:text-slate-100',
                      isCollapsed && !isMobileOpen && 'justify-center px-0'
                    )}
                  >
                    {isActive && !item.highlight && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                    )}

                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive
                          ? item.highlight
                            ? 'text-white'
                            : 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}
                    />

                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {(!isCollapsed || isMobileOpen) && item.badge && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                          item.badgeColor
                            ? `${item.badgeColor} text-white`
                            : item.highlight
                            ? 'bg-white/20 text-white backdrop-blur-xs'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer Collapse Toggle (Desktop) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-100 dark:border-dark-border">
          {!isCollapsed || isMobileOpen ? (
            <div className="flex items-center gap-2 px-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online (LKR)</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}
