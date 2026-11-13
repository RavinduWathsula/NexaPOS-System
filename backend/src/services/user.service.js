import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'

export async function listStaffUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
}

export async function getStaffUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: {
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
        },
      },
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })

  if (!user) {
    const error = new Error('Staff user not found.')
    error.statusCode = 404
    throw error
  }

  return user
}

export async function createStaffUser(data) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (existing) {
    const error = new Error('A staff user with this email address already exists.')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      avatar: data.avatar,
      roleId: data.roleId,
    },
    include: {
      role: true,
    },
  })

  const { password: _, ...result } = user
  return result
}

export async function updateStaffUser(id, data) {
  const user = await prisma.user.update({
    where: { id },
    data,
    include: {
      role: true,
    },
  })

  const { password: _, ...result } = user
  return result
}

export async function deleteStaffUser(id) {
  // Soft deactivate user to preserve historical sales & audit trails
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  })

  return { id: user.id, message: 'User deactivated successfully' }
}

