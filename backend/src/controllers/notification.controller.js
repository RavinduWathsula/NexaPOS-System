import { getSystemNotifications } from '../services/notification.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function listNotifications(req, res, next) {
  try {
    const notifications = await getSystemNotifications(req.user)
    return successResponse(res, notifications, 'System notifications retrieved.')
  } catch (error) {
    next(error)
  }
}

