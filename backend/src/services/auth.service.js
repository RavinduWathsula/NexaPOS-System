import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { logAudit } from './audit.service.js'

export async function loginUser(email, password, ipAddress) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    await logAudit({
      action: 'LOGIN_FAILED',
      entity: 'User',
      details: { email, reason: 'Account not found' },
      ipAddress,
    })
    const error = new Error('Invalid email or password credentials.')
    error.statusCode = 401
    throw error
  }

  if (!user.isActive) {
    await logAudit({
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: user.id,
      details: { email, reason: 'Account disabled' },
      ipAddress,
    })
    const error = new Error('This user account has been disabled. Please contact the administrator.')
    error.statusCode = 403
    throw error
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    await logAudit({
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: user.id,
      details: { email, reason: 'Incorrect password' },
      ipAddress,
    })
    const error = new Error('Invalid email or password credentials.')
    error.statusCode = 401
    throw error
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  await logAudit({
    action: 'LOGIN_SUCCESS',
    entity: 'User',
    entityId: user.id,
    performedById: user.id,
    details: { email: user.email, role: user.role.name },
    ipAddress,
  })

  // Sign JWT Access Token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )

  // Sign Refresh Token
  const refreshToken = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  )

  const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...userWithoutPassword } = user

  return {
    user: {
      ...userWithoutPassword,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    },
    accessToken,
    refreshToken,
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    })

    if (!user || !user.isActive) {
      const error = new Error('User inactive or invalid session.')
      error.statusCode = 401
      throw error
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    return { accessToken: newAccessToken }
  } catch (err) {
    const error = new Error('Invalid or expired refresh token.')
    error.statusCode = 401
    throw error
  }
}

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    const error = new Error('User profile not found.')
    error.statusCode = 404
    throw error
  }

  const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...userWithoutPassword } = user
  return {
    ...userWithoutPassword,
    permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
  }
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    const error = new Error('User not found.')
    error.statusCode = 404
    throw error
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
  if (!isCurrentValid) {
    const error = new Error('Current password does not match records.')
    error.statusCode = 400
    throw error
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password)
  if (isSamePassword) {
    const error = new Error('New password cannot be the same as your current password.')
    error.statusCode = 400
    throw error
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { message: 'Password has been changed successfully.' }
}

export async function forgotUserPassword(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  // To prevent user enumeration attacks, always respond neutrally if email not found
  if (!user || !user.isActive) {
    return {
      message: 'If the provided email belongs to an active staff account, a reset token has been issued.',
      resetToken: null,
    }
  }

  // Generate secure cryptographic random token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 Hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: tokenExpires,
    },
  })

  console.log(`🔑 [NexaPOS Password Reset]: Reset token for ${email}: ${resetToken}`)

  return {
    message: 'If the provided email belongs to an active staff account, a reset token has been issued.',
    resetToken: env.NODE_ENV === 'development' ? resetToken : undefined,
  }
}

export async function resetUserPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  })

  if (!user) {
    const error = new Error('Invalid or expired password reset token.')
    error.statusCode = 400
    throw error
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  })

  return { message: 'Your password has been reset successfully. You may now log in with your new credentials.' }
}
