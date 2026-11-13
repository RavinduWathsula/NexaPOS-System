# NexaPOS — Enterprise Mobile Phone & Electronics Retail Management System

A modern, high-performance, web-based POS and Business Management System specifically engineered for Mobile Phone and Electronics Retail Stores in Sri Lanka.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue)
![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Prisma](https://img.shields.io/badge/ORM-Prisma-purple)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Currency](https://img.shields.io/badge/Default%20Currency-LKR%20(Rs.)-emerald)

---

## 🌟 Key Features

- **Strict Serial Number & IMEI Tracking**: Prevents duplicate sales; tracks IMEI 1, IMEI 2, battery health, and warranty status.
- **Dual-Model Inventory**: Handles individual serialized smartphones and bulk quantity-based electronics accessories.
- **High-Performance POS Terminal**: Tablet- and desktop-optimized fast billing with barcode scanner support, cart management, and split payments (Cash, Card, Bank Transfer, Koko Installments).
- **Automated Digital Warranty Engine**: Generates warranty records upon sale completion linked directly to device IMEIs.
- **Mobile Repair & Workshop Queue**: Technician ticket management, diagnostics, and spare parts tracking.
- **Role-Based Access Control (RBAC)**: Backend and frontend enforcement for 5 staff roles:
  1. Super Admin / Owner
  2. Store Manager
  3. Cashier
  4. Repair Technician
  5. Stock Keeper
- **Sri Lankan Rupee (LKR) Native**: Precise accounting using `Decimal(12,2)` precision.

---

## 🏗️ Architecture & Technology Stack

### Frontend (`/client`)
- **React 18 & Vite**
- **Tailwind CSS** with custom dark navy (`#0B132B`) and electric blue (`#3B82F6`) theme
- **Zustand** state stores for Auth, Theme, and Notifications
- **React Router v6** with nested layout and protected routes
- **Recharts** for sales and revenue analytics
- **Lucide React** icons & **Axios** with JWT Bearer interceptors

### Backend (`/backend`)
- **Node.js & Express.js REST API**
- **Prisma ORM** with **MySQL** database (`nexapos_db`)
- **JWT Authentication** (Access tokens & Refresh tokens)
- **bcryptjs** password hashing
- **Zod** schema validation for all endpoints
- **Helmet, CORS & Morgan** security middleware

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **MySQL** (MySQL 8.x running on port `3306`)

### 1. Clone the Repository
```bash
git clone https://github.com/RavinduWathsula/NexaPOS-System.git
cd NexaPOS-System
```

### 2. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:@127.0.0.1:3306/nexapos_db"
JWT_SECRET="nexapos_super_secret_jwt_key_2024_secure_retail_pos"
JWT_REFRESH_SECRET="nexapos_refresh_secret_key_2024_long_lived_token"
JWT_EXPIRES_IN="12h"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
DEFAULT_CURRENCY="LKR"
STORE_NAME="NexaPOS Mobile & Electronics (Pvt) Ltd"
STORE_BRANCH="Colombo Main Branch"
```

### 3. Setup Database & Seed Initial Data
```bash
# Push Prisma schema to MySQL
npm run db:push

# Seed default roles, staff accounts, categories, brands, & IMEI devices
npm run db:seed
```

### 4. Run Development Servers
```bash
# Start Backend REST API (http://localhost:5000)
npm run server

# In a separate terminal, start Frontend Client (http://localhost:5173)
npm run client
```

---

## 🔐 Default Demo Accounts (Development)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin / Owner** | `admin@nexapos.lk` | `Password@123` |
| **Store Manager** | `manager@nexapos.lk` | `Password@123` |
| **Cashier** | `cashier@nexapos.lk` | `Password@123` |
| **Repair Technician** | `tech@nexapos.lk` | `Password@123` |
| **Stock Keeper** | `stock@nexapos.lk` | `Password@123` |

---

## 📄 License
MIT License. Developed for NexaPOS Enterprise.

