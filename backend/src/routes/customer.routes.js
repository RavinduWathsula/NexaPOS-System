import { Router } from 'express'
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/customer.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN', 'STOCK_KEEPER'), getCustomers)
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER', 'TECHNICIAN', 'STOCK_KEEPER'), getCustomerById)
router.post('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(createCustomerSchema), createCustomer)
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'CASHIER'), validateRequest(updateCustomerSchema), updateCustomer)
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER'), deleteCustomer)

export default router

