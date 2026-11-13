import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { errorResponse } from '../utils/apiResponse.js'
import { env } from '../config/env.js'

export function errorHandler(err, req, res, next) {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return errorResponse(res, 'Validation failed for request payload', 400, formattedErrors)
  }

  console.error(`💥 [API Error]: ${err.message}`)

  // 2. Prisma Known Database Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field'
      return errorResponse(
        res,
        `Duplicate entry violation: a record with this ${target} already exists.`,
        409,
        err.meta
      )
    }
    if (err.code === 'P2025') {
      return errorResponse(res, 'The requested database record was not found.', 404)
    }
    if (err.code === 'P2003') {
      return errorResponse(
        res,
        'Foreign key constraint violation: referenced entity does not exist.',
        400,
        err.meta
      )
    }
  }

  // 3. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token provided.', 401)
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token has expired. Please log in again.', 401)
  }

  // 4. Custom HTTP Status Code
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  })
}
