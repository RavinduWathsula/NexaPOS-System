USE nexapos_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE warrantyclaim;
TRUNCATE TABLE warranty;
TRUNCATE TABLE repairpart;
TRUNCATE TABLE repairjob;
TRUNCATE TABLE returnitem;
TRUNCATE TABLE `return`;
TRUNCATE TABLE payment;
TRUNCATE TABLE saleitemdevice;
TRUNCATE TABLE saleitem;
TRUNCATE TABLE sale;
TRUNCATE TABLE purchaseitem;
TRUNCATE TABLE purchase;
TRUNCATE TABLE stockmovement;
TRUNCATE TABLE stockadjustment;
TRUNCATE TABLE inventory;
TRUNCATE TABLE devicestatushistory;
TRUNCATE TABLE device;
TRUNCATE TABLE productimage;
TRUNCATE TABLE productvariant;
TRUNCATE TABLE product;
TRUNCATE TABLE category;
TRUNCATE TABLE brand;
TRUNCATE TABLE customer;
TRUNCATE TABLE supplier;
TRUNCATE TABLE cashsession;
TRUNCATE TABLE expense;
TRUNCATE TABLE auditlog;

SET FOREIGN_KEY_CHECKS = 1;

