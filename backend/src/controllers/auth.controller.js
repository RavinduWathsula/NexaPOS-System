import { loginUser, refreshAccessToken, getUserProfile } from '../services/auth.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)
    return successResponse(res, result, 'Staff logged in successfully.')
  } catch (error) {
    next(error)
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body
    const result = await refreshAccessToken(refreshToken)
    return successResponse(res, result, 'Token refreshed successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getMe(req, res, next) {
  try {
    const profile = await getUserProfile(req.user.id)
    return successResponse(res, profile, 'User profile fetched successfully.')
  } catch (error) {
    next(error)
  }
}

export async function logout(req, res, next) {
  try {
    // In stateless JWT, client deletes tokens. Hook provided for future token blacklisting/audit log.
    return successResponse(res, null, 'Logged out successfully.')
  } catch (error) {
    next(error)
  }
}

