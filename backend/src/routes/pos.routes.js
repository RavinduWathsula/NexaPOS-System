import { Router } from 'express'
import {
  getCatalog,
  lookupIMEI,
  checkoutSale,
  getReceipt,
  getSales,
  postQuickCustomer,
  getCustomers,
} from '../controllers/pos.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createSaleSchema, quickCustomerSchema } from '../validators/pos.validator.js'

const router = Router()

router.use(authenticateJWT)

// POS fast product lookup & barcode search
router.get('/catalog', getCatalog)
router.get('/lookup-imei/:imei', lookupIMEI)
router.get('/customers', getCustomers)

// POS Checkout
router.post(
  '/checkout',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'),
  validateRequest({ body: createSaleSchema }),
  checkoutSale
)

// Receipt retrieval & reprint
router.get('/receipt/:idOrInvoice', getReceipt)

// Sales History & Invoices list
router.get('/sales', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), getSales)

// Quick Customer Registration
router.post(
  '/quick-customer',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'),
  validateRequest({ body: quickCustomerSchema }),
  postQuickCustomer
)

export default router
