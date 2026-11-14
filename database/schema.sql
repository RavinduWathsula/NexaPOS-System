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

-- Dump completed on 2026-11-14 13:50:28
