import { Router } from 'express'
import {
  getSuppliers,
  getSupplier,
  postSupplier,
  putSupplier,
  removeSupplier,
} from '../controllers/supplier.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createSupplierSchema, updateSupplierSchema } from '../validators/supplier.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'), getSuppliers)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'), getSupplier)

router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest({ body: createSupplierSchema }),
  postSupplier
)

router.put(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  validateRequest({ body: updateSupplierSchema }),
  putSupplier
)

router.delete(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeSupplier
)

export default router

