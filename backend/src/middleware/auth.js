import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { errorResponse } from '../utils/apiResponse.js'

export async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required: missing or malformed Bearer token.', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user || !user.isActive) {
      return errorResponse(res, 'User account is inactive or not found.', 401)
    }

    // Attach user, role name and permission codes to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    }

    next()
  } catch (err) {
    next(err)
  }
}

