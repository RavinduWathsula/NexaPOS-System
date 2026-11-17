import * as tradeInService from '../services/tradeIn.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const list = asyncHandler(async (req, res) => {
  const result = await tradeInService.listTradeIns(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Trade-in devices retrieved successfully'))
})

export const getById = asyncHandler(async (req, res) => {
  const result = await tradeInService.getTradeInById(req.params.id)
  return res.status(200).json(new ApiResponse(200, result, 'Trade-in device details retrieved'))
})

export const updateStatus = asyncHandler(async (req, res) => {
  const result = await tradeInService.updateTradeInStatus(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Trade-in device status updated successfully'))
})
