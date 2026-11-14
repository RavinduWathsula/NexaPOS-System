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

// Clear any stale legacy localStorage session to prevent unwanted auto-login
if (typeof window !== 'undefined') {
  localStorage.removeItem('nexapos_user')
  localStorage.removeItem('nexapos_access_token')
  localStorage.removeItem('nexapos_refresh_token')
}

const getSavedUser = () => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('nexapos_access_token')
    const saved = sessionStorage.getItem('nexapos_user')
    if (token && saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return null
      }
    }
  }
  return null
}

const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('nexapos_access_token')
    const saved = sessionStorage.getItem('nexapos_user')
    return Boolean(token && saved)
  }
  return false
}

export const useAuthStore = create((set, get) => ({
  user: getSavedUser(),
  isAuthenticated: getInitialAuth(),
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

      sessionStorage.setItem('nexapos_access_token', accessToken)
      sessionStorage.setItem('nexapos_refresh_token', refreshToken)
      sessionStorage.setItem('nexapos_user', JSON.stringify(formattedUser))

      set({ user: formattedUser, isAuthenticated: true, isLoading: false })
      return formattedUser
    } catch (apiError) {
      set({ isLoading: false })
      throw apiError
    }
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (e) {
      // Ignore network errors on logout
    }
    sessionStorage.clear()
    localStorage.removeItem('nexapos_access_token')
    localStorage.removeItem('nexapos_refresh_token')
    localStorage.removeItem('nexapos_user')
    set({ user: null, isAuthenticated: false })
  },
}))
