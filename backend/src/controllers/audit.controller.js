import * as auditService from '../services/audit.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.listAuditLogs(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Audit logs retrieved successfully'))
})

