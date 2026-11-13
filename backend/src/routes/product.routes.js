import { Router } from 'express'
import {
  getProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  removeProduct,
} from '../controllers/product.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator.js'

const router = Router()

// Public read access (or authenticated)
router.get('/', getProducts)
router.get('/:id', getProduct)

// Protected mutations: Super Admin, Manager, Stock Keeper
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createProductSchema }),
  createNewProduct
)

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: updateProductSchema }),
  updateExistingProduct
)

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeProduct
)

export default router
