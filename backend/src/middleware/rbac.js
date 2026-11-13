import { errorResponse } from '../utils/apiResponse.js'

/**
 * Authorize access based on User Role (e.g. SUPER_ADMIN, MANAGER, etc.)
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized: user context is missing.', 401)
    }

    // Super Admin has universal access
    if (req.user.role === 'SUPER_ADMIN') {
      return next()
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      )
    }

    next()
  }
}

/**
 * Authorize access based on fine-grained Permission Code (e.g. "pos:access", "products:manage")
 */
export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized: user context is missing.', 401)
    }

    // Super Admin has universal access
    if (req.user.role === 'SUPER_ADMIN') {
      return next()
    }

    if (!req.user.permissions.includes(permissionCode)) {
      return errorResponse(
        res,
        `Forbidden: User lacks the required permission '${permissionCode}'.`,
        403
      )
    }

    next()
  }
}

