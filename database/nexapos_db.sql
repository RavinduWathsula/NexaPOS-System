-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: nexapos_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `nexapos_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nexapos_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `nexapos_db`;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `performedById` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_performedById_idx` (`performedById`),
  KEY `AuditLog_action_idx` (`action`),
  KEY `AuditLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `AuditLog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brand` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `country` varchar(191) DEFAULT NULL,
  `logoUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Brand_name_key` (`name`),
  UNIQUE KEY `Brand_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashsession`
--

DROP TABLE IF EXISTS `cashsession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cashsession` (
  `id` varchar(191) NOT NULL,
  `cashierId` varchar(191) NOT NULL,
  `openedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `closedAt` datetime(3) DEFAULT NULL,
  `openingBalance` decimal(12,2) NOT NULL,
  `closingBalance` decimal(12,2) DEFAULT NULL,
  `expectedBalance` decimal(12,2) DEFAULT NULL,
  `difference` decimal(12,2) DEFAULT NULL,
  `status` enum('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CashSession_cashierId_idx` (`cashierId`),
  CONSTRAINT `CashSession_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashsession`
--

LOCK TABLES `cashsession` WRITE;
/*!40000 ALTER TABLE `cashsession` DISABLE KEYS */;
/*!40000 ALTER TABLE `cashsession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_slug_key` (`slug`),
  KEY `Category_parentId_idx` (`parentId`),
  CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `nic` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `loyaltyTier` varchar(191) NOT NULL DEFAULT 'STANDARD',
  `loyaltyPoints` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Customer_phone_key` (`phone`),
  KEY `Customer_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `imei1` varchar(191) NOT NULL,
  `imei2` varchar(191) DEFAULT NULL,
  `serialNumber` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `storage` varchar(191) DEFAULT NULL,
  `batteryHealth` int(11) DEFAULT NULL,
  `purchaseCost` decimal(12,2) NOT NULL,
  `sellingPrice` decimal(12,2) DEFAULT NULL,
  `status` enum('IN_STOCK','SOLD','RESERVED','UNDER_REPAIR','DEFECTIVE','DAMAGED','RETURNED') NOT NULL DEFAULT 'IN_STOCK',
  `purchaseId` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Device_imei1_key` (`imei1`),
  UNIQUE KEY `Device_serialNumber_key` (`serialNumber`),
  KEY `Device_productId_idx` (`productId`),
  KEY `Device_variantId_idx` (`variantId`),
  KEY `Device_status_idx` (`status`),
  KEY `Device_purchaseId_fkey` (`purchaseId`),
  CONSTRAINT `Device_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Device_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Device_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devicestatushistory`
--

DROP TABLE IF EXISTS `devicestatushistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devicestatushistory` (
  `id` varchar(191) NOT NULL,
  `deviceId` varchar(191) NOT NULL,
  `fromStatus` enum('IN_STOCK','SOLD','RESERVED','UNDER_REPAIR','DEFECTIVE','DAMAGED','RETURNED') NOT NULL,
  `toStatus` enum('IN_STOCK','SOLD','RESERVED','UNDER_REPAIR','DEFECTIVE','DAMAGED','RETURNED') NOT NULL,
  `changedById` varchar(191) DEFAULT NULL,
  `reason` varchar(191) DEFAULT NULL,
  `referenceId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `DeviceStatusHistory_deviceId_idx` (`deviceId`),
  CONSTRAINT `DeviceStatusHistory_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `device` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devicestatushistory`
--

LOCK TABLES `devicestatushistory` WRITE;
/*!40000 ALTER TABLE `devicestatushistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `devicestatushistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paymentMethod` enum('CASH','CARD','BANK_TRANSFER','CHEQUE','INSTALLMENT_KOKO','SPLIT') NOT NULL DEFAULT 'CASH',
  `expenseDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Expense_createdById_idx` (`createdById`),
  KEY `Expense_expenseDate_idx` (`expenseDate`),
  CONSTRAINT `Expense_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reorderLevel` int(11) NOT NULL DEFAULT 5,
  `location` varchar(191) DEFAULT NULL,
  `branch` varchar(191) NOT NULL DEFAULT 'Colombo Main',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Inventory_productId_branch_key` (`productId`,`branch`),
  KEY `Inventory_productId_idx` (`productId`),
  CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment` (
  `id` varchar(191) NOT NULL,
  `saleId` varchar(191) DEFAULT NULL,
  `purchaseId` varchar(191) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` enum('CASH','CARD','BANK_TRANSFER','CHEQUE','INSTALLMENT_KOKO','SPLIT') NOT NULL,
  `cardLastFour` varchar(191) DEFAULT NULL,
  `transactionRef` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `paymentDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `repairJobId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Payment_saleId_idx` (`saleId`),
  KEY `Payment_purchaseId_idx` (`purchaseId`),
  KEY `Payment_repairJobId_idx` (`repairJobId`),
  CONSTRAINT `Payment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Payment_repairJobId_fkey` FOREIGN KEY (`repairJobId`) REFERENCES `repairjob` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Payment_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `module` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_code_key` (`code`),
  KEY `Permission_module_idx` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('024553cf-e850-4771-ae2f-81239d7bbf28','sales:create','Process Sales & Invoices','pos',NULL,'2026-11-13 17:54:00.744'),('08a4f36f-bc13-44fa-b7b7-2087a09dfe65','sales:refund','Issue Returns & Refunds','pos',NULL,'2026-11-13 17:54:00.751'),('0d786c6f-5b8f-499e-8dc2-a8cc385af077','sales:view_own','View Own Sales History','pos',NULL,'2026-11-13 18:32:36.242'),('1aaa3ad4-dbfb-487c-924e-7afda386bf6c','products:view','View Catalog','inventory',NULL,'2026-11-13 17:54:00.754'),('21d3c73a-b1cd-4ded-a060-d797a6312cf7','settings:manage','System Settings & Config','admin',NULL,'2026-11-13 17:54:00.788'),('26bf25ba-d2f2-4519-92bc-9251c7e61167','inventory:adjust','Stock Adjustments & Transfers','inventory',NULL,'2026-11-13 17:54:00.764'),('2c83a3b2-d1d7-4259-bb07-2682de9e7138','repairs:manage','Manage Repair Jobs','repairs',NULL,'2026-11-13 17:54:00.773'),('3ef31572-ea28-4d1c-ad11-81b652990aff','pos:print','Print Receipts & Invoices','pos',NULL,'2026-11-13 18:32:36.232'),('47af7d9e-2bac-4d3c-914a-45e66088941c','warranty:manage','Issue & Claim Warranties','repairs',NULL,'2026-11-13 17:54:00.776'),('69e9fc3b-26c7-4f0a-9839-424cf0a2e7ac','sales:view','View Sales History','pos',NULL,'2026-11-13 17:54:00.747'),('6f98daf1-022b-4555-9ad2-207f1b4bcf20','repairs:view','View Repairs Queue','repairs',NULL,'2026-11-13 18:32:36.271'),('753bf143-8c40-456e-9958-117c1d079592','repairs:status_update','Update Repair Job Status','repairs',NULL,'2026-11-13 18:32:36.278'),('76cee6e7-8b5c-46ab-a7f8-a224f8492c4f','suppliers:manage','Manage Suppliers','procurement',NULL,'2026-11-13 17:54:00.770'),('7cda7f1e-333d-466d-8352-e64b79245c44','repairs:assigned','View Assigned Repair Jobs','repairs',NULL,'2026-11-13 18:32:36.276'),('8712a93a-d489-43a4-88a9-4981a9612f79','imei:register','Register Serial & IMEI','inventory',NULL,'2026-11-13 17:54:00.761'),('9b89dfa3-5a98-4d27-8a79-c1ab0a704d5e','customers:create','Register Customers','customers',NULL,'2026-11-13 18:32:36.268'),('9d1da32e-ac9f-4f4a-978f-73635050bcd5','purchases:receive','Stock Receiving & Intake','procurement',NULL,'2026-11-13 18:32:36.261'),('9dfbcbe6-20f0-45c0-8b35-05f9e2c3d004','inventory:view','View Inventory Levels','inventory',NULL,'2026-11-13 18:32:36.254'),('b4bd52a4-8add-41b0-8844-8909a72a4e35','expenses:manage','Record Operating Expenses','finance',NULL,'2026-11-13 17:54:00.782'),('c235d5b9-afec-4dbd-a2eb-8ac4618f5c0e','customers:manage','Manage Customers','customers',NULL,'2026-11-13 18:32:36.265'),('ce317449-67cb-4fed-acfa-90c6ebef8da8','pos:access','Access POS Terminal','pos',NULL,'2026-11-13 17:54:00.738'),('dc26296e-9380-4b4c-81db-62ca5c904295','products:manage','Manage Products & Prices','inventory',NULL,'2026-11-13 17:54:00.757'),('f322e979-116b-4651-9121-f2ea57d8c825','purchases:manage','Manage Purchase Orders','procurement',NULL,'2026-11-13 17:54:00.766'),('f5f60f10-de8a-4aa1-883d-7b4c1eddc52a','reports:view','View Financial Analytics','finance',NULL,'2026-11-13 17:54:00.779'),('fc7c9dee-2dcb-41ec-9e95-4dbf24d746a0','users:manage','Manage Staff & Roles','admin',NULL,'2026-11-13 17:54:00.785');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `categoryId` varchar(191) NOT NULL,
  `brandId` varchar(191) DEFAULT NULL,
  `isSerialized` tinyint(1) NOT NULL DEFAULT 0,
  `costPrice` decimal(12,2) NOT NULL,
  `retailPrice` decimal(12,2) NOT NULL,
  `minPrice` decimal(12,2) DEFAULT NULL,
  `defaultWarrantyMonths` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_sku_key` (`sku`),
  UNIQUE KEY `Product_barcode_key` (`barcode`),
  KEY `Product_categoryId_idx` (`categoryId`),
  KEY `Product_brandId_idx` (`brandId`),
  KEY `Product_isSerialized_idx` (`isSerialized`),
  CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimage`
--

DROP TABLE IF EXISTS `productimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productimage` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `ProductImage_productId_idx` (`productId`),
  CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimage`
--

LOCK TABLES `productimage` WRITE;
/*!40000 ALTER TABLE `productimage` DISABLE KEYS */;
/*!40000 ALTER TABLE `productimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productvariant` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `storage` varchar(191) DEFAULT NULL,
  `ram` varchar(191) DEFAULT NULL,
  `costPrice` decimal(12,2) DEFAULT NULL,
  `retailPrice` decimal(12,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `model` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductVariant_sku_key` (`sku`),
  KEY `ProductVariant_productId_idx` (`productId`),
  CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productvariant`
--

LOCK TABLES `productvariant` WRITE;
/*!40000 ALTER TABLE `productvariant` DISABLE KEYS */;
/*!40000 ALTER TABLE `productvariant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase` (
  `id` varchar(191) NOT NULL,
  `poNumber` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `createdById` varchar(191) NOT NULL,
  `orderDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deliveryDate` datetime(3) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(12,2) NOT NULL,
  `paidAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paymentStatus` enum('UNPAID','PARTIALLY_PAID','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `status` enum('ORDERED','PARTIALLY_RECEIVED','RECEIVED','CANCELLED') NOT NULL DEFAULT 'ORDERED',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `supplierInvoiceNumber` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Purchase_poNumber_key` (`poNumber`),
  KEY `Purchase_supplierId_idx` (`supplierId`),
  KEY `Purchase_createdById_idx` (`createdById`),
  KEY `Purchase_poNumber_idx` (`poNumber`),
  CONSTRAINT `Purchase_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Purchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase`
--

LOCK TABLES `purchase` WRITE;
/*!40000 ALTER TABLE `purchase` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseitem`
--

DROP TABLE IF EXISTS `purchaseitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchaseitem` (
  `id` varchar(191) NOT NULL,
  `purchaseId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitCost` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PurchaseItem_purchaseId_idx` (`purchaseId`),
  KEY `PurchaseItem_productId_idx` (`productId`),
  CONSTRAINT `PurchaseItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `PurchaseItem_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseitem`
--

LOCK TABLES `purchaseitem` WRITE;
/*!40000 ALTER TABLE `purchaseitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchaseitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repairjob`
--

DROP TABLE IF EXISTS `repairjob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `repairjob` (
  `id` varchar(191) NOT NULL,
  `ticketNumber` varchar(191) NOT NULL,
  `customerId` varchar(191) NOT NULL,
  `technicianId` varchar(191) DEFAULT NULL,
  `deviceModel` varchar(191) NOT NULL,
  `imei` varchar(191) DEFAULT NULL,
  `serialNumber` varchar(191) DEFAULT NULL,
  `passcode` varchar(191) DEFAULT NULL,
  `issueDescription` text NOT NULL,
  `diagnosis` text DEFAULT NULL,
  `estimatedCost` decimal(12,2) NOT NULL,
  `finalCost` decimal(12,2) DEFAULT NULL,
  `status` enum('RECEIVED','DIAGNOSING','WAITING_FOR_PARTS','IN_PROGRESS','REPAIRING','READY_FOR_PICKUP','COMPLETED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'RECEIVED',
  `priority` enum('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
  `receivedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `accessoriesReceived` varchar(191) DEFAULT NULL,
  `advancePaid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `expectedCompletionDate` datetime(3) DEFAULT NULL,
  `laborCost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `physicalCondition` varchar(191) DEFAULT NULL,
  `serviceNotes` text DEFAULT NULL,
  `warrantyClaimId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RepairJob_ticketNumber_key` (`ticketNumber`),
  KEY `RepairJob_customerId_idx` (`customerId`),
  KEY `RepairJob_technicianId_idx` (`technicianId`),
  KEY `RepairJob_ticketNumber_idx` (`ticketNumber`),
  KEY `RepairJob_status_idx` (`status`),
  CONSTRAINT `RepairJob_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `RepairJob_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repairjob`
--

LOCK TABLES `repairjob` WRITE;
/*!40000 ALTER TABLE `repairjob` DISABLE KEYS */;
/*!40000 ALTER TABLE `repairjob` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repairpart`
--

DROP TABLE IF EXISTS `repairpart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `repairpart` (
  `id` varchar(191) NOT NULL,
  `repairJobId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `partName` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unitCost` decimal(12,2) NOT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RepairPart_repairJobId_idx` (`repairJobId`),
  KEY `RepairPart_productId_idx` (`productId`),
  CONSTRAINT `RepairPart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `RepairPart_repairJobId_fkey` FOREIGN KEY (`repairJobId`) REFERENCES `repairjob` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repairpart`
--

LOCK TABLES `repairpart` WRITE;
/*!40000 ALTER TABLE `repairpart` DISABLE KEYS */;
/*!40000 ALTER TABLE `repairpart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return`
--

DROP TABLE IF EXISTS `return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `return` (
  `id` varchar(191) NOT NULL,
  `returnNumber` varchar(191) NOT NULL,
  `saleId` varchar(191) NOT NULL,
  `customerId` varchar(191) DEFAULT NULL,
  `totalRefund` decimal(12,2) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `refundMethod` enum('CASH','CARD','BANK_TRANSFER','CHEQUE','INSTALLMENT_KOKO','SPLIT') NOT NULL DEFAULT 'CASH',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approvedAt` datetime(3) DEFAULT NULL,
  `approvedById` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  `inspectionNotes` varchar(191) DEFAULT NULL,
  `rejectionReason` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `type` enum('REFUND','EXCHANGE') NOT NULL DEFAULT 'REFUND',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Return_returnNumber_key` (`returnNumber`),
  KEY `Return_saleId_idx` (`saleId`),
  KEY `Return_customerId_idx` (`customerId`),
  KEY `Return_status_idx` (`status`),
  KEY `Return_approvedById_fkey` (`approvedById`),
  KEY `Return_createdById_fkey` (`createdById`),
  CONSTRAINT `Return_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Return_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Return_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Return_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return`
--

LOCK TABLES `return` WRITE;
/*!40000 ALTER TABLE `return` DISABLE KEYS */;
/*!40000 ALTER TABLE `return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returnitem`
--

DROP TABLE IF EXISTS `returnitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `returnitem` (
  `id` varchar(191) NOT NULL,
  `returnId` varchar(191) NOT NULL,
  `saleItemId` varchar(191) NOT NULL,
  `deviceId` varchar(191) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `refundAmount` decimal(12,2) NOT NULL,
  `condition` varchar(191) DEFAULT NULL,
  `isRestocked` tinyint(1) NOT NULL DEFAULT 0,
  `restockedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ReturnItem_returnId_idx` (`returnId`),
  KEY `ReturnItem_saleItemId_idx` (`saleItemId`),
  KEY `ReturnItem_deviceId_idx` (`deviceId`),
  CONSTRAINT `ReturnItem_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `device` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReturnItem_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `return` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReturnItem_saleItemId_fkey` FOREIGN KEY (`saleItemId`) REFERENCES `saleitem` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returnitem`
--

LOCK TABLES `returnitem` WRITE;
/*!40000 ALTER TABLE `returnitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `returnitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `displayName` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('73ffe0e8-fd97-4996-9259-f18597f0850f','SUPER_ADMIN','Super Admin / Owner','Full unrestricted system, financial and operational access.',1,'2026-11-13 17:54:00.667','2026-11-13 18:32:36.204'),('8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','MANAGER','Store Manager','Store operations, purchases, inventory, sales and reports.',1,'2026-11-13 17:54:00.725','2026-11-13 18:32:36.211'),('a925459d-0362-462f-81c5-efd3a44975c0','CASHIER','Cashier','POS sales terminal, customer invoice creation and daily cash register.',1,'2026-11-13 17:54:00.728','2026-11-13 18:32:36.215'),('cc044292-2880-4f89-9bf1-13068026e275','STOCK_KEEPER','Stock Keeper','Warehouse stock intake, IMEI serial registration and inventory movements.',1,'2026-11-13 17:54:00.735','2026-11-13 18:32:36.223'),('faa67fbe-8307-414b-abcf-bac75e0d23e9','TECHNICIAN','Repair Technician','Device repair management, diagnostics and warranty verification.',1,'2026-11-13 17:54:00.731','2026-11-13 18:32:36.219');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermission`
--

DROP TABLE IF EXISTS `rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rolepermission` (
  `id` varchar(191) NOT NULL,
  `roleId` varchar(191) NOT NULL,
  `permissionId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RolePermission_roleId_permissionId_key` (`roleId`,`permissionId`),
  KEY `RolePermission_roleId_idx` (`roleId`),
  KEY `RolePermission_permissionId_idx` (`permissionId`),
  CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermission`
--

LOCK TABLES `rolepermission` WRITE;
/*!40000 ALTER TABLE `rolepermission` DISABLE KEYS */;
INSERT INTO `rolepermission` VALUES ('bf0aa104-ab5f-4b0b-b6d7-c0c0644b5596','73ffe0e8-fd97-4996-9259-f18597f0850f','024553cf-e850-4771-ae2f-81239d7bbf28'),('880c740a-d77c-4aaf-b0de-232e9b57ce6b','73ffe0e8-fd97-4996-9259-f18597f0850f','08a4f36f-bc13-44fa-b7b7-2087a09dfe65'),('c648da0f-0b0f-45bc-97aa-46bb81c26451','73ffe0e8-fd97-4996-9259-f18597f0850f','0d786c6f-5b8f-499e-8dc2-a8cc385af077'),('55dcd620-2b07-4265-b99e-4c2713804e04','73ffe0e8-fd97-4996-9259-f18597f0850f','1aaa3ad4-dbfb-487c-924e-7afda386bf6c'),('b7932cf7-ecb7-463c-9344-744d46fb8f92','73ffe0e8-fd97-4996-9259-f18597f0850f','21d3c73a-b1cd-4ded-a060-d797a6312cf7'),('cf8c2b14-404c-4070-a9da-b27042beb0fc','73ffe0e8-fd97-4996-9259-f18597f0850f','26bf25ba-d2f2-4519-92bc-9251c7e61167'),('c5caf050-f20d-400b-9cce-6d6cd728a386','73ffe0e8-fd97-4996-9259-f18597f0850f','2c83a3b2-d1d7-4259-bb07-2682de9e7138'),('d65fdc22-e8e5-4fbb-8e97-8ef35158e1b1','73ffe0e8-fd97-4996-9259-f18597f0850f','3ef31572-ea28-4d1c-ad11-81b652990aff'),('366fa7fa-bb80-4967-a555-d960c262f3f3','73ffe0e8-fd97-4996-9259-f18597f0850f','47af7d9e-2bac-4d3c-914a-45e66088941c'),('058c2edc-2087-4fb9-86b4-14a2eed56b11','73ffe0e8-fd97-4996-9259-f18597f0850f','69e9fc3b-26c7-4f0a-9839-424cf0a2e7ac'),('a566ce05-fc8e-4028-a4d3-4103f093651c','73ffe0e8-fd97-4996-9259-f18597f0850f','6f98daf1-022b-4555-9ad2-207f1b4bcf20'),('ea794a83-f1bc-4cef-aa8e-c974eb820344','73ffe0e8-fd97-4996-9259-f18597f0850f','753bf143-8c40-456e-9958-117c1d079592'),('df67ccca-6c58-4ab4-b976-c077027d5d22','73ffe0e8-fd97-4996-9259-f18597f0850f','76cee6e7-8b5c-46ab-a7f8-a224f8492c4f'),('eab77d97-5dba-409f-b898-9b4449609bd2','73ffe0e8-fd97-4996-9259-f18597f0850f','7cda7f1e-333d-466d-8352-e64b79245c44'),('36154868-27e8-46b5-926e-558554bba289','73ffe0e8-fd97-4996-9259-f18597f0850f','8712a93a-d489-43a4-88a9-4981a9612f79'),('76cb6683-dd53-45e5-b9ca-64ef90529cfc','73ffe0e8-fd97-4996-9259-f18597f0850f','9b89dfa3-5a98-4d27-8a79-c1ab0a704d5e'),('e9c5241a-41ea-4a3e-a210-f5360386b462','73ffe0e8-fd97-4996-9259-f18597f0850f','9d1da32e-ac9f-4f4a-978f-73635050bcd5'),('219e867b-1749-4d1a-a661-822ed1372d7b','73ffe0e8-fd97-4996-9259-f18597f0850f','9dfbcbe6-20f0-45c0-8b35-05f9e2c3d004'),('0923d950-8ede-47c7-925e-93af42971914','73ffe0e8-fd97-4996-9259-f18597f0850f','b4bd52a4-8add-41b0-8844-8909a72a4e35'),('158bcbb8-761f-4fe3-a4de-2a51d475816c','73ffe0e8-fd97-4996-9259-f18597f0850f','c235d5b9-afec-4dbd-a2eb-8ac4618f5c0e'),('df8c4cd9-e878-4784-a9ad-385b8fa88115','73ffe0e8-fd97-4996-9259-f18597f0850f','ce317449-67cb-4fed-acfa-90c6ebef8da8'),('17c7e7cc-2533-4e0c-a84e-b887ce65d573','73ffe0e8-fd97-4996-9259-f18597f0850f','dc26296e-9380-4b4c-81db-62ca5c904295'),('b5465fee-315d-4241-a223-8924f5309433','73ffe0e8-fd97-4996-9259-f18597f0850f','f322e979-116b-4651-9121-f2ea57d8c825'),('f808b252-ccfe-4048-b737-7433f2ded611','73ffe0e8-fd97-4996-9259-f18597f0850f','f5f60f10-de8a-4aa1-883d-7b4c1eddc52a'),('d20df97c-da61-4de8-928d-3c25630a8b63','73ffe0e8-fd97-4996-9259-f18597f0850f','fc7c9dee-2dcb-41ec-9e95-4dbf24d746a0'),('1ac100f8-e510-4d34-96a8-885424cf2c81','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','024553cf-e850-4771-ae2f-81239d7bbf28'),('7f288013-c8e8-4fc9-8cd7-d130b03091a3','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','08a4f36f-bc13-44fa-b7b7-2087a09dfe65'),('08f8849e-dba1-485d-9ca6-ea148f3d351c','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','1aaa3ad4-dbfb-487c-924e-7afda386bf6c'),('ef818f37-3078-44b5-b8f3-9061892397c2','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','26bf25ba-d2f2-4519-92bc-9251c7e61167'),('8071cb5a-5e2c-41d2-b154-fe4c4d186fed','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','3ef31572-ea28-4d1c-ad11-81b652990aff'),('5b9288d1-95ff-4a30-aa50-e9755d4ba0ee','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','47af7d9e-2bac-4d3c-914a-45e66088941c'),('893ebdeb-0288-4161-aa36-ac1bf6f7cec1','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','69e9fc3b-26c7-4f0a-9839-424cf0a2e7ac'),('4dac8160-2fce-4e69-b327-06c3f92efa84','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','6f98daf1-022b-4555-9ad2-207f1b4bcf20'),('c97ad711-557d-4cb2-9935-b4d21186f193','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','76cee6e7-8b5c-46ab-a7f8-a224f8492c4f'),('641e23ff-a51e-44fd-b504-5b3471e4b515','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','8712a93a-d489-43a4-88a9-4981a9612f79'),('aa8ca1b4-64d9-4c16-863e-09fc6fcfaf5c','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','9b89dfa3-5a98-4d27-8a79-c1ab0a704d5e'),('0c39ee10-7169-4ae5-8579-a4294cb32aee','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','9d1da32e-ac9f-4f4a-978f-73635050bcd5'),('9081b160-cf6d-418c-be4d-ab641b5b8c02','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','9dfbcbe6-20f0-45c0-8b35-05f9e2c3d004'),('7e07719a-936a-4eb0-9a8c-770719c80afd','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','b4bd52a4-8add-41b0-8844-8909a72a4e35'),('3f510db8-f3ab-42ed-b9ac-4db8e5ea045a','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','c235d5b9-afec-4dbd-a2eb-8ac4618f5c0e'),('02d4a2d5-8677-4403-9333-b986e80a6109','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','ce317449-67cb-4fed-acfa-90c6ebef8da8'),('9910add3-a245-4a11-b289-4240eed1b471','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','dc26296e-9380-4b4c-81db-62ca5c904295'),('46248873-fd6a-4701-81ed-7fde2d9dde06','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','f322e979-116b-4651-9121-f2ea57d8c825'),('52d3a462-156e-4fb7-8ea5-db59f89c2d2a','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47','f5f60f10-de8a-4aa1-883d-7b4c1eddc52a'),('2817248a-5e4d-4944-a004-ef184576f817','a925459d-0362-462f-81c5-efd3a44975c0','024553cf-e850-4771-ae2f-81239d7bbf28'),('36ead5d6-d7a8-4b45-9a1e-e0f04356d524','a925459d-0362-462f-81c5-efd3a44975c0','0d786c6f-5b8f-499e-8dc2-a8cc385af077'),('8d0d63b2-79a9-41da-9f87-c9d857852de8','a925459d-0362-462f-81c5-efd3a44975c0','3ef31572-ea28-4d1c-ad11-81b652990aff'),('1e42225a-a7d7-4245-b957-23e1f31e5561','a925459d-0362-462f-81c5-efd3a44975c0','9b89dfa3-5a98-4d27-8a79-c1ab0a704d5e'),('f1271f8c-9fef-4396-a8d3-bf23a7acd757','a925459d-0362-462f-81c5-efd3a44975c0','ce317449-67cb-4fed-acfa-90c6ebef8da8'),('61710b9c-b3a3-41ae-8b57-ef8aa31ab18a','cc044292-2880-4f89-9bf1-13068026e275','1aaa3ad4-dbfb-487c-924e-7afda386bf6c'),('51e68978-b83f-4b6d-8c2d-b31900de4cd1','cc044292-2880-4f89-9bf1-13068026e275','26bf25ba-d2f2-4519-92bc-9251c7e61167'),('13916ba6-6189-4c40-9751-73066aad74b5','cc044292-2880-4f89-9bf1-13068026e275','8712a93a-d489-43a4-88a9-4981a9612f79'),('73d1dd77-eea7-495a-815f-2790ef5ceb39','cc044292-2880-4f89-9bf1-13068026e275','9d1da32e-ac9f-4f4a-978f-73635050bcd5'),('37d8c3ce-3a8e-40b2-9f47-2aa4bfd5d565','cc044292-2880-4f89-9bf1-13068026e275','9dfbcbe6-20f0-45c0-8b35-05f9e2c3d004'),('8aa7f2aa-c831-4963-9460-2a3f909d0128','faa67fbe-8307-414b-abcf-bac75e0d23e9','2c83a3b2-d1d7-4259-bb07-2682de9e7138'),('7d4ebd7f-75ce-42f0-b660-102dc663d6fd','faa67fbe-8307-414b-abcf-bac75e0d23e9','47af7d9e-2bac-4d3c-914a-45e66088941c'),('80dcc600-5c14-4094-a4a4-a1aa7447e4ac','faa67fbe-8307-414b-abcf-bac75e0d23e9','6f98daf1-022b-4555-9ad2-207f1b4bcf20'),('b6e5471d-545c-4c16-b0e2-a1c3a2e2b033','faa67fbe-8307-414b-abcf-bac75e0d23e9','753bf143-8c40-456e-9958-117c1d079592'),('3802cfb4-3ca1-4d5e-907f-73edab9d6992','faa67fbe-8307-414b-abcf-bac75e0d23e9','7cda7f1e-333d-466d-8352-e64b79245c44');
/*!40000 ALTER TABLE `rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sale` (
  `id` varchar(191) NOT NULL,
  `invoiceNumber` varchar(191) NOT NULL,
  `customerId` varchar(191) DEFAULT NULL,
  `cashierId` varchar(191) NOT NULL,
  `cashSessionId` varchar(191) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(12,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(12,2) NOT NULL,
  `paidAmount` decimal(12,2) NOT NULL,
  `changeAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paymentStatus` enum('UNPAID','PARTIALLY_PAID','PAID','REFUNDED') NOT NULL DEFAULT 'PAID',
  `saleStatus` enum('COMPLETED','HOLD','CANCELLED','REFUNDED') NOT NULL DEFAULT 'COMPLETED',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sale_invoiceNumber_key` (`invoiceNumber`),
  KEY `Sale_customerId_idx` (`customerId`),
  KEY `Sale_cashierId_idx` (`cashierId`),
  KEY `Sale_invoiceNumber_idx` (`invoiceNumber`),
  KEY `Sale_createdAt_idx` (`createdAt`),
  KEY `Sale_cashSessionId_fkey` (`cashSessionId`),
  CONSTRAINT `Sale_cashSessionId_fkey` FOREIGN KEY (`cashSessionId`) REFERENCES `cashsession` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Sale_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saleitem`
--

DROP TABLE IF EXISTS `saleitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saleitem` (
  `id` varchar(191) NOT NULL,
  `saleId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unitCost` decimal(12,2) NOT NULL,
  `unitPrice` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  `warrantyMonths` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `SaleItem_saleId_idx` (`saleId`),
  KEY `SaleItem_productId_idx` (`productId`),
  CONSTRAINT `SaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saleitem`
--

LOCK TABLES `saleitem` WRITE;
/*!40000 ALTER TABLE `saleitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `saleitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saleitemdevice`
--

DROP TABLE IF EXISTS `saleitemdevice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saleitemdevice` (
  `id` varchar(191) NOT NULL,
  `saleItemId` varchar(191) NOT NULL,
  `deviceId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SaleItemDevice_deviceId_key` (`deviceId`),
  KEY `SaleItemDevice_saleItemId_idx` (`saleItemId`),
  KEY `SaleItemDevice_deviceId_idx` (`deviceId`),
  CONSTRAINT `SaleItemDevice_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `device` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `SaleItemDevice_saleItemId_fkey` FOREIGN KEY (`saleItemId`) REFERENCES `saleitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saleitemdevice`
--

LOCK TABLES `saleitemdevice` WRITE;
/*!40000 ALTER TABLE `saleitemdevice` DISABLE KEYS */;
/*!40000 ALTER TABLE `saleitemdevice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `setting` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `group` varchar(191) NOT NULL DEFAULT 'general',
  `description` varchar(191) DEFAULT NULL,
  `isPublic` tinyint(1) NOT NULL DEFAULT 0,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Setting_key_key` (`key`),
  KEY `Setting_key_idx` (`key`),
  KEY `Setting_group_idx` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES ('5bc99cc1-3328-4d04-835d-69806470789b','qa_test_setting','ActiveQAValue','general',NULL,0,'2026-11-14 08:06:43.696'),('6389a0c8-154b-47b0-b9fc-2f20934e21a0','currency_symbol','Rs.','general','Currency Symbol',1,'2026-11-13 18:32:36.674'),('7d7b254d-999d-411e-8a15-1154a49a017b','store_address','No. 142 Galle Road, Colombo 03, Sri Lanka','general','Main Branch Address',1,'2026-11-13 18:32:36.677'),('8938e62b-a6a5-456e-b468-e15b755b14f9','currency','LKR','general','Primary Currency',1,'2026-11-13 18:32:36.672'),('8faf2ff9-ae0b-4bf3-9bdc-6f39ee71db61','strict_imei_enforcement','true','pos','Never allow selling an already sold IMEI',0,'2026-11-13 18:32:36.683'),('972a4ad6-c4a3-4b7e-b344-69751d74f9cb','store_phone','+94 11 234 5678','general','Store Hotline',1,'2026-11-13 18:32:36.680'),('9f509dec-ba26-42c0-91a4-c4928cdb5b34','auto_generate_warranty','true','warranty','Create warranty record on completed sale',0,'2026-11-13 18:32:36.686'),('adb68347-3c53-478d-a5ba-ecbfb14915f5','qa_timestamp','1794643603695','general',NULL,0,'2026-11-14 08:06:43.700'),('add2845c-efa6-4d10-9e84-926a1e27bf4b','receipt_footer_note','Thank you for shopping at NexaPOS! Please retain this invoice for manufacturer warranty claims.','printer','Receipt footer text',1,'2026-11-13 18:32:36.688'),('d6cd0b34-73db-4d15-913d-973110abc08c','store_name','NexaPOS Mobile & Electronics (Pvt) Ltd','general','Store Trade Name',1,'2026-11-13 18:32:36.668');
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockadjustment`
--

DROP TABLE IF EXISTS `stockadjustment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stockadjustment` (
  `id` varchar(191) NOT NULL,
  `referenceNumber` varchar(191) NOT NULL,
  `reason` varchar(191) NOT NULL,
  `adjustedById` varchar(191) NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `newQty` int(11) DEFAULT NULL,
  `previousQty` int(11) DEFAULT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `type` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StockAdjustment_referenceNumber_key` (`referenceNumber`),
  KEY `StockAdjustment_productId_idx` (`productId`),
  CONSTRAINT `StockAdjustment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockadjustment`
--

LOCK TABLES `stockadjustment` WRITE;
/*!40000 ALTER TABLE `stockadjustment` DISABLE KEYS */;
/*!40000 ALTER TABLE `stockadjustment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockmovement`
--

DROP TABLE IF EXISTS `stockmovement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stockmovement` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `type` enum('STOCK_IN','STOCK_OUT','SALE','PURCHASE','RETURN','ADJUSTMENT','REPAIR_CONSUMPTION') NOT NULL,
  `quantity` int(11) NOT NULL,
  `previousQty` int(11) NOT NULL,
  `newQty` int(11) NOT NULL,
  `unitCost` decimal(12,2) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `StockMovement_productId_idx` (`productId`),
  KEY `StockMovement_type_idx` (`type`),
  KEY `StockMovement_createdAt_idx` (`createdAt`),
  CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockmovement`
--

LOCK TABLES `stockmovement` WRITE;
/*!40000 ALTER TABLE `stockmovement` DISABLE KEYS */;
/*!40000 ALTER TABLE `stockmovement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `company` varchar(191) DEFAULT NULL,
  `contactPerson` varchar(191) DEFAULT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `creditDays` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Supplier_phone_key` (`phone`),
  KEY `Supplier_phone_idx` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `roleId` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `resetPasswordExpires` datetime(3) DEFAULT NULL,
  `resetPasswordToken` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_roleId_idx` (`roleId`),
  KEY `User_email_idx` (`email`),
  CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('0a64ffcd-5881-4db9-898b-ccd2e3d4e63f','Nimal Perera','manager@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 71 234 5678','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47',1,'2026-11-14 09:13:37.840','2026-11-13 17:54:00.964','2026-11-14 09:15:57.763',NULL,NULL),('0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Dinesh Fernando','tech@nexapos.lk','$2a$10$kDNje0gHHSRyGM9Ergh2PuiuxxFWyAwDpYDS19oZBb73i1NaNdu4C','+94 72 456 7890','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150','faa67fbe-8307-414b-abcf-bac75e0d23e9',1,'2026-11-14 09:11:43.487','2026-11-13 17:54:00.970','2026-11-14 09:11:43.488',NULL,NULL),('16a379f5-3ae5-410d-95c3-885b9455ac8b','Chamari Silva','cashier@nexapos.lk','$2a$10$Aakleq.KDXr/JUuJVMJWXu..WseCROFnVdzhIOUQx0E.uir6cvd7W','+94 76 345 6789','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150','a925459d-0362-462f-81c5-efd3a44975c0',1,'2026-11-14 09:56:04.564','2026-11-13 17:54:00.967','2026-11-14 09:56:04.566',NULL,NULL),('1d7804c6-5111-40d6-a937-7885eefbef6a','Kasun Jayawardena','admin@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 77 123 4567','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150','73ffe0e8-fd97-4996-9259-f18597f0850f',1,'2026-11-15 06:30:23.583','2026-11-13 17:54:00.958','2026-11-15 06:30:23.587',NULL,NULL),('7a6dd9ec-3a54-4c7b-b2e4-840800f9c141','Roshan Wickrama','stock@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 78 567 8901','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150','cc044292-2880-4f89-9bf1-13068026e275',1,'2026-11-13 18:36:21.387','2026-11-13 17:54:00.972','2026-11-13 18:36:21.389',NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warranty`
--

DROP TABLE IF EXISTS `warranty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warranty` (
  `id` varchar(191) NOT NULL,
  `warrantyCode` varchar(191) NOT NULL,
  `deviceId` varchar(191) DEFAULT NULL,
  `customerId` varchar(191) DEFAULT NULL,
  `saleId` varchar(191) DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `terms` text DEFAULT NULL,
  `status` enum('ACTIVE','EXPIRED','CLAIMED','VOIDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Warranty_warrantyCode_key` (`warrantyCode`),
  KEY `Warranty_deviceId_idx` (`deviceId`),
  KEY `Warranty_customerId_idx` (`customerId`),
  KEY `Warranty_saleId_idx` (`saleId`),
  KEY `Warranty_warrantyCode_idx` (`warrantyCode`),
  CONSTRAINT `Warranty_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Warranty_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `device` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Warranty_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warranty`
--

LOCK TABLES `warranty` WRITE;
/*!40000 ALTER TABLE `warranty` DISABLE KEYS */;
/*!40000 ALTER TABLE `warranty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warrantyclaim`
--

DROP TABLE IF EXISTS `warrantyclaim`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warrantyclaim` (
  `id` varchar(191) NOT NULL,
  `warrantyId` varchar(191) NOT NULL,
  `claimDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `issueReported` text NOT NULL,
  `resolutionNotes` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','RESOLVED') NOT NULL DEFAULT 'PENDING',
  `resolvedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `WarrantyClaim_warrantyId_idx` (`warrantyId`),
  CONSTRAINT `WarrantyClaim_warrantyId_fkey` FOREIGN KEY (`warrantyId`) REFERENCES `warranty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warrantyclaim`
--

LOCK TABLES `warrantyclaim` WRITE;
/*!40000 ALTER TABLE `warrantyclaim` DISABLE KEYS */;
/*!40000 ALTER TABLE `warrantyclaim` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'nexapos_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-15 12:18:51
