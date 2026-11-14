import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search products, IMEI, serial no, invoices...',
  className,
  ...props
}) {
  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100/70 dark:bg-dark-surface/60 pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:bg-white dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

