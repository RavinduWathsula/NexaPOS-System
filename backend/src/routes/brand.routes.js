import { Router } from 'express'
import {
  getBrands,
  getBrand,
  createNewBrand,
  updateExistingBrand,
  removeBrand,
} from '../controllers/brand.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createBrandSchema, updateBrandSchema } from '../validators/catalog.validator.js'

const router = Router()

router.get('/', getBrands)
router.get('/:id', getBrand)

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createBrandSchema }),
  createNewBrand
)

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: updateBrandSchema }),
  updateExistingBrand
)

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeBrand
)

export default router

