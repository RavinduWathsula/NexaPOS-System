import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AdminDashboard } from './dashboards/AdminDashboard'
import { CashierDashboard } from './dashboards/CashierDashboard'
import { TechnicianDashboard } from './dashboards/TechnicianDashboard'
import { StockKeeperDashboard } from './dashboards/StockKeeperDashboard'

/**
 * Universal Role-Specific Dashboard Router
 * Renders dedicated professional operational dashboards based on the logged-in staff role:
 * - SUPER_ADMIN & MANAGER: Executive Financial & Operations Dashboard
 * - CASHIER: Counter Billing & Cash Shift Drawer Dashboard
 * - TECHNICIAN: Electronic Workshop & Repair Queue Dashboard
 * - STOCK_KEEPER: Warehouse & Serialized Inventory Dispatch Dashboard
 */
export function Dashboard() {
  const { user } = useAuthStore()

  if (user?.role === 'CASHIER') {
    return <CashierDashboard user={user} />
  }

  if (user?.role === 'TECHNICIAN') {
    return <TechnicianDashboard user={user} />
  }

  if (user?.role === 'STOCK_KEEPER') {
    return <StockKeeperDashboard user={user} />
  }

  // Default for SUPER_ADMIN and MANAGER
  return <AdminDashboard user={user} />
}

export default Dashboard
