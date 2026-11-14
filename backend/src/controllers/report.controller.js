import * as reportService from '../services/report.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const result = await reportService.getSalesAnalytics(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Sales analytics retrieved successfully'))
})

export const getProfitAnalysis = asyncHandler(async (req, res) => {
  const result = await reportService.getProfitAnalysis(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Profit analysis and P&L retrieved successfully'))
})

export const getInventoryReports = asyncHandler(async (req, res) => {
  const result = await reportService.getInventoryReports()
  return res.status(200).json(new ApiResponse(200, result, 'Inventory reports retrieved successfully'))
})

export const getPurchaseReports = asyncHandler(async (req, res) => {
  const result = await reportService.getPurchaseReports(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Purchase reports retrieved successfully'))
})

