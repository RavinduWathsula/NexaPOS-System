import { Router } from 'express'
import {
  getDashboard,
  getStock,
  postStockAdjustment,
  postStockIn,
  postStockOut,
  getMovements,
  putThreshold,
  getAdjustments,
} from '../controllers/inventory.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  stockAdjustmentSchema,
  manualStockInSchema,
  manualStockOutSchema,
  stockThresholdSchema,
} from '../validators/inventory.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/dashboard', getDashboard)
router.get('/stock', getStock)
router.get('/movements', getMovements)
router.get('/adjustments', getAdjustments)

// Stock modifications (Admin, Manager, Stock Keeper)
router.post(
  '/adjust',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: stockAdjustmentSchema }),
  postStockAdjustment
)

router.post(
  '/stock-in',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: manualStockInSchema }),
  postStockIn
)

router.post(
  '/stock-out',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: manualStockOutSchema }),
  postStockOut
)

router.put(
  '/threshold/:productId',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: stockThresholdSchema }),
  putThreshold
)

export default router

