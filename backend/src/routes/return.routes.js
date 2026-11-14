import { Router } from 'express'
import {
  lookupInvoice,
  createReturn,
  approveReturn,
  rejectReturn,
  getReturns,
  getReturnById,
} from '../controllers/return.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createReturnSchema,
  approveReturnSchema,
  rejectReturnSchema,
} from '../validators/return.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/lookup/:invoiceNumber', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), lookupInvoice)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), getReturns)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), getReturnById)
router.post('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(createReturnSchema), createReturn)
router.post('/:id/approve', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(approveReturnSchema), approveReturn)
router.post('/:id/reject', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(rejectReturnSchema), rejectReturn)

export default router

