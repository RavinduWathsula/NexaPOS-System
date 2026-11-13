import { create } from 'zustand'
import { authAPI } from '@/services/api'

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  TECHNICIAN: 'TECHNICIAN',
  STOCK_KEEPER: 'STOCK_KEEPER',
}

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin / Owner',
  MANAGER: 'Store Manager',
  CASHIER: 'Cashier',
  TECHNICIAN: 'Repair Technician',
  STOCK_KEEPER: 'Stock Keeper',
}

export const ROLE_BADGE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  CASHIER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  TECHNICIAN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  STOCK_KEEPER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
}

// Preset demo accounts for testing all roles during UI phase
export const DEMO_USERS = [
  {
    id: 'usr_1',
    name: 'Kasun Jayawardena',
    email: 'admin@nexapos.lk',
    role: ROLES.SUPER_ADMIN,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+94 77 123 4567',
  },
  {
    id: 'usr_2',
    name: 'Nimal Perera',
    email: 'manager@nexapos.lk',
    role: ROLES.MANAGER,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+94 71 234 5678',
  },
  {
    id: 'usr_3',
    name: 'Chamari Silva',
    email: 'cashier@nexapos.lk',
    role: ROLES.CASHIER,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+94 76 345 6789',
  },
  {
    id: 'usr_4',
    name: 'Dinesh Fernando',
    email: 'tech@nexapos.lk',
    role: ROLES.TECHNICIAN,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+94 72 456 7890',
  },
  {
    id: 'usr_5',
    name: 'Roshan Wickrama',
    email: 'stock@nexapos.lk',
    role: ROLES.STOCK_KEEPER,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+94 78 567 8901',
  },
]

const getSavedUser = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nexapos_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return DEMO_USERS[0]
      }
    }
  }
  return DEMO_USERS[0]
}

export const useAuthStore = create((set, get) => ({
  user: getSavedUser(),
  isAuthenticated: true,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      // Call Real Backend API
      const response = await authAPI.login(email, password)
      const { user, accessToken, refreshToken } = response.data.data

      const formattedUser = {
        ...user,
        role: typeof user.role === 'object' ? user.role.name : user.role,
      }

      localStorage.setItem('nexapos_access_token', accessToken)
      localStorage.setItem('nexapos_refresh_token', refreshToken)
      localStorage.setItem('nexapos_user', JSON.stringify(formattedUser))

      set({ user: formattedUser, isAuthenticated: true, isLoading: false })
      return formattedUser
    } catch (apiError) {
      console.warn('Backend login attempt returned error, checking local preset fallback:', apiError.message)
      // Fallback for offline UI testing
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (matched && password === 'Password@123') {
        localStorage.setItem('nexapos_user', JSON.stringify(matched))
        set({ user: matched, isAuthenticated: true, isLoading: false })
        return matched
      }
      set({ isLoading: false })
      throw apiError
    }
  },

  loginAsPreset: (presetUser) => {
    localStorage.setItem('nexapos_user', JSON.stringify(presetUser))
    set({ user: presetUser, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('nexapos_access_token')
    localStorage.removeItem('nexapos_refresh_token')
    localStorage.removeItem('nexapos_user')
    set({ user: null, isAuthenticated: false })
  },

  switchRole: (newRole) => {
    const currentUser = get().user
    if (!currentUser) return
    const updated = { ...currentUser, role: newRole }
    localStorage.setItem('nexapos_user', JSON.stringify(updated))
    set({ user: updated })
  },
}))
