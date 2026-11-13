import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'

export async function loginUser(email, password) {
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
    const error = new Error('Invalid email or password credentials.')
    error.statusCode = 401
    throw error
  }

  if (!user.isActive) {
    const error = new Error('This user account has been disabled. Please contact the administrator.')
    error.statusCode = 403
    throw error
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password credentials.')
    error.statusCode = 401
    throw error
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
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

  // Strip password hash from returned object
  const { password: _, ...userWithoutPassword } = user

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

  const { password: _, ...userWithoutPassword } = user
  return {
    ...userWithoutPassword,
    permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
  }
}

