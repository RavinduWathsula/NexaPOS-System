import { Router } from 'express'
import {
  getPurchases,
  getPurchase,
  postPurchase,
  receivePurchase,
  postPayment,
  cancelPurchase,
} from '../controllers/purchase.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createPurchaseSchema,
  receivePurchaseSchema,
  purchasePaymentSchema,
} from '../validators/purchase.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'), getPurchases)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'), getPurchase)

// Create PO
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createPurchaseSchema }),
  postPurchase
)

// Goods Receiving (GRN)
router.post(
  '/:id/receive',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: receivePurchaseSchema }),
  receivePurchase
)

// Record Payment
router.post(
  '/:id/payment',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest({ body: purchasePaymentSchema }),
  postPayment
)

// Cancel PO
router.patch(
  '/:id/cancel',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  cancelPurchase
)

export default router

