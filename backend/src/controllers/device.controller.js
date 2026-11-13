import {
  listDevices,
  getDeviceById,
  verifyIMEI,
  registerDevice,
  bulkRegisterDevices,
  updateDeviceStatus,
} from '../services/device.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getDevices(req, res, next) {
  try {
    const result = await listDevices(req.query)
    return successResponse(res, result, 'Devices list retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function getDevice(req, res, next) {
  try {
    const device = await getDeviceById(req.params.id)
    return successResponse(res, device, 'Device details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function verifyDeviceIMEI(req, res, next) {
  try {
    const result = await verifyIMEI(req.params.imei)
    return successResponse(res, result, 'IMEI verification completed.')
  } catch (error) {
    next(error)
  }
}

export async function createSingleDevice(req, res, next) {
  try {
    const device = await registerDevice(req.body, req.user?.id)
    return successResponse(res, device, 'Device registered successfully with unique IMEI.', 201)
  } catch (error) {
    next(error)
  }
}

export async function createBulkDevices(req, res, next) {
  try {
    const result = await bulkRegisterDevices(req.body, req.user?.id)
    return successResponse(res, result, `Bulk registered ${result.count} serialized devices.`, 201)
  } catch (error) {
    next(error)
  }
}

export async function changeDeviceStatus(req, res, next) {
  try {
    const { status, reason, referenceId } = req.body
    const updated = await updateDeviceStatus(
      req.params.id,
      status,
      reason,
      referenceId,
      req.user?.id
    )
    return successResponse(res, updated, 'Device status updated.')
  } catch (error) {
    next(error)
  }
}

