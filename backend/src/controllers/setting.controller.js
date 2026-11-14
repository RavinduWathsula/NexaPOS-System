import { listSettings, updateSettings } from '../services/setting.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getSettings(req, res, next) {
  try {
    const result = await listSettings(req.query.group)
    return successResponse(res, result, 'Settings retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function saveSettings(req, res, next) {
  try {
    const updated = await updateSettings(req.body)
    return successResponse(res, updated, 'Settings saved successfully.')
  } catch (error) {
    next(error)
  }
}

