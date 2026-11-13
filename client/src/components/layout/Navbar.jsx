import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Sun,
  Moon,
  Smartphone,
  MapPin,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { NotificationDropdown } from './NotificationDropdown'
import { UserProfileDropdown } from './UserProfileDropdown'
import { cn } from '@/utils/cn'

export function Navbar({ onOpenMobileMenu, isSidebarCollapsed }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In later phases this routes or filters, for now we navigate to search context or products
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-border transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="w-full">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search IMEI, phones, accessories, serial no, invoice..."
          />
        </form>
      </div>

      {/* Right: Actions, Currency/Branch, Theme, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        {/* Branch / Currency Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-dark-border">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Colombo Main Branch
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">
            LKR
          </span>
        </div>

        {/* Quick Launch POS Terminal */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/pos')}
          leftIcon={<Smartphone className="w-4 h-4" />}
          className="hidden sm:inline-flex shadow-glow-blue"
        >
          <span>POS Terminal</span>
        </Button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-subtle"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-300" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  )
}

