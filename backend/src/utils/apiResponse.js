/**
 * Standardized API Response Helpers
 */

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

