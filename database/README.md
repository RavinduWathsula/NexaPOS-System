# NexaPOS Database Management

This directory contains the database structure, SQL dumps, and seed data for the **NexaPOS** Retail Management POS & ERP System.

---

## Files in this Directory

| File | Description |
| :--- | :--- |
| **`nexapos_db.sql`** | **Complete All-in-One Database Dump** (Schema + Seed Data). Creates the `nexapos_db` database, all tables, indexes, constraints, and inserts default roles, admin users, permissions, categories, brands, inventory items, and settings. |
| **`schema.sql`** | **DDL Schema Only**. Contains `CREATE TABLE`, primary keys, foreign keys, and indexes without any data records. |
| **`seed.sql`** | **Data Records Only**. SQL `INSERT` statements for pre-seeded staff roles, demo accounts, permissions, brands, categories, sample devices, and system settings. |

---

## How to Import the Database

### Method 1: MySQL Command Line (Recommended)

1. Open a terminal or PowerShell.
2. Run the following command (substitute your MySQL username/password if configured):
   ```bash
   mysql -u root -p < database/nexapos_db.sql
   ```
   *(If your root user has no password like default XAMPP, omit `-p`)*:
   ```bash
   mysql -u root < database/nexapos_db.sql
   ```

---

### Method 2: XAMPP phpMyAdmin

1. Start Apache & MySQL in the XAMPP Control Panel.
2. Open your web browser and go to `http://localhost/phpmyadmin`.
3. Click on the **Import** tab at the top.
4. Click **Choose File** and select `database/nexapos_db.sql`.
5. Click **Import** (or **Go**) at the bottom.
6. The `nexapos_db` database and all tables will be created and populated automatically.

---

### Method 3: MySQL Workbench / DBeaver

1. Open MySQL Workbench or DBeaver and connect to your MySQL server.
2. Go to **File -> Open SQL Script...** and select `database/nexapos_db.sql`.
3. Execute the script (`Ctrl + Shift + Enter` in Workbench).
4. Refresh the schema tree to view `nexapos_db`.

---

### Method 4: Docker (Quick MySQL Container)

If you prefer to run MySQL in a Docker container:
```bash
docker run --name nexapos-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=nexapos_db \
  -p 3306:3306 \
  -v $(pwd)/database/nexapos_db.sql:/docker-entrypoint-initdb.d/init.sql \
  -d mysql:8.0
```

---

## Database Connection Settings

Update `backend/.env` with your MySQL connection credentials:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/nexapos_db"
```

---

## Pre-seeded Default Accounts

After importing `nexapos_db.sql`, the following staff users are ready for immediate login:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@nexapos.lk` | `Password@123` |
| **Store Manager** | `manager@nexapos.lk` | `Password@123` |
| **Cashier** | `cashier@nexapos.lk` | `Password@123` |
| **Technician** | `tech@nexapos.lk` | `Password@123` |
| **Stock Keeper** | `stock@nexapos.lk` | `Password@123` |

---

## Schema Architecture Highlights

- **`user`, `role`, `permission`**: RBAC authentication with hashed passwords (`bcryptjs`).
- **`product`, `productvariant`, `category`, `brand`**: Product hierarchy supporting both serialized electronics and quantity-tracked accessories.
- **`device`, `devicestatushistory`**: Serialized device tracking with dual-IMEI (`imei1`, `imei2`), serial numbers, warranty dates, and life-cycle statuses (`IN_STOCK`, `RESERVED`, `SOLD`, `RETURNED`, `UNDER_REPAIR`, `DAMAGED`).
- **`inventory`, `stockmovement`**: Multi-channel stock management with transaction audits.
- **`supplier`, `purchase`, `purchaseitem`**: Procurement, goods received notes, and partial supplier payment ledgers.
- **`sale`, `saleitem`, `saleitemdevice`, `payment`**: Full point-of-sale billing engine supporting cash, card, bank transfer, and split payments.
- **`warranty`, `warrantyclaim`**: Automatic warranty provisioning from eligible POS sales and claim workflows.
- **`repairjob`, `repairpart`**: Workshop repair ticketing, diagnostics, parts consumption, technician assignments, and labor billing.
- **`return`, `returnitem`**: Sale item returns, serialized device inspection, and refund ledgers.
- **`cashsession`, `expense`**: Cash register shift drawer reconciliations and petty expense tracking.
- **`auditlog`**: Immutable audit logs capturing user actions, IP addresses, and state changes.

