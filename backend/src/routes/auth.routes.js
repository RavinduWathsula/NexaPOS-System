import { Router } from 'express'
import {
  login,
  refresh,
  getMe,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js'
import { validateRequest } from '../middleware/validate.js'
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()

// Public Auth Endpoints
router.post('/login', validateRequest({ body: loginSchema }), login)
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refresh)
router.post('/forgot-password', validateRequest({ body: forgotPasswordSchema }), forgotPassword)
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword)

// Protected Auth Endpoints
router.get('/me', authenticateJWT, getMe)
router.post('/logout', authenticateJWT, logout)
router.post('/change-password', authenticateJWT, validateRequest({ body: changePasswordSchema }), changePassword)

export default router
