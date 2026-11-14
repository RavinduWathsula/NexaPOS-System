import { Router } from 'express'
import {
  getRepairs,
  getMyAssignedRepairs,
  getRepairById,
  createRepairTicket,
  updateRepairStatus,
  addRepairPart,
  removeRepairPart,
  completeRepair,
  recordRepairPayment,
} from '../controllers/repair.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createRepairSchema,
  updateRepairStatusSchema,
  addRepairPartSchema,
  completeRepairSchema,
  repairPaymentSchema,
} from '../validators/repair.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/technician/assigned', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), getMyAssignedRepairs)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'), getRepairs)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'), getRepairById)
router.post('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'), validateRequest(createRepairSchema), createRepairTicket)
router.put('/:id/status', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), validateRequest(updateRepairStatusSchema), updateRepairStatus)
router.post('/:id/parts', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), validateRequest(addRepairPartSchema), addRepairPart)
router.delete('/parts/:partId', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), removeRepairPart)
router.post('/:id/complete', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), validateRequest(completeRepairSchema), completeRepair)
router.post('/:id/payment', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(repairPaymentSchema), recordRepairPayment)

export default router

