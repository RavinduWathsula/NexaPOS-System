import { Router } from 'express'
import {
  getWarranties,
  lookupWarranty,
  getWarrantyById,
  createWarrantyClaim,
  reviewWarrantyClaim,
  createWarranty,
} from '../controllers/warranty.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createWarrantySchema,
  createClaimSchema,
  reviewClaimSchema,
} from '../validators/warranty.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/lookup', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'), lookupWarranty)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'), getWarranties)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'), getWarrantyById)
router.post('/claim', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN'), validateRequest(createClaimSchema), createWarrantyClaim)
router.post('/claim/:id/review', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(reviewClaimSchema), reviewWarrantyClaim)
router.post('/', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(createWarrantySchema), createWarranty)

export default router

