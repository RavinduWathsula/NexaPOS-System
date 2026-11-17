import { Router } from 'express'
import { list, getById, updateStatus } from '../controllers/tradeIn.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'STOCK_KEEPER', 'TECHNICIAN'), list)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'STOCK_KEEPER', 'TECHNICIAN'), getById)
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), updateStatus)

export default router
