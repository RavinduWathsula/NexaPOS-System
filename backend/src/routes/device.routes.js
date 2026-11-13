import { Router } from 'express'
import {
  getDevices,
  getDevice,
  verifyDeviceIMEI,
  createSingleDevice,
  createBulkDevices,
  changeDeviceStatus,
} from '../controllers/device.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validate.js'
import {
  createDeviceSchema,
  bulkDeviceSchema,
  updateDeviceStatusSchema,
} from '../validators/catalog.validator.js'

const router = Router()

// Fast IMEI verification (used by POS terminal, technicians and intake)
router.get('/verify/:imei', verifyDeviceIMEI)

// Protected endpoints
router.use(authenticateJWT)

router.get('/', authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER', 'TECHNICIAN'), getDevices)
router.get('/:id', getDevice)

// Device intake (Stock Keeper, Manager, Super Admin)
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: createDeviceSchema }),
  createSingleDevice
)

router.post(
  '/bulk',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'),
  validateRequest({ body: bulkDeviceSchema }),
  createBulkDevices
)

// Update status (e.g. mark DEFECTIVE or UNDER_REPAIR)
router.patch(
  '/:id/status',
  authorizeRoles('SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER', 'TECHNICIAN'),
  validateRequest({ body: updateDeviceStatusSchema }),
  changeDeviceStatus
)

export default router
