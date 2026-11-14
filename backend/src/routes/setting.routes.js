import { Router } from 'express'
import { getSettings, saveSettings } from '../controllers/setting.controller.js'
import { authenticateJWT } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/rbac.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', getSettings)
router.put('/', authorizeRoles('SUPER_ADMIN'), saveSettings)

export default router

