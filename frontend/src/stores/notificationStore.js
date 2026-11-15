import { create } from 'zustand'
import { notificationsAPI } from '@/services/api'

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return 'Recently'
  const now = new Date()
  const diffSec = Math.floor((now - date) / 1000)

  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function getStoredSet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveStoredSet(key, setObj) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(setObj).slice(-100)))
  } catch {
    // ignore
  }
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,
  lastFetched: null,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await notificationsAPI.list()
      const rawNotifications = res.data?.data || []
      const readSet = getStoredSet('nexapos_read_notifications')
      const clearedSet = getStoredSet('nexapos_cleared_notifications')

      const formatted = rawNotifications
        .filter((n) => !clearedSet.has(n.id))
        .map((n) => ({
          ...n,
          timestamp: formatRelativeTime(n.timestamp),
          read: readSet.has(n.id),
        }))

      set({
        notifications: formatted,
        isLoading: false,
        lastFetched: Date.now(),
      })
    } catch (err) {
      console.warn('Could not fetch real notifications:', err?.message)
      set({ isLoading: false })
    }
  },

  markAsRead: (id) => {
    const readSet = getStoredSet('nexapos_read_notifications')
    readSet.add(id)
    saveStoredSet('nexapos_read_notifications', readSet)

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  markAllAsRead: () => {
    const { notifications } = get()
    const readSet = getStoredSet('nexapos_read_notifications')
    notifications.forEach((n) => readSet.add(n.id))
    saveStoredSet('nexapos_read_notifications', readSet)

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  clearNotification: (id) => {
    const clearedSet = getStoredSet('nexapos_cleared_notifications')
    clearedSet.add(id)
    saveStoredSet('nexapos_cleared_notifications', clearedSet)

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    const { notifications } = get()
    const clearedSet = getStoredSet('nexapos_cleared_notifications')
    notifications.forEach((n) => clearedSet.add(n.id))
    saveStoredSet('nexapos_cleared_notifications', clearedSet)

    set({ notifications: [] })
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: `live_${Date.now()}`,
          timestamp: 'Just now',
          read: false,
          ...notification,
        },
        ...state.notifications,
      ],
    }))
  },
}))
