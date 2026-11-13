import { Router } from 'express'
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateExistingCategory,
  removeCategory,
} from '../controllers/category.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createCategorySchema, updateCategorySchema } from '../validators/catalog.validator.js'

const router = Router()

// Public / Authenticated read routes
router.get('/', getCategories)
router.get('/:id', getCategory)

// Protected mutation routes (Super Admin, Manager, Stock Keeper)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createCategorySchema }),
  createNewCategory
)

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: updateCategorySchema }),
  updateExistingCategory
)

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('SUPER_ADMIN', 'MANAGER'),
  removeCategory
)

export default router

