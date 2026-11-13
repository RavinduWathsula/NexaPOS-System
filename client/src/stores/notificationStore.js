import { create } from 'zustand'

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Low Stock Alert',
    message: 'Apple iPhone 15 Pro (256GB - Blue Titanium) is down to 2 units.',
    type: 'warning', // 'warning', 'info', 'danger', 'success'
    timestamp: '10 minutes ago',
    read: false,
    category: 'inventory',
  },
  {
    id: 'notif_2',
    title: 'Urgent Device Repair Ready',
    message: 'Repair #REP-2024-089 (Samsung S23 Ultra display change) is completed and ready for pickup.',
    type: 'success',
    timestamp: '35 minutes ago',
    read: false,
    category: 'repairs',
  },
  {
    id: 'notif_3',
    title: 'Warranty Expiry Approaching',
    message: 'Warranty for customer Kamal Perera (Sony WH-1000XM5) expires in 3 days.',
    type: 'info',
    timestamp: '2 hours ago',
    read: false,
    category: 'warranty',
  },
  {
    id: 'notif_4',
    title: 'Large Sale Completed',
    message: 'Cashier Chamari completed Invoice #INV-10492 for Rs. 485,000.00 (Split: Cash + Card).',
    type: 'success',
    timestamp: '3 hours ago',
    read: true,
    category: 'sales',
  },
  {
    id: 'notif_5',
    title: 'Supplier Shipment Received',
    message: 'Purchase Order #PO-8821 from Singer Sri Lanka PLC marked as received.',
    type: 'info',
    timestamp: '5 hours ago',
    read: true,
    category: 'purchases',
  },
]

export const useNotificationStore = create((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: `notif_${Date.now()}`,
          timestamp: 'Just now',
          read: false,
          ...notification,
        },
        ...state.notifications,
      ],
    }))
  },
}))

