import { Router } from 'express'
import {
  getRoles,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js'

const router = Router()

// All user management routes require valid JWT
router.use(authenticateJWT)

// List roles
router.get('/roles', authorizeRoles('SUPER_ADMIN', 'MANAGER'), getRoles)

// List users (Super Admin & Manager)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER'), getUsers)

// Get single user details
router.get('/:id', getUser)

// Create new staff user (Super Admin only)
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN'),
  validateRequest({ body: createUserSchema }),
  createUser
)

// Update user details (Super Admin only)
router.put(
  '/:id',
  authorizeRoles('SUPER_ADMIN'),
  validateRequest({ body: updateUserSchema }),
  updateUser
)

// Deactivate user (Super Admin only)
router.delete('/:id', authorizeRoles('SUPER_ADMIN'), deleteUser)

export default router

