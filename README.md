# NexaPOS — Enterprise Mobile Phone & Electronics Retail Management System

A high-performance, web-based POS and Retail Business Management System specifically engineered for Mobile Phone and Electronics Retail Stores in Sri Lanka.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-blue)
![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Prisma](https://img.shields.io/badge/ORM-Prisma%205-purple)
![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-orange)
![Currency](https://img.shields.io/badge/Default%20Currency-LKR%20(Rs.)-emerald)

---

## 🌟 Architecture & Completed Modules

NexaPOS provides an end-to-end retail operations platform:

| Module | Core Capabilities & Business Rules | Status |
|---|---|:---:|
| **Authentication & RBAC** | JWT authentication, bcrypt password hashing, session refresh, rate limiting, and 5 system roles (`SUPER_ADMIN`, `MANAGER`, `CASHIER`, `TECHNICIAN`, `STOCK_KEEPER`). | ✅ Production |
| **Catalog & Products** | Multi-variant products (Storage, RAM, Color, Model), category/brand hierarchies, barcode tracking, and image uploads. | ✅ Production |
| **IMEI & Serial Tracking** | Strict unique `imei1` and `serialNumber` enforcement, device lifecycles (`IN_STOCK`, `SOLD`, `RESERVED`, `UNDER_REPAIR`, `DEFECTIVE`, `DAMAGED`, `RETURNED`), and audit trails. | ✅ Production |
| **Inventory & Procurement** | Dual-inventory tracking (serialized units vs bulk quantity), low-stock thresholds, stock movements, supplier balances, and GRN receiving. | ✅ Production |
| **POS Billing Terminal** | Live product cards, category/brand filters, barcode/IMEI scanner, line-item discounts, split payments (Cash, Card, Transfer), and thermal receipt printing. | ✅ Production |
| **Customer Relationship** | Customer directory, purchase histories, outstanding balances, loyalty tiers, and warranty linkages. | ✅ Production |
| **Warranty Management** | Automatic warranty certificate generation upon POS sale, lookup by IMEI or invoice, claim submissions, and authorized approval workflows. | ✅ Production |
| **Repairs & Workshop** | Complete job ticket lifecycle (`RECEIVED` → `DIAGNOSING` → `WAITING_FOR_PARTS` → `REPAIRING` → `READY_FOR_PICKUP` → `DELIVERED`), spare parts deduction, and labor charges. | ✅ Production |
| **Business Intelligence** | Sales analytics, historical COGS gross/net profit reports, inventory valuation, supplier payables, and operating expense tracking. | ✅ Production |
| **Cash Register Sessions** | Cashier opening float, cash sales accumulation, expected closing balance, and discrepancy auditing. | ✅ Production |
| **Returns, Refunds & RMA** | Invoice return lookup, quantity overflow protection, returned device quarantine inspection, resellable restocking, and credit note issuance. | ✅ Production |
| **Security & Audit Trail** | Global rate limiting (300 req/15min), auth rate limiting (15 attempts/15min), and immutable tamper-evident activity logging with IP addresses. | ✅ Production |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Zustand State Management, Recharts, Axios.
- **Backend**: Node.js (ES Modules), Express.js, Prisma ORM, Helmet, CORS, Express-Rate-Limit, Zod Validator.
- **Database**: MySQL 8.0 with InnoDB engine, utf8mb4 encoding, foreign keys, and indexes.

---

## 📋 Prerequisites & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: 8.0+ running on `127.0.0.1:3306`

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install backend dependencies
cd backend && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Environment Configuration
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:password@127.0.0.1:3306/nexapos_db"
JWT_SECRET="your_secure_random_jwt_secret_here"
JWT_REFRESH_SECRET="your_secure_random_refresh_secret_here"
JWT_EXPIRES_IN="12h"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
DEFAULT_CURRENCY="LKR"
STORE_NAME="NexaPOS Mobile & Electronics (Pvt) Ltd"
STORE_BRANCH="Colombo Main Branch"
```

Create `client/.env` based on `client/.env.example`:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
VITE_APP_TITLE="NexaPOS - Electronics & Mobile Retail POS"
```

### 3. Database Migration & Seed
```bash
# Push schema to MySQL database
npm run db:push

# Seed roles, permissions, staff accounts, categories, brands & catalog
npm run db:seed
```

### 4. Running the Development Servers
In separate terminals:
```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm run server

# Terminal 2: Frontend Client (http://localhost:5173)
npm run client
```

---

## 🔐 Default Staff Accounts (Development)

| Name | Role | Email | Password |
|---|---|---|---|
| Kasun Jayawardena | Super Admin | `admin@nexapos.lk` | `Password@123` |
| Nimal Perera | Manager | `manager@nexapos.lk` | `Password@123` |
| Chamari Silva | Cashier | `cashier@nexapos.lk` | `Password@123` |
| Dinesh Fernando | Technician | `tech@nexapos.lk` | `Password@123` |
| Roshan Wickrama | Stock Keeper | `stock@nexapos.lk` | `Password@123` |

---

## 🚀 Production Deployment Guide

### 1. Build Frontend
```bash
npm run build --prefix client
```
This generates optimized, minified production assets in `client/dist`.

### 2. Process Management (PM2)
NexaPOS includes an ecosystem file for PM2 (`backend/ecosystem.config.cjs`):
```bash
# Start backend in cluster mode
cd backend
pm2 start ecosystem.config.cjs --env production

# Verify process status
pm2 status

# Save configuration for automatic startup on server boot
pm2 save
pm2 startup
```

### 3. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name pos.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pos.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/pos.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pos.yourdomain.com/privkey.pem;

    # Frontend Static Files
    root /var/www/nexapos/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 💾 Database Backup & Disaster Recovery

### Automated Database Backup (`mysqldump`)
```bash
# Daily Backup Command (compressed)
mysqldump -u root -p nexapos_db --single-transaction --quick --lock-tables=false | gzip > /backups/nexapos_db_$(date +%Y%m%d_%H%M%S).sql.gz

# Schedule via Crontab (Runs daily at 2:00 AM)
0 2 * * * mysqldump -u root -p'YOUR_PASSWORD' nexapos_db --single-transaction --quick | gzip > /backups/nexapos_db_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore Procedure
```bash
# 1. Unpack backup
gunzip < /backups/nexapos_db_20261114.sql.gz > /tmp/restore.sql

# 2. Restore into MySQL
mysql -u root -p nexapos_db < /tmp/restore.sql
```

---

## 🧪 Quality Assurance & Test Verification

The NexaPOS test suite validates:
- **Authentication & Security**: Multi-role RBAC enforcement, invalid login handling, rate limiting.
- **Complete Business Lifecycle 1**: Supplier → PO → Good Receiving → POS Sale → Payment → Receipt → Warranty.
- **Complete Business Lifecycle 2**: Customer → Repair Ticket → Diagnostics → Payment → Delivery.
- **Concurrency & Data Integrity**: Concurrent race-condition prevention on serialized IMEI sales, duplicate IMEI constraints, historical cost preservation, and atomic inventory transactions.

All 17 integration benchmarks execute cleanly with **0 failures**.

---

## 📄 License
This project is licensed under the MIT License.
