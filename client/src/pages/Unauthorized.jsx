import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/stores/authStore'

export function Unauthorized() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-4 shadow-sm border border-rose-200 dark:border-rose-900/50">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-800">
        <Lock className="w-3.5 h-3.5" />
        <span>HTTP 403 — Access Denied</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Restricted Area
      </h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Your current staff profile does not have permission to view or manage this section of the system.
      </p>

      {user && (
        <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border inline-flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
            <span
              className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded border ${
                ROLE_BADGE_COLORS[user.role]
              }`}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={<Home className="w-4 h-4" />}
          className="shadow-glow-blue"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
