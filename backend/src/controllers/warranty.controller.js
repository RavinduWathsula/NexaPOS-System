import * as warrantyService from '../services/warranty.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getWarranties = asyncHandler(async (req, res) => {
  const result = await warrantyService.listWarranties(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Warranties retrieved successfully'))
})

export const lookupWarranty = asyncHandler(async (req, res) => {
  const query = req.query.query || req.query.q || req.query.imei || req.query.invoice
  const warranties = await warrantyService.lookupWarranty(query)
  return res.status(200).json(new ApiResponse(200, warranties, 'Warranty lookup successful'))
})

export const getWarrantyById = asyncHandler(async (req, res) => {
  const warranty = await warrantyService.getWarrantyById(req.params.id)
  return res.status(200).json(new ApiResponse(200, warranty, 'Warranty details retrieved'))
})

export const createWarrantyClaim = asyncHandler(async (req, res) => {
  const claim = await warrantyService.createWarrantyClaim(req.body)
  return res.status(201).json(new ApiResponse(201, claim, 'Warranty claim filed successfully (Pending review)'))
})

export const reviewWarrantyClaim = asyncHandler(async (req, res) => {
  const result = await warrantyService.reviewWarrantyClaim(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Warranty claim reviewed successfully'))
})

export const createWarranty = asyncHandler(async (req, res) => {
  const warranty = await warrantyService.createWarranty(req.body)
  return res.status(201).json(new ApiResponse(201, warranty, 'Warranty created successfully'))
})

