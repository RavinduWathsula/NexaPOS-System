import { Router } from 'express'
import { getAuditLogs } from '../controllers/audit.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER'), getAuditLogs)

export default router

