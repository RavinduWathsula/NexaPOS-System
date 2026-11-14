/**
 * Standardized API Response Helpers & Class
 */

export class ApiResponse {
  constructor(statusCode = 200, data = null, message = 'Success') {
    this.statusCode = statusCode
    this.success = statusCode < 400
    this.message = message
    this.data = data
  }
}

export function successResponse(res, data = null, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function errorResponse(res, message = 'Internal Server Error', statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details,
    },
  })
}

export default {
  ApiResponse,
  successResponse,
  errorResponse,
}
