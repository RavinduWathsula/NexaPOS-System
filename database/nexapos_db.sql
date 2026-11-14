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
INSERT INTO `auditlog` VALUES ('018946c7-ee76-4582-9538-8324f4872186','CREATE_RETURN','Return','2c556c6a-e558-4663-bc82-64d3b46eb740','{\"returnNumber\":\"RET-261114-8130\",\"invoiceNumber\":\"INV-TEST-P9-1794631774011\",\"totalRefund\":129000,\"itemsCount\":2}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:34.061'),('05dd578b-305b-4335-bb44-6172cf65ddea','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','127.0.0.1','2026-11-14 08:01:27.355'),('06e44efb-d174-4fd9-b189-714122312199','COMPLETE_REPAIR','RepairJob','f69479aa-6bbf-4a08-93e3-ec2493405c57','{\"laborCost\":3500,\"finalCost\":15500,\"status\":\"READY_FOR_PICKUP\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 03:57:52.680'),('0cb278c0-935b-446f-a23c-4d5750fd72a2','UPDATE_REPAIR_STATUS','RepairJob','48cdef95-d9da-4a82-813c-6f45175aaf24','{\"oldStatus\":\"DIAGNOSING\",\"newStatus\":\"REPAIRING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 06:03:51.130'),('0f1bc0b1-9bb6-4c4f-ba3d-568b4a003164','UPDATE_REPAIR_STATUS','RepairJob','d8222c7b-0086-46c4-8c2e-b560bb712cbc','{\"oldStatus\":\"DELIVERED\",\"newStatus\":\"DELIVERED\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 08:01:27.669'),('1aa08254-da2d-44a9-8ab8-4ba09e93772f','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'127.0.0.1','2026-11-14 08:04:04.284'),('1af7d190-2d8b-44ea-9a83-1ce879e64611','UPDATE_REPAIR_STATUS','RepairJob','9b938d3e-7963-4941-b9c2-f40fc3d29830','{\"oldStatus\":\"DELIVERED\",\"newStatus\":\"DELIVERED\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 08:06:43.878'),('1b134d0a-22d4-4be8-83e1-655d5cb70588','CREATE_REPAIR_TICKET','RepairJob','c1095f89-2471-4c65-afbe-ea022c9d6bbf','{\"ticketNumber\":\"REP-261114-8370\",\"customerId\":\"eec67272-4564-4ae6-b29e-7df536e84976\",\"deviceModel\":\"Samsung Galaxy S23 Ultra (512GB)\",\"estimatedCost\":18000,\"advancePaid\":5000}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 03:56:05.527'),('29023ba4-f3ac-4494-848a-7902c5ff0aa3','COMPLETE_REPAIR','RepairJob','48cdef95-d9da-4a82-813c-6f45175aaf24','{\"laborCost\":15000,\"finalCost\":15000,\"status\":\"READY_FOR_PICKUP\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 06:03:51.140'),('2d599634-9d06-4a50-8991-5f62b66f0efb','CREATE_RETURN','Return','46cd3c14-369f-4265-a143-10235f39fbc8','{\"returnNumber\":\"RET-261114-7579\",\"invoiceNumber\":\"INV-TEST-P9-1794631745489\",\"totalRefund\":129000,\"itemsCount\":2}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:05.594'),('2fb7e4f1-baf0-46c2-8bef-2a76197f9f3a','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'192.168.1.105','2026-11-14 04:49:33.856'),('30a1f0da-59cc-42d9-80b0-3422d076ccfe','UPDATE_REPAIR_STATUS','RepairJob','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:04:04.462'),('323a4945-69b5-4208-b8c3-7506fcac7dc4','RECORD_EXPENSE','Expense','040ab5cb-8db6-42e5-8e68-c7b6249fa60a','{\"title\":\"Monthly High-Speed Fiber Internet Bill\",\"category\":\"Utilities\",\"amount\":14500,\"paymentMethod\":\"BANK_TRANSFER\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:23:49.723'),('3ac8625c-e9c7-4f1c-9202-06b9cfda2d97','OPEN_CASH_SESSION','CashSession','f6aee17c-8b7c-4dff-a14e-c9e613c86c99','{\"openingBalance\":12000,\"notes\":\"Morning shift opening float verified\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 04:23:49.743'),('42dce8c7-dec9-47c8-9465-f5c95a7e9092','CLOSE_CASH_SESSION','CashSession','f6aee17c-8b7c-4dff-a14e-c9e613c86c99','{\"openingBalance\":12000,\"cashSales\":0,\"cashRefunds\":0,\"expectedBalance\":12000,\"actualClosing\":11800,\"difference\":-200}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 04:23:49.756'),('4693ac5f-45c3-4ee9-993c-2ee8993bc656','REJECT_RETURN','Return','a8289ea9-2192-45f5-9613-8779096f962c','{\"returnNumber\":\"RET-261114-6500\",\"rejectionReason\":\"Device shows physical water damage. Warranty voided as per shop policy.\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:05.687'),('46eab9e4-479f-4386-8cc1-4ec27b02ecc3','LOGIN_FAILED','User',NULL,'{\"email\":\"admin@nexapos.com\",\"reason\":\"Account not found\"}',NULL,'192.168.1.100','2026-11-14 04:45:25.518'),('484ff07c-4547-40fd-a01d-25ca00a3ba01','APPROVE_RETURN','Return','46cd3c14-369f-4265-a143-10235f39fbc8','{\"returnNumber\":\"RET-261114-7579\",\"totalRefund\":\"129000\",\"inspectionNotes\":\"Device physical condition verified immaculate. All accessories intact.\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:05.638'),('4a099835-c6f0-4763-9fcc-5c6b93bd875d','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'192.168.1.105','2026-11-14 04:48:23.692'),('4f8f2875-90f6-47ca-86b7-e8f8e4448a70','CREATE_REPAIR_TICKET','RepairJob','9b938d3e-7963-4941-b9c2-f40fc3d29830','{\"ticketNumber\":\"REP-261114-6910\",\"customerId\":\"03036dca-2fbf-421e-b124-bce80f517411\",\"deviceModel\":\"Samsung Galaxy S24 Ultra\",\"estimatedCost\":25000,\"advancePaid\":0}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 08:06:43.819'),('520e36c5-49de-4202-bb1e-569ca58262ca','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','127.0.0.1','2026-11-14 08:04:04.160'),('555b65f8-5830-4542-9063-26052d3663e9','CREATE_REPAIR_TICKET','RepairJob','d8222c7b-0086-46c4-8c2e-b560bb712cbc','{\"ticketNumber\":\"REP-261114-5141\",\"customerId\":\"03036dca-2fbf-421e-b124-bce80f517411\",\"deviceModel\":\"Samsung Galaxy S24 Ultra\",\"estimatedCost\":25000,\"advancePaid\":0}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 08:01:27.604'),('5661bec2-9ae7-43b3-abea-e7f5a36185b1','UPDATE_REPAIR_STATUS','RepairJob','f69479aa-6bbf-4a08-93e3-ec2493405c57','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 03:57:52.641'),('57cc7c61-882a-417b-979e-355baae472f4','CREATE_REPAIR_TICKET','RepairJob','48cdef95-d9da-4a82-813c-6f45175aaf24','{\"ticketNumber\":\"REP-261114-7612\",\"customerId\":\"03036dca-2fbf-421e-b124-bce80f517411\",\"deviceModel\":\"Samsung Galaxy S24 Ultra\",\"estimatedCost\":25000,\"advancePaid\":0}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 06:03:51.105'),('590ae768-737a-42c6-9d22-aaa30a4d47c5','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','192.168.1.100','2026-11-14 04:49:05.462'),('5a614027-eb5b-4e39-9b37-08efb1dee134','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','192.168.1.100','2026-11-14 04:47:41.244'),('67c9a754-3977-4a43-a797-a0e904225319','RECORD_EXPENSE','Expense','2ec0b904-6061-4adc-ac13-2c536fc39540','{\"title\":\"Monthly High-Speed Fiber Internet Bill\",\"category\":\"Utilities\",\"amount\":14500,\"paymentMethod\":\"BANK_TRANSFER\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:22:35.433'),('6920b118-3d99-4767-ad3b-80942b12fc88','UPDATE_REPAIR_STATUS','RepairJob','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','{\"oldStatus\":\"DIAGNOSING\",\"newStatus\":\"REPAIRING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:04:04.469'),('6f2b10a9-ed94-4e8f-927b-f1a04a6a9719','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','127.0.0.1','2026-11-14 06:03:50.804'),('78de50d5-dcae-4414-8e8a-b1fb5ce21986','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'192.168.1.105','2026-11-14 04:49:05.327'),('88c687f0-888b-49e5-8e87-1a4d93f35568','CREATE_RETURN','Return','a8289ea9-2192-45f5-9613-8779096f962c','{\"returnNumber\":\"RET-261114-6500\",\"invoiceNumber\":\"INV-REJ-1794631745649\",\"totalRefund\":110000,\"itemsCount\":1}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:05.667'),('9179e89c-c511-4ac1-bc48-9745eb5aa5fb','REJECT_RETURN','Return','34bfb744-599a-42dc-a440-7bb4b42b81a3','{\"returnNumber\":\"RET-261114-6583\",\"rejectionReason\":\"Device shows physical water damage. Warranty voided as per shop policy.\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:34.152'),('95026dc0-63b0-4d44-b8b0-5ff54e5b006d','UPDATE_REPAIR_STATUS','RepairJob','d8222c7b-0086-46c4-8c2e-b560bb712cbc','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:01:27.617'),('951f9d0b-ffa5-408e-adf1-d42d24760af0','UPDATE_REPAIR_STATUS','RepairJob','c1095f89-2471-4c65-afbe-ea022c9d6bbf','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 03:56:05.543'),('a2366a04-ddfc-44fb-b4f2-b03f4ae602fd','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'192.168.1.105','2026-11-14 04:47:41.111'),('a33ed868-e55e-4141-a9d5-9d233b3976ad','APPROVE_RETURN','Return','2c556c6a-e558-4663-bc82-64d3b46eb740','{\"returnNumber\":\"RET-261114-8130\",\"totalRefund\":\"129000\",\"inspectionNotes\":\"Device physical condition verified immaculate. All accessories intact.\"}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:34.106'),('a47a9d31-2afd-48e9-bca9-ee2fc7cec98b','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'127.0.0.1','2026-11-14 08:01:27.446'),('a91d0e18-9e4f-4954-8b80-d9be937a80b0','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','127.0.0.1','2026-11-14 08:06:43.562'),('ab4b36f7-a740-457c-9bff-8a9be4530773','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'127.0.0.1','2026-11-14 08:06:43.664'),('b32b1831-73e5-4ff4-adc1-94ebc3197cab','COMPLETE_REPAIR','RepairJob','9b938d3e-7963-4941-b9c2-f40fc3d29830','{\"laborCost\":15000,\"finalCost\":15000,\"status\":\"READY_FOR_PICKUP\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:06:43.855'),('bd799efc-9260-48ca-9dae-0b103b25a47f','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','192.168.1.100','2026-11-14 04:49:33.989'),('c4c60c59-1c23-4e7b-b448-875a2860fdeb','OPEN_CASH_SESSION','CashSession','f5716c26-e7d7-4ee0-99ae-d7923c67822b','{\"openingBalance\":12000,\"notes\":\"Morning shift opening float verified\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 04:22:35.460'),('c7a3e582-009f-4f7f-a6b3-d1cb4b27273a','UPDATE_REPAIR_STATUS','RepairJob','9b938d3e-7963-4941-b9c2-f40fc3d29830','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:06:43.833'),('c844b645-1bc9-4a22-9e94-a4177c5a3ba8','UPDATE_REPAIR_STATUS','RepairJob','9b938d3e-7963-4941-b9c2-f40fc3d29830','{\"oldStatus\":\"DIAGNOSING\",\"newStatus\":\"REPAIRING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:06:43.842'),('c8812102-6bee-4fd5-8ac0-fcb90481aaf1','UPDATE_REPAIR_STATUS','RepairJob','d8222c7b-0086-46c4-8c2e-b560bb712cbc','{\"oldStatus\":\"DIAGNOSING\",\"newStatus\":\"REPAIRING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:01:27.634'),('c8c1c5ad-ba53-4416-aa92-8ff57fbd6393','CREATE_REPAIR_TICKET','RepairJob','f69479aa-6bbf-4a08-93e3-ec2493405c57','{\"ticketNumber\":\"REP-261114-9529\",\"customerId\":\"03036dca-2fbf-421e-b124-bce80f517411\",\"deviceModel\":\"Samsung Galaxy S23 Ultra (512GB)\",\"estimatedCost\":18000,\"advancePaid\":5000}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 03:57:52.613'),('c931b719-07c1-48bf-a91f-b57a880dee85','CREATE_REPAIR_TICKET','RepairJob','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','{\"ticketNumber\":\"REP-261114-4903\",\"customerId\":\"03036dca-2fbf-421e-b124-bce80f517411\",\"deviceModel\":\"Samsung Galaxy S24 Ultra\",\"estimatedCost\":25000,\"advancePaid\":0}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 08:04:04.452'),('cbba9570-f4ba-4d19-835a-d9823e7d267c','UPDATE_REPAIR_STATUS','RepairJob','48cdef95-d9da-4a82-813c-6f45175aaf24','{\"oldStatus\":\"RECEIVED\",\"newStatus\":\"DIAGNOSING\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 06:03:51.121'),('ce5127c3-30ea-42c3-a9b7-2473e82dcf07','LOGIN_FAILED','User',NULL,'{\"email\":\"admin@nexapos.com\",\"reason\":\"Account not found\"}',NULL,'192.168.1.105','2026-11-14 04:45:25.511'),('d4308cb5-c166-4f40-b75a-a672bd1d959f','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'192.168.1.105','2026-11-14 04:46:16.551'),('d622899d-401b-4242-b2da-015c94371730','UPDATE_REPAIR_STATUS','RepairJob','48cdef95-d9da-4a82-813c-6f45175aaf24','{\"oldStatus\":\"DELIVERED\",\"newStatus\":\"DELIVERED\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 06:03:51.162'),('d9c2cef7-1a55-47df-aeab-42056ef461a9','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','192.168.1.100','2026-11-14 04:46:16.644'),('dd8b614a-eba9-4b0e-b20a-0a68118d7cfe','COMPLETE_REPAIR','RepairJob','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','{\"laborCost\":15000,\"finalCost\":15000,\"status\":\"READY_FOR_PICKUP\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:04:04.482'),('e4b3c8a9-e7ef-4191-be93-3bf38eccedf3','LOGIN_FAILED','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"reason\":\"Incorrect password\"}',NULL,'127.0.0.1','2026-11-14 06:03:50.937'),('eaa431cd-0c23-4c82-8372-9537794b6608','CLOSE_CASH_SESSION','CashSession','f5716c26-e7d7-4ee0-99ae-d7923c67822b','{\"openingBalance\":12000,\"cashSales\":0,\"cashRefunds\":0,\"expectedBalance\":12000,\"actualClosing\":11800,\"difference\":-200}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 04:22:35.483'),('ec2dc528-ca80-425d-8a6b-9ee17decb54c','COMPLETE_REPAIR','RepairJob','d8222c7b-0086-46c4-8c2e-b560bb712cbc','{\"laborCost\":15000,\"finalCost\":15000,\"status\":\"READY_FOR_PICKUP\"}','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18',NULL,'2026-11-14 08:01:27.646'),('f2aca132-b8f2-41a8-8f27-8f8c0a009e06','UPDATE_REPAIR_STATUS','RepairJob','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','{\"oldStatus\":\"DELIVERED\",\"newStatus\":\"DELIVERED\",\"technicianId\":\"0c5d25c2-3884-4279-81fd-f6fa4c2d7f18\"}','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,'2026-11-14 08:04:04.504'),('f4ae2700-48cc-4ab3-bd27-d11ffe8e0d0b','LOGIN_SUCCESS','User','1d7804c6-5111-40d6-a937-7885eefbef6a','{\"email\":\"admin@nexapos.lk\",\"role\":\"SUPER_ADMIN\"}','1d7804c6-5111-40d6-a937-7885eefbef6a','192.168.1.100','2026-11-14 04:48:23.782'),('f4fb362f-6c13-4813-b3a7-101ae590a292','CREATE_RETURN','Return','34bfb744-599a-42dc-a440-7bb4b42b81a3','{\"returnNumber\":\"RET-261114-6583\",\"invoiceNumber\":\"INV-REJ-1794631774116\",\"totalRefund\":110000,\"itemsCount\":1}','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'2026-11-14 04:49:34.137');
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
INSERT INTO `brand` VALUES ('10c2284c-077e-44d4-a6c1-c0b0bf324ea5','Anker','anker','United States',NULL,'2026-11-13 17:54:01.017','2026-11-13 18:32:36.606'),('28976178-b297-4d00-bbeb-6cea7ef8f6c2','Xiaomi','xiaomi','China',NULL,'2026-11-13 17:54:01.012','2026-11-13 18:32:36.601'),('780641bf-96a3-4ca3-9e1a-afcfb9761e1d','Sony','sony','Japan',NULL,'2026-11-13 17:54:01.015','2026-11-13 18:32:36.604'),('7f367524-1ef6-44d2-bd28-fce9df7fbce7','Baseus','baseus','China',NULL,'2026-11-13 17:54:01.022','2026-11-13 18:32:36.611'),('8e997cc1-d93e-4d81-b86c-e4a3c58a1720','Apple','apple','United States',NULL,'2026-11-13 17:54:01.004','2026-11-13 18:32:36.595'),('b4e1ddd5-d363-4d66-a79c-29c93dfb440f','Samsung','samsung','South Korea',NULL,'2026-11-13 17:54:01.009','2026-11-13 18:32:36.598'),('b585bb7b-c551-47e2-bca2-8d0b384c4294','Spigen','spigen','United States',NULL,'2026-11-13 17:54:01.020','2026-11-13 18:32:36.609');
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
INSERT INTO `cashsession` VALUES ('f5716c26-e7d7-4ee0-99ae-d7923c67822b','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 04:22:35.452','2026-11-14 04:22:35.476',12000.00,11800.00,12000.00,-200.00,'CLOSED','Evening shift handover. Small coin change shortage of Rs. 200 noted.'),('f6aee17c-8b7c-4dff-a14e-c9e613c86c99','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 04:23:49.737','2026-11-14 04:23:49.752',12000.00,11800.00,12000.00,-200.00,'CLOSED','Evening shift handover. Small coin change shortage of Rs. 200 noted.');
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
INSERT INTO `category` VALUES ('074b4c51-ab6c-40ed-b530-fafb8d0ade8d','Smartphones & Handsets','smartphones','Serialized IMEI mobile phones',NULL,'2026-11-13 17:54:00.975','2026-11-13 18:32:36.575'),('6d1dd5ef-1732-4dd8-b6cc-7a2f1fa89ed0','Fast Chargers & Power','charging','Wall adapters, cables and powerbanks',NULL,'2026-11-13 17:54:00.992','2026-11-13 18:32:36.584'),('75b02a13-4420-4e45-87c1-81777bdc00fd','Screen & Body Protection','protection','Tempered glass and phone cases',NULL,'2026-11-13 17:54:00.998','2026-11-13 18:32:36.588'),('95fe2409-260b-4c7e-a2c5-ca654399b4ee','Tablets & iPads','tablets','Tablets and cellular pads',NULL,'2026-11-13 17:54:00.981','2026-11-13 18:32:36.579'),('da803044-cd4c-4556-9258-2dd177dbabb8','Repair Spare Parts','spare-parts','Displays, battery packs and charging ICs',NULL,'2026-11-13 17:54:01.001','2026-11-13 18:32:36.591'),('fe14df4e-616d-4617-8335-36130f676cf7','Audio & Headphones','audio','Earphones, wireless earbuds & headphones',NULL,'2026-11-13 17:54:00.986','2026-11-13 18:32:36.582');
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
INSERT INTO `customer` VALUES ('03036dca-2fbf-421e-b124-bce80f517411','Tharindu Fernando','0775191686','tharindu.1794628672548@test.lk',NULL,'No 120, Galle Road','STANDARD',1080,'2026-11-14 03:57:52.553','2026-11-14 08:06:43.930'),('07317510-86da-41fe-bff4-c9aeac9448f8','Tharindu Fernando','0772863417','tharindu.1794628420731@test.lk',NULL,'No 120, Galle Road','STANDARD',0,'2026-11-14 03:53:40.736','2026-11-14 03:53:40.736'),('3eb103fa-330a-447b-a13f-f68e2fee56ca','Dilan Ranasinghe','+94 76 443 1928','dilan.rana@yahoo.com','199534567890','No. 78, High Level Road, Nugegoda','STANDARD',150,'2026-11-13 17:55:34.259','2026-11-13 18:32:36.632'),('8f87fa34-22c8-47c4-bfd6-dbed0be65aed','Nadeeka Senanayake','+94 71 889 2311','nadeeka.s@outlook.com','199256789012','No. 12, Kandy Road, Kadawatha','SILVER',680,'2026-11-13 17:55:34.254','2026-11-13 18:32:36.629'),('a4a8acfa-abf5-40af-b973-19e4ebd78292','Tharindu Fernando','0772290722','tharindu.1794628265831@test.lk',NULL,'No 120, Galle Road','STANDARD',0,'2026-11-14 03:51:05.835','2026-11-14 03:51:05.835'),('a4c052e5-e170-458c-a2ea-72cc76c7c6b5','Kamal Jayawardena','+94 77 123 4567','kamal.j@gmail.com','198912345678','No. 45, Flower Road, Colombo 07','GOLD',1250,'2026-11-13 17:55:34.249','2026-11-13 18:32:36.625'),('eec67272-4564-4ae6-b29e-7df536e84976','Tharindu Fernando','0777991372','tharindu.1794628565466@test.lk',NULL,'No 120, Galle Road','STANDARD',0,'2026-11-14 03:56:05.470','2026-11-14 03:56:05.470');
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
INSERT INTO `device` VALUES ('03587ebd-0cc4-4647-aafa-903ac462fc05','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-REJ-1794631774114',NULL,NULL,NULL,NULL,NULL,90000.00,110000.00,'SOLD',NULL,NULL,'2026-11-14 04:49:34.115','2026-11-14 04:49:34.145'),('04695639-6e0f-4a0b-864d-d179c7d6dde8','9b95ce79-ded5-41cb-a8bd-ecd09de5e1c3',NULL,'354892019482914','354892019482915','SN-APL-15P-003','Black Titanium','256GB',100,385000.00,435000.00,'IN_STOCK',NULL,NULL,'2026-11-13 17:55:34.278','2026-11-13 17:55:34.278'),('14ea449f-99b9-4e3c-8280-be0bb59f88ef','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'RACE-TEST-1794643287671',NULL,NULL,NULL,NULL,NULL,95000.00,120000.00,'SOLD',NULL,NULL,'2026-11-14 08:01:27.672','2026-11-14 08:01:27.689'),('33aeab09-a2e9-48ba-b1c5-bdd1d22eba4f','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-1794631661264',NULL,NULL,NULL,NULL,NULL,100000.00,125000.00,'SOLD',NULL,NULL,'2026-11-14 04:47:41.266','2026-11-14 04:47:41.266'),('4064f200-3758-465c-ab25-a8e26181acb0','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'DUP-TEST-1794643287714',NULL,NULL,NULL,NULL,NULL,80000.00,NULL,'IN_STOCK',NULL,NULL,'2026-11-14 08:01:27.715','2026-11-14 08:01:27.715'),('460e0e07-c10f-43eb-b7bc-2bd996ed892c','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'DUP-TEST-1794643603951',NULL,NULL,NULL,NULL,NULL,80000.00,NULL,'IN_STOCK',NULL,NULL,'2026-11-14 08:06:43.952','2026-11-14 08:06:43.952'),('4b311ea2-9475-45a9-8826-a922fc84c7e0','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'QA-LIFECYCLE-IMEI-1794643444330',NULL,NULL,'Phantom Black','256GB',NULL,110000.00,145000.00,'SOLD','d95fb33f-886b-4496-ba01-2ce932e0b0d5',NULL,'2026-11-14 08:04:04.361','2026-11-14 08:04:04.402'),('5f39c28b-a805-4931-a090-4b8bf3d7e993','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'357281098231904','357281098231905','SN-SAM-S24-002','Titanium Black','512GB',100,410000.00,465000.00,'IN_STOCK',NULL,NULL,'2026-11-13 17:55:34.294','2026-11-13 17:55:34.294'),('6b77863a-1a5e-4d81-8b0a-82842287bdef','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-1794631774008',NULL,NULL,NULL,NULL,NULL,100000.00,125000.00,'IN_STOCK',NULL,NULL,'2026-11-14 04:49:34.010','2026-11-14 04:49:34.082'),('779db002-358b-497d-ab6f-63eb47e0d7bd','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'RACE-TEST-1794636231164',NULL,NULL,NULL,NULL,NULL,95000.00,120000.00,'SOLD',NULL,NULL,'2026-11-14 06:03:51.165','2026-11-14 06:03:51.179'),('7f65e5e8-0340-49dc-9436-e8add6fa869f','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'DUP-TEST-1794643444539',NULL,NULL,NULL,NULL,NULL,80000.00,NULL,'IN_STOCK',NULL,NULL,'2026-11-14 08:04:04.541','2026-11-14 08:04:04.541'),('9528861b-86e9-4826-8c29-46b8b2f9d1de','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'QA-LIFECYCLE-IMEI-1794643287485',NULL,NULL,'Phantom Black','256GB',NULL,110000.00,145000.00,'SOLD','74131dd7-65d6-43eb-b960-34046c9423fa',NULL,'2026-11-14 08:01:27.515','2026-11-14 08:01:27.546'),('95c4340c-6697-4eec-90a6-0edbcde6a107','9b95ce79-ded5-41cb-a8bd-ecd09de5e1c3',NULL,'354892019482910','354892019482911','SN-APL-15P-001','Natural Titanium','256GB',100,385000.00,435000.00,'IN_STOCK',NULL,NULL,'2026-11-13 17:55:34.268','2026-11-13 17:55:34.268'),('ae91484b-0fd9-46c1-9564-043e93d50628','9b95ce79-ded5-41cb-a8bd-ecd09de5e1c3',NULL,'354892019482912','354892019482913','SN-APL-15P-002','Blue Titanium','256GB',100,385000.00,435000.00,'IN_STOCK',NULL,NULL,'2026-11-13 17:55:34.273','2026-11-13 17:55:34.273'),('bd86a5a2-28f6-4cad-838e-781247964fd5','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'QA-LIFECYCLE-IMEI-1794643603707',NULL,NULL,'Phantom Black','256GB',NULL,110000.00,145000.00,'SOLD','eadc075c-c5b0-43d2-9776-1f6dca7bfbb0',NULL,'2026-11-14 08:06:43.736','2026-11-14 08:06:43.769'),('be09771e-7017-4fef-9da4-e090d4ae5182','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'DUP-TEST-1794636231208',NULL,NULL,NULL,NULL,NULL,80000.00,NULL,'IN_STOCK',NULL,NULL,'2026-11-14 06:03:51.209','2026-11-14 06:03:51.209'),('c3150fc8-5fbd-4c27-b0be-9e639ef6a500','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'357281098231902','357281098231903','SN-SAM-S24-001','Titanium Grey','512GB',100,410000.00,465000.00,'IN_STOCK',NULL,NULL,'2026-11-13 17:55:34.291','2026-11-13 17:55:34.291'),('c4505051-356a-4b8c-842f-d44dc4e78d72','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-1794631703792',NULL,NULL,NULL,NULL,NULL,100000.00,125000.00,'SOLD',NULL,NULL,'2026-11-14 04:48:23.793','2026-11-14 04:48:23.793'),('dd26470c-3e74-4570-bcac-62dd6acfc51c','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'RACE-TEST-1794643603880',NULL,NULL,NULL,NULL,NULL,95000.00,120000.00,'SOLD',NULL,NULL,'2026-11-14 08:06:43.881','2026-11-14 08:06:43.915'),('e61acb9e-d6ae-41a7-b052-a1bde8f7cf16','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-1794631745484',NULL,NULL,NULL,NULL,NULL,100000.00,125000.00,'IN_STOCK',NULL,NULL,'2026-11-14 04:49:05.485','2026-11-14 04:49:05.614'),('eede0ec6-2bbf-4fbd-aa23-ea449b5fed57','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'QA-LIFECYCLE-IMEI-1794636230983',NULL,NULL,'Phantom Black','256GB',NULL,110000.00,145000.00,'SOLD','a6b3df23-06be-462e-8b01-8f64c3ac2fff',NULL,'2026-11-14 06:03:51.019','2026-11-14 06:03:51.055'),('f02e56eb-eda4-4376-925c-10d7ab07c9fb','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'RACE-TEST-1794643444505',NULL,NULL,NULL,NULL,NULL,95000.00,120000.00,'SOLD',NULL,NULL,'2026-11-14 08:04:04.507','2026-11-14 08:04:04.520'),('ffc41e97-00f5-4a5c-be62-abe15e3d9ea5','1a4826fb-b33d-4371-b1f0-016b447e1295',NULL,'TEST-P9-REJ-1794631745645',NULL,NULL,NULL,NULL,NULL,90000.00,110000.00,'SOLD',NULL,NULL,'2026-11-14 04:49:05.646','2026-11-14 04:49:05.674');
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
INSERT INTO `devicestatushistory` VALUES ('045b6f2b-1b97-4fbc-9e21-55bea5f56a61','bd86a5a2-28f6-4cad-838e-781247964fd5','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-43603758','INV-43603758','2026-11-14 08:06:43.771'),('1146d4aa-4bbc-4aa4-98f6-23443234a487','779db002-358b-497d-ab6f-63eb47e0d7bd','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-36231170','INV-36231170','2026-11-14 06:03:51.181'),('2a14b266-a27d-4cf3-83c6-a8e8cc3d47ee','e61acb9e-d6ae-41a7-b052-a1bde8f7cf16','RETURNED','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Device inspected and marked RESELLABLE under return #RET-261114-7579','46cd3c14-369f-4265-a143-10235f39fbc8','2026-11-14 04:49:05.617'),('3e620b37-8bcb-431d-97fc-712f4dd0f57f','14ea449f-99b9-4e3c-8280-be0bb59f88ef','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-43287676','INV-43287676','2026-11-14 08:01:27.697'),('683ccef9-51f9-495d-87fd-3df88f01864c','03587ebd-0cc4-4647-aafa-903ac462fc05','RETURNED','SOLD','1d7804c6-5111-40d6-a937-7885eefbef6a','Return rejected: Device shows physical water damage. Warranty voided as per shop policy.','34bfb744-599a-42dc-a440-7bb4b42b81a3','2026-11-14 04:49:34.148'),('6f10177b-8d44-4892-b91c-aac18e46caab','9528861b-86e9-4826-8c29-46b8b2f9d1de','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-43287531','INV-43287531','2026-11-14 08:01:27.549'),('7189a875-e3a4-403b-a37a-3b5b5b83d236','03587ebd-0cc4-4647-aafa-903ac462fc05','SOLD','RETURNED','1d7804c6-5111-40d6-a937-7885eefbef6a','Returned on ticket #RET-261114-6583. Condition: DEFECTIVE','34bfb744-599a-42dc-a440-7bb4b42b81a3','2026-11-14 04:49:34.136'),('a0c6611a-bdf6-4446-85f2-dfdcff19d5e8','ffc41e97-00f5-4a5c-be62-abe15e3d9ea5','SOLD','RETURNED','1d7804c6-5111-40d6-a937-7885eefbef6a','Returned on ticket #RET-261114-6500. Condition: DEFECTIVE','a8289ea9-2192-45f5-9613-8779096f962c','2026-11-14 04:49:05.666'),('a7550adc-f751-4007-b154-714fcebaded3','e61acb9e-d6ae-41a7-b052-a1bde8f7cf16','SOLD','RETURNED','1d7804c6-5111-40d6-a937-7885eefbef6a','Returned on ticket #RET-261114-7579. Condition: RESELLABLE','46cd3c14-369f-4265-a143-10235f39fbc8','2026-11-14 04:49:05.591'),('a8bfdc49-9242-4733-b057-877eb5e46af6','ffc41e97-00f5-4a5c-be62-abe15e3d9ea5','RETURNED','SOLD','1d7804c6-5111-40d6-a937-7885eefbef6a','Return rejected: Device shows physical water damage. Warranty voided as per shop policy.','a8289ea9-2192-45f5-9613-8779096f962c','2026-11-14 04:49:05.678'),('aa232308-adb2-4558-a13f-557d85046bdc','bd86a5a2-28f6-4cad-838e-781247964fd5','IN_STOCK','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Purchase receipt from PO-43603710','PO-43603710','2026-11-14 08:06:43.738'),('b08d4d82-5559-4844-9fa9-03babac36013','9528861b-86e9-4826-8c29-46b8b2f9d1de','IN_STOCK','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Purchase receipt from PO-43287486','PO-43287486','2026-11-14 08:01:27.519'),('b0aa152e-6002-4e30-8982-2f0e12b8003e','4b311ea2-9475-45a9-8826-a922fc84c7e0','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-43444390','INV-43444390','2026-11-14 08:04:04.405'),('b2aed2fb-0bf3-4e99-9126-328efecdf855','eede0ec6-2bbf-4fbd-aa23-ea449b5fed57','IN_STOCK','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Purchase receipt from PO-36230985','PO-36230985','2026-11-14 06:03:51.021'),('b4b32232-c86e-4de6-b8d5-427bce02a8c4','6b77863a-1a5e-4d81-8b0a-82842287bdef','RETURNED','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Device inspected and marked RESELLABLE under return #RET-261114-8130','2c556c6a-e558-4663-bc82-64d3b46eb740','2026-11-14 04:49:34.085'),('c373c33e-95c5-48c5-a685-d5c518041d5e','4b311ea2-9475-45a9-8826-a922fc84c7e0','IN_STOCK','IN_STOCK','1d7804c6-5111-40d6-a937-7885eefbef6a','Purchase receipt from PO-43444333','PO-43444333','2026-11-14 08:04:04.364'),('d40e3e8c-12e8-4e34-a381-27dbe5850d2f','f02e56eb-eda4-4376-925c-10d7ab07c9fb','IN_STOCK','SOLD','1d7804c6-5111-40d6-a937-7885eefbef6a','Retail POS Sale on Invoice #INV-43444511','INV-43444511','2026-11-14 08:04:04.522'),('d4ecfd3e-da66-488f-a7c7-48afdedc6f7e','eede0ec6-2bbf-4fbd-aa23-ea449b5fed57','IN_STOCK','SOLD','16a379f5-3ae5-410d-95c3-885b9455ac8b','Retail POS Sale on Invoice #INV-36231038','INV-36231038','2026-11-14 06:03:51.058'),('f31f52e9-3fd2-4df9-bc25-9050f571260a','dd26470c-3e74-4570-bcac-62dd6acfc51c','IN_STOCK','SOLD','1d7804c6-5111-40d6-a937-7885eefbef6a','Retail POS Sale on Invoice #INV-43603895','INV-43603895','2026-11-14 08:06:43.919'),('fdc3067c-182c-43e0-9494-a1c0fe0327a6','6b77863a-1a5e-4d81-8b0a-82842287bdef','SOLD','RETURNED','1d7804c6-5111-40d6-a937-7885eefbef6a','Returned on ticket #RET-261114-8130. Condition: RESELLABLE','2c556c6a-e558-4663-bc82-64d3b46eb740','2026-11-14 04:49:34.060');
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
INSERT INTO `expense` VALUES ('2ec0b904-6061-4adc-ac13-2c536fc39540','Monthly High-Speed Fiber Internet Bill','Utilities',14500.00,'BANK_TRANSFER','2026-11-14 04:22:35.421','SLT Telecom commercial connection account #889922','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 04:22:35.426');
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
INSERT INTO `inventory` VALUES ('048ed49e-7a86-4c26-9a4e-6b6182fa4718','701fd357-e858-430a-a141-30bd309e2a42',42,10,'Rack B3','Colombo Main','2026-11-13 18:32:36.660'),('53510600-be62-4b7e-a513-2b0e70b2ca99','16ed0a20-16d5-46aa-84d7-308c63b85fdb',53,5,'Rack C2','Colombo Main','2026-11-14 08:06:43.779'),('b0e1be9b-f3c0-4a14-b996-c126fcdcf4ca','1a4826fb-b33d-4371-b1f0-016b447e1295',0,4,'Vault Shelf A2','Colombo Main','2026-11-14 08:06:43.776'),('f86ea922-5c3c-4892-9cea-3ab8e3ed1824','9b95ce79-ded5-41cb-a8bd-ecd09de5e1c3',3,5,'Vault Shelf A1','Colombo Main','2026-11-13 18:32:36.645');
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
INSERT INTO `payment` VALUES ('07e68497-3df5-4111-a533-2f105099f40d',NULL,NULL,15000.00,'CASH',NULL,NULL,'Settled in full at counter','2026-11-14 08:01:27.652','d8222c7b-0086-46c4-8c2e-b560bb712cbc'),('2d2a75e8-0398-49f7-9c38-99900615ad5d','1984f4f4-12de-4b8d-9928-c89da1ed0e04',NULL,50000.00,'CARD','4242','TXN-QA-01',NULL,'2026-11-14 06:03:51.079',NULL),('3d935f5c-c18b-47f0-8e5d-0010ec593957','998993aa-5a46-4aa1-8086-7ab3f882d59e',NULL,100000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:06:43.786',NULL),('5f1c608c-9047-4768-af23-479d0be93935','007c842f-93a7-4903-99f4-423bcf8ea06a',NULL,50000.00,'CARD','4242','TXN-QA-01',NULL,'2026-11-14 08:04:04.424',NULL),('694ae39d-10f6-4098-81dd-fabf35bd6e51',NULL,NULL,5000.00,'CASH',NULL,NULL,'Advance deposit for ticket #REP-261114-8370','2026-11-14 03:56:05.525','c1095f89-2471-4c65-afbe-ea022c9d6bbf'),('6e94e9b5-2577-4837-b2ec-62842a31c114','1984f4f4-12de-4b8d-9928-c89da1ed0e04',NULL,100000.00,'CASH',NULL,NULL,NULL,'2026-11-14 06:03:51.075',NULL),('76168b91-09fb-4751-b6b1-aeb8ee1810c2','d1520aaf-719a-4c69-be08-f9190edec1e3',NULL,100000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:01:27.569',NULL),('7f17b53f-606d-4c7e-a98d-5609c3f8945f','998993aa-5a46-4aa1-8086-7ab3f882d59e',NULL,50000.00,'CARD','4242','TXN-QA-01',NULL,'2026-11-14 08:06:43.789',NULL),('898f6d54-9712-4eb9-aee5-cdf4ae7c3808',NULL,NULL,15000.00,'CASH',NULL,NULL,'Settled in full at counter','2026-11-14 08:04:04.489','3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc'),('9c738a88-792b-485c-9e48-645fc5d142af',NULL,NULL,10500.00,'CARD',NULL,'TXN-SL-998822','Final balance card settlement on device collection','2026-11-14 03:57:52.690','f69479aa-6bbf-4a08-93e3-ec2493405c57'),('a706593b-6444-4fd9-b58d-442534331c81','007c842f-93a7-4903-99f4-423bcf8ea06a',NULL,100000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:04:04.419',NULL),('aa1f67a6-20e3-41c7-9c01-3c833d17566e','6c10762e-5c37-45f2-bcce-9be0c481aecc',NULL,120000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:04:04.527',NULL),('b1c0122b-a24c-4eda-8606-245e72116453',NULL,NULL,15000.00,'CASH',NULL,NULL,'Settled in full at counter','2026-11-14 06:03:51.147','48cdef95-d9da-4a82-813c-6f45175aaf24'),('b3f4abb5-c160-4a80-98cc-887a585311c6',NULL,NULL,15000.00,'CASH',NULL,NULL,'Settled in full at counter','2026-11-14 08:06:43.863','9b938d3e-7963-4941-b9c2-f40fc3d29830'),('cffa4764-d919-4b06-900a-97a233ce509f','1d624c65-44d5-4d8e-a7cb-a910e7fc39bc',NULL,120000.00,'CASH',NULL,NULL,NULL,'2026-11-14 06:03:51.186',NULL),('dc15b56c-4f96-4e93-8fe7-32ef6f999728','147e1fbe-bc2b-414c-aeac-1d6725f395ca',NULL,120000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:06:43.928',NULL),('e22b8309-5b19-4ba4-ab8f-3f965bc08598','d1520aaf-719a-4c69-be08-f9190edec1e3',NULL,50000.00,'CARD','4242','TXN-QA-01',NULL,'2026-11-14 08:01:27.571',NULL),('e5128ec2-9c9d-4c6f-9be9-49e739a52aeb','17afb90b-246b-42a6-b33d-94e7c9c4421d',NULL,120000.00,'CASH',NULL,NULL,NULL,'2026-11-14 08:01:27.704',NULL),('eb90ad12-3f3f-4e68-a33f-255f29eef29d',NULL,NULL,5000.00,'CASH',NULL,NULL,'Advance deposit for ticket #REP-261114-9529','2026-11-14 03:57:52.610','f69479aa-6bbf-4a08-93e3-ec2493405c57');
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
INSERT INTO `product` VALUES ('16ed0a20-16d5-46aa-84d7-308c63b85fdb','Anker PowerCore 20,000mAh Powerbank','ANK-PWR-20K','848061058291','High capacity portable charger with dual USB high speed charging ports.','6d1dd5ef-1732-4dd8-b6cc-7a2f1fa89ed0','10c2284c-077e-44d4-a6c1-c0b0bf324ea5',0,14500.00,19500.00,NULL,18,'2026-11-13 17:55:34.306','2026-11-13 17:55:34.306'),('1a4826fb-b33d-4371-b1f0-016b447e1295','Samsung Galaxy S24 Ultra (512GB Grey)','SAM-S24U-512','880609539281','Galaxy AI, Snapdragon 8 Gen 3, 200MP Quad Tele System, Built-in S Pen.','074b4c51-ab6c-40ed-b530-fafb8d0ade8d','b4e1ddd5-d363-4d66-a79c-29c93dfb440f',1,410000.00,465000.00,NULL,12,'2026-11-13 17:55:34.286','2026-11-13 17:55:34.286'),('701fd357-e858-430a-a141-30bd309e2a42','Apple 20W USB-C Power Adapter','APL-PWR-20W','194252157007','Official Apple USB-C Power Adapter for iPhone and iPad fast charging.','6d1dd5ef-1732-4dd8-b6cc-7a2f1fa89ed0','8e997cc1-d93e-4d81-b86c-e4a3c58a1720',0,6200.00,8500.00,NULL,6,'2026-11-13 17:55:34.300','2026-11-13 17:55:34.300'),('9b95ce79-ded5-41cb-a8bd-ecd09de5e1c3','Apple iPhone 15 Pro (256GB Titanium)','APL-IP15P-256','195949019283','A17 Pro chip, aerospace-grade titanium design, 48MP main camera.','074b4c51-ab6c-40ed-b530-fafb8d0ade8d','8e997cc1-d93e-4d81-b86c-e4a3c58a1720',1,385000.00,435000.00,NULL,12,'2026-11-13 17:55:34.262','2026-11-13 17:55:34.262');
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
INSERT INTO `purchase` VALUES ('74131dd7-65d6-43eb-b960-34046c9423fa','PO-43287486','0b018cc9-89b7-4abf-83f9-04de7a4f72ac','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:01:27.487','2026-11-14 08:01:27.522',125000.00,0.00,125000.00,0.00,'UNPAID','RECEIVED','QA Master Lifecycle PO test | Goods received and inspected','2026-11-14 08:01:27.488','2026-11-14 08:01:27.523',NULL),('a6b3df23-06be-462e-8b01-8f64c3ac2fff','PO-36230985','0b018cc9-89b7-4abf-83f9-04de7a4f72ac','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 06:03:50.985','2026-11-14 06:03:51.028',125000.00,0.00,125000.00,0.00,'UNPAID','RECEIVED','QA Master Lifecycle PO test | Goods received and inspected','2026-11-14 06:03:50.987','2026-11-14 06:03:51.029',NULL),('d95fb33f-886b-4496-ba01-2ce932e0b0d5','PO-43444333','0b018cc9-89b7-4abf-83f9-04de7a4f72ac','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:04:04.333','2026-11-14 08:04:04.379',125000.00,0.00,125000.00,0.00,'UNPAID','RECEIVED','QA Master Lifecycle PO test | Goods received and inspected','2026-11-14 08:04:04.335','2026-11-14 08:04:04.380',NULL),('eadc075c-c5b0-43d2-9776-1f6dca7bfbb0','PO-43603710','0b018cc9-89b7-4abf-83f9-04de7a4f72ac','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:06:43.710','2026-11-14 08:06:43.748',125000.00,0.00,125000.00,0.00,'UNPAID','RECEIVED','QA Master Lifecycle PO test | Goods received and inspected','2026-11-14 08:06:43.711','2026-11-14 08:06:43.749',NULL);
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
INSERT INTO `purchaseitem` VALUES ('380518e2-4c2f-46db-a789-6d3cd962498f','74131dd7-65d6-43eb-b960-34046c9423fa','16ed0a20-16d5-46aa-84d7-308c63b85fdb',10,1500.00,15000.00),('5f81ff88-339a-4646-a3c8-b218d38c1919','eadc075c-c5b0-43d2-9776-1f6dca7bfbb0','1a4826fb-b33d-4371-b1f0-016b447e1295',1,110000.00,110000.00),('a2c3fc8f-0f55-44ff-9bf4-45a79aee3a9d','74131dd7-65d6-43eb-b960-34046c9423fa','1a4826fb-b33d-4371-b1f0-016b447e1295',1,110000.00,110000.00),('a945e297-686f-47eb-b85a-aaa7d3366848','d95fb33f-886b-4496-ba01-2ce932e0b0d5','1a4826fb-b33d-4371-b1f0-016b447e1295',1,110000.00,110000.00),('b924b9e6-6b95-4b7e-8b0a-6e8a5414d240','a6b3df23-06be-462e-8b01-8f64c3ac2fff','16ed0a20-16d5-46aa-84d7-308c63b85fdb',10,1500.00,15000.00),('c13bed38-dcc9-4884-9cc8-e6f8d3556eba','d95fb33f-886b-4496-ba01-2ce932e0b0d5','16ed0a20-16d5-46aa-84d7-308c63b85fdb',10,1500.00,15000.00),('dbb1727d-d531-4022-83fc-7047fd1cf6d0','a6b3df23-06be-462e-8b01-8f64c3ac2fff','1a4826fb-b33d-4371-b1f0-016b447e1295',1,110000.00,110000.00),('e8566670-653e-4a23-8b91-b31a25b5e31f','eadc075c-c5b0-43d2-9776-1f6dca7bfbb0','16ed0a20-16d5-46aa-84d7-308c63b85fdb',10,1500.00,15000.00);
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
INSERT INTO `repairjob` VALUES ('3c9b0b11-dc4a-47c1-b159-9bc9ac43f9bc','REP-261114-4903','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S24 Ultra','REP-IMEI-1794643444444',NULL,NULL,'Display touch unresponsive on lower third',NULL,25000.00,15000.00,'DELIVERED','NORMAL','2026-11-14 08:04:04.448','2026-11-14 08:04:04.473','2026-11-14 08:04:04.448','2026-11-14 08:04:04.498','Original box and wall adapter',0.00,'2026-11-14 08:04:04.489','2026-11-16 08:04:04.444',15000.00,'Minor hairline scratches on bezel, no water damage','Device handed over to customer in working condition with 90-day repair warranty.',NULL),('48cdef95-d9da-4a82-813c-6f45175aaf24','REP-261114-7612','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S24 Ultra','REP-IMEI-1794636231096',NULL,NULL,'Display touch unresponsive on lower third',NULL,25000.00,15000.00,'DELIVERED','NORMAL','2026-11-14 06:03:51.100','2026-11-14 06:03:51.133','2026-11-14 06:03:51.100','2026-11-14 06:03:51.158','Original box and wall adapter',0.00,'2026-11-14 06:03:51.149','2026-11-16 06:03:51.096',15000.00,'Minor hairline scratches on bezel, no water damage','Device handed over to customer in working condition with 90-day repair warranty.',NULL),('4c448cc1-d60f-4324-83a1-9279665babf3','REP-672592-886','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Customer Device',NULL,NULL,NULL,'[Warranty Claim Approved] Display panel has green vertical line across center','Warranty Claim #f8328bb2-7c34-4418-b2c4-0c6fb81114a8: Inspection confirmed hardware panel defect. Authorized for warranty repair.',0.00,NULL,'RECEIVED','HIGH','2026-11-14 03:57:52.593',NULL,'2026-11-14 03:57:52.593','2026-11-14 03:57:52.593','Handset Only',0.00,NULL,NULL,0.00,'Intact / Under Warranty',NULL,'f8328bb2-7c34-4418-b2c4-0c6fb81114a8'),('5c959569-ff60-4305-87fe-c57d30010fd1','REP-420780-994','07317510-86da-41fe-bff4-c9aeac9448f8','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Customer Device',NULL,NULL,NULL,'[Warranty Claim Approved] Display panel has green vertical line across center','Warranty Claim #4fdfb23d-3da7-46ba-bcfe-b87325eb1802: Inspection confirmed hardware panel defect. Authorized for warranty repair.',0.00,NULL,'RECEIVED','HIGH','2026-11-14 03:53:40.782',NULL,'2026-11-14 03:53:40.782','2026-11-14 03:53:40.782','Handset Only',0.00,NULL,NULL,0.00,'Intact / Under Warranty',NULL,'4fdfb23d-3da7-46ba-bcfe-b87325eb1802'),('9b938d3e-7963-4941-b9c2-f40fc3d29830','REP-261114-6910','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S24 Ultra','REP-IMEI-1794643603808',NULL,NULL,'Display touch unresponsive on lower third',NULL,25000.00,15000.00,'DELIVERED','NORMAL','2026-11-14 08:06:43.812','2026-11-14 08:06:43.848','2026-11-14 08:06:43.812','2026-11-14 08:06:43.873','Original box and wall adapter',0.00,'2026-11-14 08:06:43.864','2026-11-16 08:06:43.808',15000.00,'Minor hairline scratches on bezel, no water damage','Device handed over to customer in working condition with 90-day repair warranty.',NULL),('ade696c6-7cd3-4c3a-a5b1-cf1e24105716','REP-565508-593','eec67272-4564-4ae6-b29e-7df536e84976','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Customer Device',NULL,NULL,NULL,'[Warranty Claim Approved] Display panel has green vertical line across center','Warranty Claim #4c64d0fb-a138-4911-8621-e997fbe56cd4: Inspection confirmed hardware panel defect. Authorized for warranty repair.',0.00,NULL,'RECEIVED','HIGH','2026-11-14 03:56:05.509',NULL,'2026-11-14 03:56:05.509','2026-11-14 03:56:05.509','Handset Only',0.00,NULL,NULL,0.00,'Intact / Under Warranty',NULL,'4c64d0fb-a138-4911-8621-e997fbe56cd4'),('c1095f89-2471-4c65-afbe-ea022c9d6bbf','REP-261114-8370','eec67272-4564-4ae6-b29e-7df536e84976','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S23 Ultra (512GB)','354892019482910','R5CW109XXXX','1234','Battery draining fast and overheating during charge','Battery cell degraded to 64% capacity. Replacement OEM Li-ion pack required.',18000.00,NULL,'DIAGNOSING','HIGH','2026-11-14 03:56:05.521',NULL,'2026-11-14 03:56:05.521','2026-11-14 03:56:05.538','Handset + S-Pen + Protective Case',5000.00,NULL,'2026-11-16 03:56:05.517',0.00,'Minor bezel scuffs, display intact','Device disassembled, tested charging current on DC bench.',NULL),('d8222c7b-0086-46c4-8c2e-b560bb712cbc','REP-261114-5141','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S24 Ultra','REP-IMEI-1794643287595',NULL,NULL,'Display touch unresponsive on lower third',NULL,25000.00,15000.00,'DELIVERED','NORMAL','2026-11-14 08:01:27.599','2026-11-14 08:01:27.638','2026-11-14 08:01:27.599','2026-11-14 08:01:27.664','Original box and wall adapter',0.00,'2026-11-14 08:01:27.654','2026-11-16 08:01:27.595',15000.00,'Minor hairline scratches on bezel, no water damage','Device handed over to customer in working condition with 90-day repair warranty.',NULL),('f69479aa-6bbf-4a08-93e3-ec2493405c57','REP-261114-9529','03036dca-2fbf-421e-b124-bce80f517411','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Samsung Galaxy S23 Ultra (512GB)','354892019482910','R5CW109XXXX','1234','Battery draining fast and overheating during charge','New battery calibrated and sealed with waterproof gasket. Tested 100% capacity.',18000.00,15500.00,'DELIVERED','HIGH','2026-11-14 03:57:52.604','2026-11-14 03:57:52.673','2026-11-14 03:57:52.604','2026-11-14 03:57:52.693','Handset + S-Pen + Protective Case',5000.00,'2026-11-14 03:57:52.691','2026-11-16 03:57:52.599',3500.00,'Minor bezel scuffs, display intact','Quality check passed, ready for customer handover.',NULL);
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
INSERT INTO `repairpart` VALUES ('aa2a8281-4644-44d5-8a31-3bd6806b9517','f69479aa-6bbf-4a08-93e3-ec2493405c57','16ed0a20-16d5-46aa-84d7-308c63b85fdb','Anker PowerCore 20,000mAh Powerbank',1,7500.00,12000.00);
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
INSERT INTO `return` VALUES ('2c556c6a-e558-4663-bc82-64d3b46eb740','RET-261114-8130','c663daf5-efe3-4791-a9f5-2d613553465d','03036dca-2fbf-421e-b124-bce80f517411',129000.00,'Customer requested refund: slight color discrepancy','CASH','2026-11-14 04:49:34.049','2026-11-14 04:49:34.100','1d7804c6-5111-40d6-a937-7885eefbef6a','1d7804c6-5111-40d6-a937-7885eefbef6a','Device physical condition verified immaculate. All accessories intact.',NULL,'COMPLETED','REFUND','2026-11-14 04:49:34.102'),('34bfb744-599a-42dc-a440-7bb4b42b81a3','RET-261114-6583','5f58878e-71bd-43ea-b313-a34993de60ff','03036dca-2fbf-421e-b124-bce80f517411',110000.00,'Customer claims screen flickering','CASH','2026-11-14 04:49:34.128','2026-11-14 04:49:34.147','1d7804c6-5111-40d6-a937-7885eefbef6a','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'Device shows physical water damage. Warranty voided as per shop policy.','REJECTED','REFUND','2026-11-14 04:49:34.149'),('46cd3c14-369f-4265-a143-10235f39fbc8','RET-261114-7579','e5124c14-c9e0-4913-9dea-f7f30b580a88','03036dca-2fbf-421e-b124-bce80f517411',129000.00,'Customer requested refund: slight color discrepancy','CASH','2026-11-14 04:49:05.578','2026-11-14 04:49:05.633','1d7804c6-5111-40d6-a937-7885eefbef6a','1d7804c6-5111-40d6-a937-7885eefbef6a','Device physical condition verified immaculate. All accessories intact.',NULL,'COMPLETED','REFUND','2026-11-14 04:49:05.634'),('a8289ea9-2192-45f5-9613-8779096f962c','RET-261114-6500','577b9d25-ebee-41f8-9b95-aab75ec351e6','03036dca-2fbf-421e-b124-bce80f517411',110000.00,'Customer claims screen flickering','CASH','2026-11-14 04:49:05.659','2026-11-14 04:49:05.682','1d7804c6-5111-40d6-a937-7885eefbef6a','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,'Device shows physical water damage. Warranty voided as per shop policy.','REJECTED','REFUND','2026-11-14 04:49:05.683');
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
INSERT INTO `returnitem` VALUES ('1881183c-0fec-4ba8-973e-789d722cfdfa','46cd3c14-369f-4265-a143-10235f39fbc8','219cd308-3fa4-4922-b004-53c4169bc279','e61acb9e-d6ae-41a7-b052-a1bde8f7cf16',1,125000.00,'RESELLABLE',1,'2026-11-14 04:49:05.622'),('5ff6bee4-f266-4cc6-91bb-94b8ec442fe4','2c556c6a-e558-4663-bc82-64d3b46eb740','0fe98c9f-8aca-4043-b9bc-b9c54165ece0','6b77863a-1a5e-4d81-8b0a-82842287bdef',1,125000.00,'RESELLABLE',1,'2026-11-14 04:49:34.090'),('95fa4aed-88f3-40f0-80c7-ab233a1a5320','2c556c6a-e558-4663-bc82-64d3b46eb740','a5215d8d-94a7-48c1-8632-929a4da1110a',NULL,2,4000.00,'RESELLABLE',1,'2026-11-14 04:49:34.099'),('a35a6fff-62ad-466a-8405-fb6d966c0e43','34bfb744-599a-42dc-a440-7bb4b42b81a3','92ceac3f-258a-49d1-8888-d0cacdd73ddc','03587ebd-0cc4-4647-aafa-903ac462fc05',1,110000.00,'DEFECTIVE',0,NULL),('cd476194-2e66-49de-9feb-4bd9fadbec5e','46cd3c14-369f-4265-a143-10235f39fbc8','3089a95d-76d7-46ef-82f9-c2ddf7c118f7',NULL,2,4000.00,'RESELLABLE',1,'2026-11-14 04:49:05.631'),('f056ac4d-c7ad-4b8b-9f5f-a860c63d86ee','a8289ea9-2192-45f5-9613-8779096f962c','1cc262aa-b537-4c16-9c9c-82fca38803d3','ffc41e97-00f5-4a5c-be62-abe15e3d9ea5',1,110000.00,'DEFECTIVE',0,NULL);
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
INSERT INTO `sale` VALUES ('007c842f-93a7-4903-99f4-423bcf8ea06a','INV-43444390','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,150000.00,0.00,0.00,150000.00,150000.00,0.00,'PAID','COMPLETED','QA Master Lifecycle POS sale','2026-11-14 08:04:04.393','2026-11-14 08:04:04.393'),('147e1fbe-bc2b-414c-aeac-1d6725f395ca','INV-43603895','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,120000.00,0.00,0.00,120000.00,120000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 08:06:43.898','2026-11-14 08:06:43.898'),('17afb90b-246b-42a6-b33d-94e7c9c4421d','INV-43287676','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,120000.00,0.00,0.00,120000.00,120000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 08:01:27.678','2026-11-14 08:01:27.678'),('1984f4f4-12de-4b8d-9928-c89da1ed0e04','INV-36231038','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,150000.00,0.00,0.00,150000.00,150000.00,0.00,'PAID','COMPLETED','QA Master Lifecycle POS sale','2026-11-14 06:03:51.041','2026-11-14 06:03:51.041'),('1d624c65-44d5-4d8e-a7cb-a910e7fc39bc','INV-36231170','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,120000.00,0.00,0.00,120000.00,120000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 06:03:51.172','2026-11-14 06:03:51.172'),('25c94f43-16f6-4fc5-b66f-b9fc6eb94854','INV-TEST-P9-1794631703794','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,135000.00,0.00,0.00,135000.00,135000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 04:48:23.796','2026-11-14 04:48:23.796'),('577b9d25-ebee-41f8-9b95-aab75ec351e6','INV-REJ-1794631745649','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,110000.00,0.00,0.00,110000.00,110000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 04:49:05.650','2026-11-14 04:49:05.650'),('5f58878e-71bd-43ea-b313-a34993de60ff','INV-REJ-1794631774116','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,110000.00,0.00,0.00,110000.00,110000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 04:49:34.118','2026-11-14 04:49:34.118'),('6c10762e-5c37-45f2-bcce-9be0c481aecc','INV-43444511','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,120000.00,0.00,0.00,120000.00,120000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 08:04:04.513','2026-11-14 08:04:04.513'),('998993aa-5a46-4aa1-8086-7ab3f882d59e','INV-43603758','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,150000.00,0.00,0.00,150000.00,150000.00,0.00,'PAID','COMPLETED','QA Master Lifecycle POS sale','2026-11-14 08:06:43.760','2026-11-14 08:06:43.760'),('c663daf5-efe3-4791-a9f5-2d613553465d','INV-TEST-P9-1794631774011','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,135000.00,0.00,0.00,135000.00,135000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 04:49:34.013','2026-11-14 04:49:34.013'),('d1520aaf-719a-4c69-be08-f9190edec1e3','INV-43287531','03036dca-2fbf-421e-b124-bce80f517411','16a379f5-3ae5-410d-95c3-885b9455ac8b',NULL,150000.00,0.00,0.00,150000.00,150000.00,0.00,'PAID','COMPLETED','QA Master Lifecycle POS sale','2026-11-14 08:01:27.534','2026-11-14 08:01:27.534'),('e5124c14-c9e0-4913-9dea-f7f30b580a88','INV-TEST-P9-1794631745489','03036dca-2fbf-421e-b124-bce80f517411','1d7804c6-5111-40d6-a937-7885eefbef6a',NULL,135000.00,0.00,0.00,135000.00,135000.00,0.00,'PAID','COMPLETED',NULL,'2026-11-14 04:49:05.491','2026-11-14 04:49:05.491');
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
INSERT INTO `saleitem` VALUES ('083f9a13-472d-425e-a183-715914670a5b','17afb90b-246b-42a6-b33d-94e7c9c4421d','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,120000.00,0.00,120000.00,12),('0fe98c9f-8aca-4043-b9bc-b9c54165ece0','c663daf5-efe3-4791-a9f5-2d613553465d','1a4826fb-b33d-4371-b1f0-016b447e1295',1,100000.00,125000.00,0.00,125000.00,0),('1cc262aa-b537-4c16-9c9c-82fca38803d3','577b9d25-ebee-41f8-9b95-aab75ec351e6','1a4826fb-b33d-4371-b1f0-016b447e1295',1,90000.00,110000.00,0.00,110000.00,0),('1ffae6ca-e098-4c56-9a08-3fcf08eac237','998993aa-5a46-4aa1-8086-7ab3f882d59e','16ed0a20-16d5-46aa-84d7-308c63b85fdb',2,14500.00,2500.00,0.00,5000.00,18),('219cd308-3fa4-4922-b004-53c4169bc279','e5124c14-c9e0-4913-9dea-f7f30b580a88','1a4826fb-b33d-4371-b1f0-016b447e1295',1,100000.00,125000.00,0.00,125000.00,0),('286b791a-fc37-4f58-a880-1a915a4a030a','1984f4f4-12de-4b8d-9928-c89da1ed0e04','16ed0a20-16d5-46aa-84d7-308c63b85fdb',2,14500.00,2500.00,0.00,5000.00,18),('3089a95d-76d7-46ef-82f9-c2ddf7c118f7','e5124c14-c9e0-4913-9dea-f7f30b580a88','16ed0a20-16d5-46aa-84d7-308c63b85fdb',5,1200.00,2000.00,0.00,10000.00,0),('42711ffb-fec7-4bd4-a993-b3d97d97ca6f','25c94f43-16f6-4fc5-b66f-b9fc6eb94854','16ed0a20-16d5-46aa-84d7-308c63b85fdb',5,1200.00,2000.00,0.00,10000.00,0),('5ed943eb-ff17-4562-9aba-75a68c9f5714','6c10762e-5c37-45f2-bcce-9be0c481aecc','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,120000.00,0.00,120000.00,12),('6701e4a2-362b-4ea9-861d-77103300e880','007c842f-93a7-4903-99f4-423bcf8ea06a','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,145000.00,0.00,145000.00,12),('771b5682-02dc-4ca7-9725-c566e779e68e','d1520aaf-719a-4c69-be08-f9190edec1e3','16ed0a20-16d5-46aa-84d7-308c63b85fdb',2,14500.00,2500.00,0.00,5000.00,18),('8791f77f-ba69-494f-ade9-1b6f583bc5a0','1984f4f4-12de-4b8d-9928-c89da1ed0e04','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,145000.00,0.00,145000.00,12),('92ceac3f-258a-49d1-8888-d0cacdd73ddc','5f58878e-71bd-43ea-b313-a34993de60ff','1a4826fb-b33d-4371-b1f0-016b447e1295',1,90000.00,110000.00,0.00,110000.00,0),('a5215d8d-94a7-48c1-8632-929a4da1110a','c663daf5-efe3-4791-a9f5-2d613553465d','16ed0a20-16d5-46aa-84d7-308c63b85fdb',5,1200.00,2000.00,0.00,10000.00,0),('b1520cdc-6c21-46a6-9c5d-23a338ec8d37','1d624c65-44d5-4d8e-a7cb-a910e7fc39bc','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,120000.00,0.00,120000.00,12),('bfb84226-a6f8-414d-a20a-5a071833bc8c','147e1fbe-bc2b-414c-aeac-1d6725f395ca','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,120000.00,0.00,120000.00,12),('d7cc0592-2a86-4e74-8b6f-4be119a94016','25c94f43-16f6-4fc5-b66f-b9fc6eb94854','1a4826fb-b33d-4371-b1f0-016b447e1295',1,100000.00,125000.00,0.00,125000.00,0),('e01b26f4-b393-4bd9-bc35-e622cef1f2a7','d1520aaf-719a-4c69-be08-f9190edec1e3','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,145000.00,0.00,145000.00,12),('f7a787bf-5ae8-411a-95a2-db00ee1809ff','007c842f-93a7-4903-99f4-423bcf8ea06a','16ed0a20-16d5-46aa-84d7-308c63b85fdb',2,14500.00,2500.00,0.00,5000.00,18),('fb46c635-dee6-46e8-9926-e888f6a0ab59','998993aa-5a46-4aa1-8086-7ab3f882d59e','1a4826fb-b33d-4371-b1f0-016b447e1295',1,410000.00,145000.00,0.00,145000.00,12);
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
INSERT INTO `saleitemdevice` VALUES ('197f3585-1f80-45db-b208-bbb9bea8ef50','1cc262aa-b537-4c16-9c9c-82fca38803d3','ffc41e97-00f5-4a5c-be62-abe15e3d9ea5','2026-11-14 04:49:05.650'),('243924c7-e5e6-4f90-bf07-59455e49b2c0','b1520cdc-6c21-46a6-9c5d-23a338ec8d37','779db002-358b-497d-ab6f-63eb47e0d7bd','2026-11-14 06:03:51.178'),('2c114186-5c33-4107-a53a-7f9d4e0605be','219cd308-3fa4-4922-b004-53c4169bc279','e61acb9e-d6ae-41a7-b052-a1bde8f7cf16','2026-11-14 04:49:05.491'),('3c6dcc80-1ae2-47ce-adfb-23c553277913','6701e4a2-362b-4ea9-861d-77103300e880','4b311ea2-9475-45a9-8826-a922fc84c7e0','2026-11-14 08:04:04.400'),('3dc83ee0-06b5-4cde-8388-e3168aef2183','bfb84226-a6f8-414d-a20a-5a071833bc8c','dd26470c-3e74-4570-bcac-62dd6acfc51c','2026-11-14 08:06:43.913'),('42e463e7-5308-477f-a64c-e2a106e7b8d3','0fe98c9f-8aca-4043-b9bc-b9c54165ece0','6b77863a-1a5e-4d81-8b0a-82842287bdef','2026-11-14 04:49:34.013'),('544283c4-3e2b-460d-81f9-c18e024eb057','d7cc0592-2a86-4e74-8b6f-4be119a94016','c4505051-356a-4b8c-842f-d44dc4e78d72','2026-11-14 04:48:23.796'),('65a3bdea-cd21-42c0-af26-dd10da4dc4d3','5ed943eb-ff17-4562-9aba-75a68c9f5714','f02e56eb-eda4-4376-925c-10d7ab07c9fb','2026-11-14 08:04:04.518'),('6cd3865c-0128-4c45-81da-e7d31f68817a','fb46c635-dee6-46e8-9926-e888f6a0ab59','bd86a5a2-28f6-4cad-838e-781247964fd5','2026-11-14 08:06:43.765'),('75296a10-5309-45b2-a7e9-1982014257e1','8791f77f-ba69-494f-ade9-1b6f583bc5a0','eede0ec6-2bbf-4fbd-aa23-ea449b5fed57','2026-11-14 06:03:51.052'),('aaa84dc2-557e-42ef-98e1-5dabf6ca3369','e01b26f4-b393-4bd9-bc35-e622cef1f2a7','9528861b-86e9-4826-8c29-46b8b2f9d1de','2026-11-14 08:01:27.542'),('db17a1e5-aa94-4edc-960f-d2faa36dd7cc','083f9a13-472d-425e-a183-715914670a5b','14ea449f-99b9-4e3c-8280-be0bb59f88ef','2026-11-14 08:01:27.688'),('f4c69b6d-a87a-4044-a1b9-bb3c6144e5e6','92ceac3f-258a-49d1-8888-d0cacdd73ddc','03587ebd-0cc4-4647-aafa-903ac462fc05','2026-11-14 04:49:34.118');
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
INSERT INTO `stockmovement` VALUES ('067cf1a2-7bf3-4387-976e-23626fb27bf3','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-36231170','Retail Sale #INV-36231170 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 06:03:51.186'),('0c451cba-a256-4da0-bb53-3c16c152ba04','1a4826fb-b33d-4371-b1f0-016b447e1295','PURCHASE',1,0,1,110000.00,'PO-43603710','Purchase Receipt (GRN): 1 serialized units','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:06:43.742'),('13cfa3cd-7dff-48bc-a2e2-3818a466c805','16ed0a20-16d5-46aa-84d7-308c63b85fdb','SALE',2,55,53,14500.00,'INV-43603758','Retail Sale #INV-43603758','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:06:43.781'),('406cd6d7-d4a8-437d-87db-02e0a5b0c5ec','16ed0a20-16d5-46aa-84d7-308c63b85fdb','PURCHASE',10,37,47,1500.00,'PO-43444333','Purchase Receipt (GRN): 10 units received','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:04:04.379'),('40ba1300-d1bf-4469-aafc-36769fea3221','1a4826fb-b33d-4371-b1f0-016b447e1295','RETURN',1,0,1,100000.00,'RET-RET-261114-8130','Returned serialized device (IMEI: TEST-P9-1794631774008) restocked to inventory','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 04:49:34.089'),('59ca689f-2a61-4f33-832c-0602837ec9f2','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43444390','Retail Sale #INV-43444390 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:04:04.411'),('61d155c5-9a46-4595-90b6-f64dce336bb3','1a4826fb-b33d-4371-b1f0-016b447e1295','PURCHASE',1,0,1,110000.00,'PO-43287486','Purchase Receipt (GRN): 1 serialized units','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:01:27.522'),('63920861-5905-48b0-a594-c2876e200f95','16ed0a20-16d5-46aa-84d7-308c63b85fdb','PURCHASE',10,29,39,1500.00,'PO-43287486','Purchase Receipt (GRN): 10 units received','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:01:27.510'),('68668bcd-3c1a-4bed-8b91-4a7760fb9525','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43603895','Retail Sale #INV-43603895 (1 units)','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:06:43.925'),('7c1f4e9b-f03e-4010-b490-71fa6fc62cc2','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43287531','Retail Sale #INV-43287531 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:01:27.554'),('85bc5898-d986-4263-9f23-dd1efebb3774','16ed0a20-16d5-46aa-84d7-308c63b85fdb','RETURN',2,19,21,1200.00,'RET-RET-261114-8130','Customer return restocked into inventory','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 04:49:34.096'),('85c09bef-a39b-4fe6-861c-733077538026','16ed0a20-16d5-46aa-84d7-308c63b85fdb','PURCHASE',10,21,31,1500.00,'PO-36230985','Purchase Receipt (GRN): 10 units received','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 06:03:51.014'),('8f6718c3-0ae2-4c0c-a8a1-da56c553fd83','1a4826fb-b33d-4371-b1f0-016b447e1295','PURCHASE',1,0,1,110000.00,'PO-43444333','Purchase Receipt (GRN): 1 serialized units','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:04:04.369'),('922634ad-44df-44c1-a05d-9850a613c7f3','16ed0a20-16d5-46aa-84d7-308c63b85fdb','SALE',2,39,37,14500.00,'INV-43287531','Retail Sale #INV-43287531','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:01:27.564'),('989f265a-eea3-4de0-a103-ef46e5698637','16ed0a20-16d5-46aa-84d7-308c63b85fdb','SALE',2,31,29,14500.00,'INV-36231038','Retail Sale #INV-36231038','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 06:03:51.073'),('9cb4e275-4e88-4124-a967-214c75914d72','1a4826fb-b33d-4371-b1f0-016b447e1295','PURCHASE',1,0,1,110000.00,'PO-36230985','Purchase Receipt (GRN): 1 serialized units','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 06:03:51.026'),('ad2ed950-6ebc-441a-850a-950851a85352','16ed0a20-16d5-46aa-84d7-308c63b85fdb','SALE',2,47,45,14500.00,'INV-43444390','Retail Sale #INV-43444390','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:04:04.418'),('ca339415-4ff0-41a1-8efb-4f22a7086108','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-36231038','Retail Sale #INV-36231038 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 06:03:51.067'),('cf84e113-8eaa-4005-9c90-ea0a54a198d0','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43287676','Retail Sale #INV-43287676 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:01:27.703'),('d82b1b1b-8c19-44fa-91be-07a34d6d56e4','1a4826fb-b33d-4371-b1f0-016b447e1295','RETURN',1,0,1,100000.00,'RET-RET-261114-7579','Returned serialized device (IMEI: TEST-P9-1794631745484) restocked to inventory','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 04:49:05.618'),('da2b7fb4-38a7-4c69-bc49-ba62edb40848','16ed0a20-16d5-46aa-84d7-308c63b85fdb','RETURN',2,17,19,1200.00,'RET-RET-261114-7579','Customer return restocked into inventory','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 04:49:05.630'),('e807407a-d6e1-409b-b981-56db4de5a5f9','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43444511','Retail Sale #INV-43444511 (1 units)','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:04:04.527'),('f37f7984-6be3-4087-ad8b-3b37d7f4bc53','16ed0a20-16d5-46aa-84d7-308c63b85fdb','REPAIR_CONSUMPTION',-1,18,17,7500.00,'TICKET-REP-261114-9529','Part consumption for repair #REP-261114-9529','0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','2026-11-14 03:57:52.658'),('fc5064b8-c9ed-44b3-8a9f-98680e053a12','1a4826fb-b33d-4371-b1f0-016b447e1295','SALE',1,0,0,410000.00,'INV-43603758','Retail Sale #INV-43603758 (1 units)','16a379f5-3ae5-410d-95c3-885b9455ac8b','2026-11-14 08:06:43.777'),('ff78451f-9f7e-4e7d-888f-20a7806e3476','16ed0a20-16d5-46aa-84d7-308c63b85fdb','PURCHASE',10,45,55,1500.00,'PO-43603710','Purchase Receipt (GRN): 10 units received','1d7804c6-5111-40d6-a937-7885eefbef6a','2026-11-14 08:06:43.747');
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
INSERT INTO `supplier` VALUES ('0b018cc9-89b7-4abf-83f9-04de7a4f72ac','Singer Sri Lanka PLC','Singer Sri Lanka PLC','Suresh Wickramasinghe','+94 11 245 8890','sales@singersl.com','No. 320, Union Place, Colombo 02',30,'2026-11-13 17:55:34.238','2026-11-13 18:32:36.614'),('2716691d-ed6e-44cc-8975-588ec77e8840','Softlogic Communications','Softlogic Holdings PLC','Pradeep Silva','+94 11 556 7000','pradeep.s@softlogic.lk','No. 14, De Fonseka Place, Colombo 05',15,'2026-11-13 17:55:34.242','2026-11-13 18:32:36.619'),('4e5309b8-1611-4c3b-8c43-37944dc999a3','Anker Direct Distributor','TechZone Distributors (Pvt) Ltd','Mohamed Farhan','+94 77 890 1234','farhan@ankersl.lk','No. 88, Galle Road, Colombo 04',0,'2026-11-13 17:55:34.246','2026-11-13 18:32:36.622');
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
INSERT INTO `user` VALUES ('0a64ffcd-5881-4db9-898b-ccd2e3d4e63f','Nimal Perera','manager@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 71 234 5678','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','8fef3122-2fb5-477c-8f6a-19ebe8e9ab47',1,'2026-11-13 18:36:21.014','2026-11-13 17:54:00.964','2026-11-13 18:36:21.016',NULL,NULL),('0c5d25c2-3884-4279-81fd-f6fa4c2d7f18','Dinesh Fernando','tech@nexapos.lk','$2a$10$kDNje0gHHSRyGM9Ergh2PuiuxxFWyAwDpYDS19oZBb73i1NaNdu4C','+94 72 456 7890','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150','faa67fbe-8307-414b-abcf-bac75e0d23e9',1,'2026-11-13 18:36:22.558','2026-11-13 17:54:00.970','2026-11-13 18:36:22.918',NULL,NULL),('16a379f5-3ae5-410d-95c3-885b9455ac8b','Chamari Silva','cashier@nexapos.lk','$2a$10$Aakleq.KDXr/JUuJVMJWXu..WseCROFnVdzhIOUQx0E.uir6cvd7W','+94 76 345 6789','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150','a925459d-0362-462f-81c5-efd3a44975c0',1,'2026-11-13 18:36:21.139','2026-11-13 17:54:00.967','2026-11-13 18:36:22.290',NULL,NULL),('1d7804c6-5111-40d6-a937-7885eefbef6a','Kasun Jayawardena','admin@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 77 123 4567','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150','73ffe0e8-fd97-4996-9259-f18597f0850f',1,'2026-11-14 08:06:43.554','2026-11-13 17:54:00.958','2026-11-14 08:06:43.556',NULL,NULL),('7a6dd9ec-3a54-4c7b-b2e4-840800f9c141','Roshan Wickrama','stock@nexapos.lk','$2a$10$t8uyuigPNoOUGW/nD05Q8Oyo2TMd0zALNdzW8nAAaXxzUUBnWvSNW','+94 78 567 8901','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150','cc044292-2880-4f89-9bf1-13068026e275',1,'2026-11-13 18:36:21.387','2026-11-13 17:54:00.972','2026-11-13 18:36:21.389',NULL,NULL);
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
INSERT INTO `warranty` VALUES ('0340576b-7a6e-4ad5-bf97-53ff9e7ab5e3','WAR-3603772-594','bd86a5a2-28f6-4cad-838e-781247964fd5','03036dca-2fbf-421e-b124-bce80f517411','998993aa-5a46-4aa1-8086-7ab3f882d59e','2026-11-14 08:06:43.772','2027-11-14 08:06:43.772','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:06:43.773','2026-11-14 08:06:43.773'),('1fc19519-6a5d-4fcf-b84e-6b2fb85b611a','WAR-8420752-363',NULL,'07317510-86da-41fe-bff4-c9aeac9448f8',NULL,'2026-11-14 03:53:40.751','2027-11-14 03:53:40.751','12 Months Comprehensive NexaPOS Test Warranty','CLAIMED','2026-11-14 03:53:40.755','2026-11-14 03:53:40.775'),('4dcc026b-358c-4c76-b0fb-2347e9a33748','WAR-3287549-699','9528861b-86e9-4826-8c29-46b8b2f9d1de','03036dca-2fbf-421e-b124-bce80f517411','d1520aaf-719a-4c69-be08-f9190edec1e3','2026-11-14 08:01:27.549','2027-11-14 08:01:27.549','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:01:27.550','2026-11-14 08:01:27.550'),('5d8bed97-a594-4869-8e4a-732ab1fdaed9','WAR-8565481-704',NULL,'eec67272-4564-4ae6-b29e-7df536e84976',NULL,'2026-11-14 03:56:05.480','2027-11-14 03:56:05.480','12 Months Comprehensive NexaPOS Test Warranty','CLAIMED','2026-11-14 03:56:05.483','2026-11-14 03:56:05.502'),('8016f713-7eaa-427e-8c41-f824443d6627','WAR-ACC-287564-423',NULL,'03036dca-2fbf-421e-b124-bce80f517411','d1520aaf-719a-4c69-be08-f9190edec1e3','2026-11-14 08:01:27.564','2028-05-14 08:01:27.564','18 Months Accessory Warranty.','ACTIVE','2026-11-14 08:01:27.565','2026-11-14 08:01:27.565'),('8f9504f3-b16c-4d01-b7f9-59104f9fc80d','WAR-8672565-192',NULL,'03036dca-2fbf-421e-b124-bce80f517411',NULL,'2026-11-14 03:57:52.564','2027-11-14 03:57:52.564','12 Months Comprehensive NexaPOS Test Warranty','CLAIMED','2026-11-14 03:57:52.568','2026-11-14 03:57:52.587'),('964503a9-ba11-46b8-b19b-0e52b23e52a1','WAR-6231181-471','779db002-358b-497d-ab6f-63eb47e0d7bd','03036dca-2fbf-421e-b124-bce80f517411','1d624c65-44d5-4d8e-a7cb-a910e7fc39bc','2026-11-14 06:03:51.181','2027-11-14 06:03:51.181','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 06:03:51.182','2026-11-14 06:03:51.182'),('98d427d4-8dee-4434-a0ff-a72e46017162','WAR-ACC-444418-727',NULL,'03036dca-2fbf-421e-b124-bce80f517411','007c842f-93a7-4903-99f4-423bcf8ea06a','2026-11-14 08:04:04.418','2028-05-14 08:04:04.418','18 Months Accessory Warranty.','ACTIVE','2026-11-14 08:04:04.419','2026-11-14 08:04:04.419'),('a15a13fb-6ec4-4dc3-b27b-0eeeabf621b8','WAR-ACC-603783-393',NULL,'03036dca-2fbf-421e-b124-bce80f517411','998993aa-5a46-4aa1-8086-7ab3f882d59e','2026-11-14 08:06:43.783','2028-05-14 08:06:43.783','18 Months Accessory Warranty.','ACTIVE','2026-11-14 08:06:43.784','2026-11-14 08:06:43.784'),('a240b540-14c3-42ea-8be8-7cfb293f2f02','WAR-6231058-520','eede0ec6-2bbf-4fbd-aa23-ea449b5fed57','03036dca-2fbf-421e-b124-bce80f517411','1984f4f4-12de-4b8d-9928-c89da1ed0e04','2026-11-14 06:03:51.058','2027-11-14 06:03:51.058','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 06:03:51.060','2026-11-14 06:03:51.060'),('aac8d8e3-e8c4-4b97-8aab-556877e8ff57','WAR-3444404-312','4b311ea2-9475-45a9-8826-a922fc84c7e0','03036dca-2fbf-421e-b124-bce80f517411','007c842f-93a7-4903-99f4-423bcf8ea06a','2026-11-14 08:04:04.404','2027-11-14 08:04:04.404','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:04:04.406','2026-11-14 08:04:04.406'),('af757852-a85c-41ec-b282-932a300de687','WAR-3287698-552','14ea449f-99b9-4e3c-8280-be0bb59f88ef','03036dca-2fbf-421e-b124-bce80f517411','17afb90b-246b-42a6-b33d-94e7c9c4421d','2026-11-14 08:01:27.698','2027-11-14 08:01:27.698','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:01:27.699','2026-11-14 08:01:27.699'),('bc4140aa-cdc2-440e-984f-95a011b15eac','WAR-3444522-684','f02e56eb-eda4-4376-925c-10d7ab07c9fb','03036dca-2fbf-421e-b124-bce80f517411','6c10762e-5c37-45f2-bcce-9be0c481aecc','2026-11-14 08:04:04.522','2027-11-14 08:04:04.522','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:04:04.523','2026-11-14 08:04:04.523'),('d6683000-b91a-4e37-8882-5174119d7b6c','WAR-ACC-231073-332',NULL,'03036dca-2fbf-421e-b124-bce80f517411','1984f4f4-12de-4b8d-9928-c89da1ed0e04','2026-11-14 06:03:51.073','2028-05-14 06:03:51.073','18 Months Accessory Warranty.','ACTIVE','2026-11-14 06:03:51.074','2026-11-14 06:03:51.074'),('e9b8f98c-674c-4440-8ef3-e47cca212b6b','WAR-3603921-958','dd26470c-3e74-4570-bcac-62dd6acfc51c','03036dca-2fbf-421e-b124-bce80f517411','147e1fbe-bc2b-414c-aeac-1d6725f395ca','2026-11-14 08:06:43.921','2027-11-14 08:06:43.921','12 Months NexaPOS Comprehensive Hardware Warranty.','ACTIVE','2026-11-14 08:06:43.922','2026-11-14 08:06:43.922');
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
INSERT INTO `warrantyclaim` VALUES ('4c64d0fb-a138-4911-8621-e997fbe56cd4','5d8bed97-a594-4869-8e4a-732ab1fdaed9','2026-11-14 03:56:05.498','Display panel has green vertical line across center','Inspection confirmed hardware panel defect. Authorized for warranty repair.','APPROVED','2026-11-14 03:56:05.514'),('4fdfb23d-3da7-46ba-bcfe-b87325eb1802','1fc19519-6a5d-4fcf-b84e-6b2fb85b611a','2026-11-14 03:53:40.771','Display panel has green vertical line across center','Inspection confirmed hardware panel defect. Authorized for warranty repair.','APPROVED','2026-11-14 03:53:40.784'),('f8328bb2-7c34-4418-b2c4-0c6fb81114a8','8f9504f3-b16c-4d01-b7f9-59104f9fc80d','2026-11-14 03:57:52.583','Display panel has green vertical line across center','Inspection confirmed hardware panel defect. Authorized for warranty repair.','APPROVED','2026-11-14 03:57:52.596');
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

-- Dump completed on 2026-11-14 13:50:00
