import React from 'react'
import { cn } from '@/utils/cn'

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-dark-border">
      <table
        className={cn('w-full text-left text-sm text-slate-600 dark:text-slate-300', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        'bg-slate-50/80 dark:bg-dark-surface/60 border-b border-slate-200 dark:border-dark-border text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn('divide-y divide-slate-100 dark:divide-dark-border', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, clickable = false, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50/60 dark:hover:bg-dark-surface/40',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn('px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300', className)}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn('px-4 py-3.5 align-middle text-slate-800 dark:text-slate-200', className)}
      {...props}
    >
      {children}
    </td>
  )
}

