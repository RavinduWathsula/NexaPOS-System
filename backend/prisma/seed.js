// NexaPOS Database Seed Script
// Populates roles, permissions, admin user, categories, brands, products, devices, customers, suppliers and settings

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting NexaPOS database seed...')

  // 1. ROLES
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Admin / Owner',
      description: 'Full unrestricted system, financial and operational access.',
      isSystem: true,
    },
    {
      name: 'MANAGER',
      displayName: 'Store Manager',
      description: 'Store operations, purchases, inventory, sales and reports.',
      isSystem: true,
    },
    {
      name: 'CASHIER',
      displayName: 'Cashier',
      description: 'POS sales terminal, customer invoice creation and daily cash register.',
      isSystem: true,
    },
    {
      name: 'TECHNICIAN',
      displayName: 'Repair Technician',
      description: 'Device repair management, diagnostics and warranty verification.',
      isSystem: true,
    },
    {
      name: 'STOCK_KEEPER',
      displayName: 'Stock Keeper',
      description: 'Warehouse stock intake, IMEI serial registration and inventory movements.',
      isSystem: true,
    },
  ]

  const createdRoles = {}
  for (const role of rolesData) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, description: role.description },
      create: role,
    })
    createdRoles[role.name] = r
  }
  console.log('✅ Created 5 user roles.')

  // 2. PERMISSIONS
  const permissionsData = [
    // POS & Sales
    { code: 'pos:access', name: 'Access POS Terminal', module: 'pos' },
    { code: 'sales:create', name: 'Process Sales & Invoices', module: 'pos' },
    { code: 'sales:view', name: 'View Sales History', module: 'pos' },
    { code: 'sales:refund', name: 'Issue Returns & Refunds', module: 'pos' },
    // Inventory & Catalog
    { code: 'products:view', name: 'View Catalog', module: 'inventory' },
    { code: 'products:manage', name: 'Manage Products & Prices', module: 'inventory' },
    { code: 'imei:register', name: 'Register Serial & IMEI', module: 'inventory' },
    { code: 'inventory:adjust', name: 'Stock Adjustments & Transfers', module: 'inventory' },
    // Procurement & Suppliers
    { code: 'purchases:manage', name: 'Manage Purchase Orders', module: 'procurement' },
    { code: 'suppliers:manage', name: 'Manage Suppliers', module: 'procurement' },
    // Repairs & Warranty
    { code: 'repairs:manage', name: 'Manage Repair Jobs', module: 'repairs' },
    { code: 'warranty:manage', name: 'Issue & Claim Warranties', module: 'repairs' },
    // Finance & Reports
    { code: 'reports:view', name: 'View Financial Analytics', module: 'finance' },
    { code: 'expenses:manage', name: 'Record Operating Expenses', module: 'finance' },
    // Administration
    { code: 'users:manage', name: 'Manage Staff & Roles', module: 'admin' },
    { code: 'settings:manage', name: 'System Settings & Config', module: 'admin' },
  ]

  const createdPermissions = {}
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, module: perm.module },
      create: perm,
    })
    createdPermissions[perm.code] = p
  }
  console.log(`✅ Created ${Object.keys(createdPermissions).length} permissions.`)

  // Assign All Permissions to Super Admin
  for (const perm of Object.values(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: createdRoles.SUPER_ADMIN.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: createdRoles.SUPER_ADMIN.id,
        permissionId: perm.id,
      },
    })
  }

  // 3. STAFF USERS (Hashed development credentials)
  const defaultPassword = await bcrypt.hash('Password@123', 10)

  const usersData = [
    {
      name: 'Kasun Jayawardena',
      email: 'admin@nexapos.lk',
      password: defaultPassword,
      phone: '+94 77 123 4567',
      roleId: createdRoles.SUPER_ADMIN.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      name: 'Nimal Perera',
      email: 'manager@nexapos.lk',
      password: defaultPassword,
      phone: '+94 71 234 5678',
      roleId: createdRoles.MANAGER.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Chamari Silva',
      email: 'cashier@nexapos.lk',
      password: defaultPassword,
      phone: '+94 76 345 6789',
      roleId: createdRoles.CASHIER.id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Dinesh Fernando',
      email: 'tech@nexapos.lk',
      password: defaultPassword,
      phone: '+94 72 456 7890',
      roleId: createdRoles.TECHNICIAN.id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      name: 'Roshan Wickrama',
      email: 'stock@nexapos.lk',
      password: defaultPassword,
      phone: '+94 78 567 8901',
      roleId: createdRoles.STOCK_KEEPER.id,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  ]

  for (const usr of usersData) {
    await prisma.user.upsert({
      where: { email: usr.email },
      update: { roleId: usr.roleId, name: usr.name, phone: usr.phone },
      create: usr,
    })
  }
  console.log('✅ Created 5 staff user accounts with hashed development credentials.')

  // 4. CATEGORIES
  const categoriesData = [
    { name: 'Smartphones & Handsets', slug: 'smartphones', description: 'Serialized IMEI mobile phones' },
    { name: 'Tablets & iPads', slug: 'tablets', description: 'Tablets and cellular pads' },
    { name: 'Audio & Headphones', slug: 'audio', description: 'Earphones, wireless earbuds & headphones' },
    { name: 'Fast Chargers & Power', slug: 'charging', description: 'Wall adapters, cables and powerbanks' },
    { name: 'Screen & Body Protection', slug: 'protection', description: 'Tempered glass and phone cases' },
    { name: 'Repair Spare Parts', slug: 'spare-parts', description: 'Displays, battery packs and charging ICs' },
  ]

  const createdCategories = {}
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    })
    createdCategories[cat.slug] = c
  }
  console.log('✅ Created product categories.')

  // 5. BRANDS
  const brandsData = [
    { name: 'Apple', slug: 'apple', country: 'United States' },
    { name: 'Samsung', slug: 'samsung', country: 'South Korea' },
    { name: 'Xiaomi', slug: 'xiaomi', country: 'China' },
    { name: 'Sony', slug: 'sony', country: 'Japan' },
    { name: 'Anker', slug: 'anker', country: 'United States' },
    { name: 'Spigen', slug: 'spigen', country: 'United States' },
    { name: 'Baseus', slug: 'baseus', country: 'China' },
  ]

  const createdBrands = {}
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, country: b.country },
      create: b,
    })
    createdBrands[b.slug] = brand
  }
  console.log('✅ Created electronics brands.')

  // 6. SUPPLIERS
  const suppliersData = [
    {
      name: 'Singer Sri Lanka PLC',
      company: 'Singer Sri Lanka PLC',
      contactPerson: 'Suresh Wickramasinghe',
      phone: '+94 11 245 8890',
      email: 'sales@singersl.com',
      address: 'No. 320, Union Place, Colombo 02',
      creditDays: 30,
    },
    {
      name: 'Softlogic Communications',
      company: 'Softlogic Holdings PLC',
      contactPerson: 'Pradeep Silva',
      phone: '+94 11 556 7000',
      email: 'pradeep.s@softlogic.lk',
      address: 'No. 14, De Fonseka Place, Colombo 05',
      creditDays: 15,
    },
    {
      name: 'Anker Direct Distributor',
      company: 'TechZone Distributors (Pvt) Ltd',
      contactPerson: 'Mohamed Farhan',
      phone: '+94 77 890 1234',
      email: 'farhan@ankersl.lk',
      address: 'No. 88, Galle Road, Colombo 04',
      creditDays: 0,
    },
  ]

  for (const supp of suppliersData) {
    await prisma.supplier.upsert({
      where: { phone: supp.phone },
      update: { name: supp.name, contactPerson: supp.contactPerson },
      create: supp,
    })
  }
  console.log('✅ Created suppliers.')

  // 7. CUSTOMERS
  const customersData = [
    {
      name: 'Kamal Jayawardena',
      phone: '+94 77 123 4567',
      email: 'kamal.j@gmail.com',
      nic: '198912345678',
      address: 'No. 45, Flower Road, Colombo 07',
      loyaltyTier: 'GOLD',
      loyaltyPoints: 1250,
    },
    {
      name: 'Nadeeka Senanayake',
      phone: '+94 71 889 2311',
      email: 'nadeeka.s@outlook.com',
      nic: '199256789012',
      address: 'No. 12, Kandy Road, Kadawatha',
      loyaltyTier: 'SILVER',
      loyaltyPoints: 680,
    },
    {
      name: 'Dilan Ranasinghe',
      phone: '+94 76 443 1928',
      email: 'dilan.rana@yahoo.com',
      nic: '199534567890',
      address: 'No. 78, High Level Road, Nugegoda',
      loyaltyTier: 'STANDARD',
      loyaltyPoints: 150,
    },
  ]

  for (const cust of customersData) {
    await prisma.customer.upsert({
      where: { phone: cust.phone },
      update: { name: cust.name, email: cust.email },
      create: cust,
    })
  }
  console.log('✅ Created customers.')

  // 8. PRODUCTS & SERIALIZED DEVICES
  // Product 1: iPhone 15 Pro (Serialized)
  const iphone15 = await prisma.product.upsert({
    where: { sku: 'APL-IP15P-256' },
    update: {},
    create: {
      name: 'Apple iPhone 15 Pro (256GB Titanium)',
      sku: 'APL-IP15P-256',
      barcode: '195949019283',
      description: 'A17 Pro chip, aerospace-grade titanium design, 48MP main camera.',
      categoryId: createdCategories.smartphones.id,
      brandId: createdBrands.apple.id,
      isSerialized: true,
      costPrice: 385000.00,
      retailPrice: 435000.00,
      defaultWarrantyMonths: 12,
    },
  })

  // Devices for iPhone 15 Pro
  const iphoneIMEIs = [
    { imei1: '354892019482910', imei2: '354892019482911', serialNumber: 'SN-APL-15P-001', color: 'Natural Titanium', storage: '256GB' },
    { imei1: '354892019482912', imei2: '354892019482913', serialNumber: 'SN-APL-15P-002', color: 'Blue Titanium', storage: '256GB' },
    { imei1: '354892019482914', imei2: '354892019482915', serialNumber: 'SN-APL-15P-003', color: 'Black Titanium', storage: '256GB' },
  ]

  for (const dev of iphoneIMEIs) {
    await prisma.device.upsert({
      where: { imei1: dev.imei1 },
      update: {},
      create: {
        productId: iphone15.id,
        imei1: dev.imei1,
        imei2: dev.imei2,
        serialNumber: dev.serialNumber,
        color: dev.color,
        storage: dev.storage,
        batteryHealth: 100,
        purchaseCost: 385000.00,
        sellingPrice: 435000.00,
        status: 'IN_STOCK',
      },
    })
  }

  // Inventory record for iPhone
  await prisma.inventory.upsert({
    where: { productId_branch: { productId: iphone15.id, branch: 'Colombo Main' } },
    update: { quantity: 3 },
    create: {
      productId: iphone15.id,
      quantity: 3,
      reorderLevel: 5,
      location: 'Vault Shelf A1',
      branch: 'Colombo Main',
    },
  })

  // Product 2: Samsung Galaxy S24 Ultra (Serialized)
  const samsungS24 = await prisma.product.upsert({
    where: { sku: 'SAM-S24U-512' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24 Ultra (512GB Grey)',
      sku: 'SAM-S24U-512',
      barcode: '880609539281',
      description: 'Galaxy AI, Snapdragon 8 Gen 3, 200MP Quad Tele System, Built-in S Pen.',
      categoryId: createdCategories.smartphones.id,
      brandId: createdBrands.samsung.id,
      isSerialized: true,
      costPrice: 410000.00,
      retailPrice: 465000.00,
      defaultWarrantyMonths: 12,
    },
  })

  const samsungIMEIs = [
    { imei1: '357281098231902', imei2: '357281098231903', serialNumber: 'SN-SAM-S24-001', color: 'Titanium Grey', storage: '512GB' },
    { imei1: '357281098231904', imei2: '357281098231905', serialNumber: 'SN-SAM-S24-002', color: 'Titanium Black', storage: '512GB' },
  ]

  for (const dev of samsungIMEIs) {
    await prisma.device.upsert({
      where: { imei1: dev.imei1 },
      update: {},
      create: {
        productId: samsungS24.id,
        imei1: dev.imei1,
        imei2: dev.imei2,
        serialNumber: dev.serialNumber,
        color: dev.color,
        storage: dev.storage,
        batteryHealth: 100,
        purchaseCost: 410000.00,
        sellingPrice: 465000.00,
        status: 'IN_STOCK',
      },
    })
  }

  await prisma.inventory.upsert({
    where: { productId_branch: { productId: samsungS24.id, branch: 'Colombo Main' } },
    update: { quantity: 2 },
    create: {
      productId: samsungS24.id,
      quantity: 2,
      reorderLevel: 4,
      location: 'Vault Shelf A2',
      branch: 'Colombo Main',
    },
  })

  // Product 3: Apple 20W Power Adapter (Non-serialized / Quantity based)
  const charger = await prisma.product.upsert({
    where: { sku: 'APL-PWR-20W' },
    update: {},
    create: {
      name: 'Apple 20W USB-C Power Adapter',
      sku: 'APL-PWR-20W',
      barcode: '194252157007',
      description: 'Official Apple USB-C Power Adapter for iPhone and iPad fast charging.',
      categoryId: createdCategories.charging.id,
      brandId: createdBrands.apple.id,
      isSerialized: false,
      costPrice: 6200.00,
      retailPrice: 8500.00,
      defaultWarrantyMonths: 6,
    },
  })

  await prisma.inventory.upsert({
    where: { productId_branch: { productId: charger.id, branch: 'Colombo Main' } },
    update: { quantity: 42 },
    create: {
      productId: charger.id,
      quantity: 42,
      reorderLevel: 10,
      location: 'Rack B3',
      branch: 'Colombo Main',
    },
  })

  // Product 4: Anker PowerCore 20K (Non-serialized)
  const powerbank = await prisma.product.upsert({
    where: { sku: 'ANK-PWR-20K' },
    update: {},
    create: {
      name: 'Anker PowerCore 20,000mAh Powerbank',
      sku: 'ANK-PWR-20K',
      barcode: '848061058291',
      description: 'High capacity portable charger with dual USB high speed charging ports.',
      categoryId: createdCategories.charging.id,
      brandId: createdBrands.anker.id,
      isSerialized: false,
      costPrice: 14500.00,
      retailPrice: 19500.00,
      defaultWarrantyMonths: 18,
    },
  })

  await prisma.inventory.upsert({
    where: { productId_branch: { productId: powerbank.id, branch: 'Colombo Main' } },
    update: { quantity: 18 },
    create: {
      productId: powerbank.id,
      quantity: 18,
      reorderLevel: 5,
      location: 'Rack C2',
      branch: 'Colombo Main',
    },
  })

  console.log('✅ Created sample products with unique IMEIs and inventory counts.')

  // 9. SYSTEM SETTINGS
  const settingsData = [
    { key: 'store_name', value: 'NexaPOS Mobile & Electronics (Pvt) Ltd', group: 'general', description: 'Store Trade Name', isPublic: true },
    { key: 'currency', value: 'LKR', group: 'general', description: 'Primary Currency', isPublic: true },
    { key: 'currency_symbol', value: 'Rs.', group: 'general', description: 'Currency Symbol', isPublic: true },
    { key: 'store_address', value: 'No. 142 Galle Road, Colombo 03, Sri Lanka', group: 'general', description: 'Main Branch Address', isPublic: true },
    { key: 'store_phone', value: '+94 11 234 5678', group: 'general', description: 'Store Hotline', isPublic: true },
    { key: 'strict_imei_enforcement', value: 'true', group: 'pos', description: 'Never allow selling an already sold IMEI', isPublic: false },
    { key: 'auto_generate_warranty', value: 'true', group: 'warranty', description: 'Create warranty record on completed sale', isPublic: false },
    { key: 'receipt_footer_note', value: 'Thank you for shopping at NexaPOS! Please retain this invoice for manufacturer warranty claims.', group: 'printer', description: 'Receipt footer text', isPublic: true },
  ]

  for (const st of settingsData) {
    await prisma.setting.upsert({
      where: { key: st.key },
      update: { value: st.value, description: st.description },
      create: st,
    })
  }
  console.log('✅ Seeded system settings.')

  console.log('🎉 NexaPOS database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

