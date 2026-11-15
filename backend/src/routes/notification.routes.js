import { Router } from 'express'
import { listNotifications } from '../controllers/notification.controller.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()

router.use(authenticateJWT)

router.get('/', listNotifications)

export default router

