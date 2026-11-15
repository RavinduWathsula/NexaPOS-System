import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

const maxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Wrapper that prevents top clipping on tall modals */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        {/* Modal Dialog Box */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full text-left my-auto rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl z-10 overflow-hidden max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col transform transition-all duration-200 animate-in fade-in zoom-in-95',
            maxWidths[maxWidth],
            className
          )}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-dark-border px-6 py-4 bg-white dark:bg-dark-card">
              <div>
                {title && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full shrink-0 ml-4"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

