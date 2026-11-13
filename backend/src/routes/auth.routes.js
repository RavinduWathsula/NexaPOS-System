import { Router } from 'express'
import { login, refresh, getMe, logout } from '../controllers/auth.controller.js'
import { validateRequest } from '../middleware/validate.js'
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()

// Public Auth Endpoints
router.post('/login', validateRequest({ body: loginSchema }), login)
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refresh)

// Protected Auth Endpoints
router.get('/me', authenticateJWT, getMe)
router.post('/logout', authenticateJWT, logout)

export default router

