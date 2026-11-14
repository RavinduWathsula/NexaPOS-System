import { Router } from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories,
} from '../controllers/expense.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createExpenseSchema,
  updateExpenseSchema,
} from '../validators/expense.validator.js'

const router = Router()

router.use(authenticateJWT)

router.get('/categories', authorizeRoles('SUPER_ADMIN', 'MANAGER'), getCategories)
router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER'), getExpenses)
router.post('/', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(createExpenseSchema), createExpense)
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER'), validateRequest(updateExpenseSchema), updateExpense)
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'MANAGER'), deleteExpense)

export default router

