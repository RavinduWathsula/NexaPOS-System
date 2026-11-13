import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Core Pages
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'
import { Unauthorized } from '@/pages/Unauthorized'

// Modules
import { POSTerminal } from '@/pages/modules/POSTerminal'
import { Products } from '@/pages/modules/Products'
import { Categories } from '@/pages/modules/Categories'
import { Brands } from '@/pages/modules/Brands'
import { IMEIDevices } from '@/pages/modules/IMEIDevices'
import { Inventory } from '@/pages/modules/Inventory'
import { Purchases } from '@/pages/modules/Purchases'
import { Suppliers } from '@/pages/modules/Suppliers'
import { Customers } from '@/pages/modules/Customers'
import { SalesInvoices } from '@/pages/modules/SalesInvoices'
import { WarrantyManagement } from '@/pages/modules/WarrantyManagement'
import { RepairManagement } from '@/pages/modules/RepairManagement'
import { Employees } from '@/pages/modules/Employees'
import { ReportsAnalytics } from '@/pages/modules/ReportsAnalytics'
import { ExpensesFinance } from '@/pages/modules/ExpensesFinance'
import { Settings } from '@/pages/modules/Settings'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Admin / POS Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Universal Authorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Dashboard: Super Admin & Manager */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* POS Terminal: Super Admin, Manager, Cashier */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CASHIER']} />}>
            <Route path="/pos" element={<POSTerminal />} />
          </Route>

          {/* Catalog & Inventory: Super Admin, Manager, Stock Keeper */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER']} />}>
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>

          {/* IMEI & Devices: Super Admin, Manager, Stock Keeper, Technician */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER', 'TECHNICIAN']} />}>
            <Route path="/imei-devices" element={<IMEIDevices />} />
          </Route>

          {/* Sales & Customers: Super Admin, Manager, Cashier */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'CASHIER']} />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/sales-invoices" element={<SalesInvoices />} />
          </Route>

          {/* Repairs & Warranty: Super Admin, Manager, Technician */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER', 'TECHNICIAN']} />}>
            <Route path="/warranty-management" element={<WarrantyManagement />} />
            <Route path="/repair-management" element={<RepairManagement />} />
          </Route>

          {/* Reports & Financials: Super Admin, Manager */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']} />}>
            <Route path="/reports-analytics" element={<ReportsAnalytics />} />
            <Route path="/expenses-finance" element={<ExpensesFinance />} />
          </Route>

          {/* Administration & System Configuration: Super Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
