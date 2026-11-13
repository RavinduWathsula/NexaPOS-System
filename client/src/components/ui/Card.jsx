import React from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-card shadow-subtle text-slate-900 dark:text-slate-100 transition-all duration-200',
        hover && 'hover:shadow-premium dark:hover:shadow-premium-dark hover:border-slate-300 dark:hover:border-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-xs text-slate-500 dark:text-slate-400', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center p-5 pt-0 border-t border-slate-100 dark:border-dark-border mt-3 pt-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

