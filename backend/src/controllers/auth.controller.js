import {
  loginUser,
  refreshAccessToken,
  getUserProfile,
  changeUserPassword,
  forgotUserPassword,
  resetUserPassword,
} from '../services/auth.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)

    // Set secure HTTP-only cookies if configured
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return successResponse(res, result, 'Staff logged in successfully.')
  } catch (error) {
    next(error)
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken
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
    res.clearCookie('refreshToken')
    return successResponse(res, null, 'Logged out successfully.')
  } catch (error) {
    next(error)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const result = await changeUserPassword(req.user.id, currentPassword, newPassword)
    return successResponse(res, result, result.message)
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const result = await forgotUserPassword(email)
    return successResponse(res, result, result.message)
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body
    const result = await resetUserPassword(token, newPassword)
    return successResponse(res, result, result.message)
  } catch (error) {
    next(error)
  }
}
