import { Router } from 'express'
import {
  getCurrentSession,
  openSession,
  closeSession,
  listSessions,
  getSessionById,
} from '../controllers/cashSession.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  openSessionSchema,
  closeSessionSchema,
} from '../validators/cashSession.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/current', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), getCurrentSession)
router.post('/open', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(openSessionSchema), openSession)
router.post('/:id/close', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(closeSessionSchema), closeSession)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), listSessions)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), getSessionById)

export default router

