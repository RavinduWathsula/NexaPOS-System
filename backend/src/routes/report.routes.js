import { Router } from 'express'
import {
  getSalesAnalytics,
  getProfitAnalysis,
  getInventoryReports,
  getPurchaseReports,
} from '../controllers/report.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { reportQuerySchema } from '../validators/report.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get(
  '/sales-analytics',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest(reportQuerySchema, 'query'),
  getSalesAnalytics
)

router.get(
  '/profit-analysis',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest(reportQuerySchema, 'query'),
  getProfitAnalysis
)

router.get(
  '/inventory',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  getInventoryReports
)

router.get(
  '/purchases',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest(reportQuerySchema, 'query'),
  getPurchaseReports
)

export default router

