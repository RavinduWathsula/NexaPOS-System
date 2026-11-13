import { Router } from 'express'
import {
  getProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  removeProduct,
  createVariant,
  updateVariant,
  removeVariant,
  uploadImage,
  removeImage,
} from '../controllers/product.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
} from '../validators/catalog.validator.js'

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

// Variants sub-routes
router.post(
  '/:id/variants',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createVariantSchema.omit({ productId: true }) }),
  createVariant
)

router.put(
  '/:id/variants/:variantId',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: updateVariantSchema }),
  updateVariant
)

router.delete(
  '/:id/variants/:variantId',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeVariant
)

// Images sub-routes
router.post(
  '/:id/images',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  uploadImage
)

router.delete(
  '/:id/images/:imageId',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeImage
)

export default router

