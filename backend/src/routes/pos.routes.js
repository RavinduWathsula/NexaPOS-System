import { Router } from 'express'
import {
  getCatalog,
  lookupIMEI,
  checkoutSale,
  getReceipt,
  getSales,
  postQuickCustomer,
  getCustomers,
  postDispatchSMS,
} from '../controllers/pos.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createSaleSchema, quickCustomerSchema, dispatchSmsSchema } from '../validators/pos.validator.js'

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

// Dispatch Customer Digital Receipt Message / SMS
router.post(
  '/dispatch-sms',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'),
  validateRequest({ body: dispatchSmsSchema }),
  postDispatchSMS
)

export default router
