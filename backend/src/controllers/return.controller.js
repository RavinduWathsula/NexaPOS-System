import * as returnService from '../services/return.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const lookupInvoice = asyncHandler(async (req, res) => {
  const result = await returnService.lookupSaleForReturn(req.params.invoiceNumber || req.query.invoice)
  return res.status(200).json(new ApiResponse(200, result, 'Invoice lookup successful'))
})

export const createReturn = asyncHandler(async (req, res) => {
  const returnRecord = await returnService.createReturn(req.body, req.user?.id)
  return res.status(201).json(new ApiResponse(201, returnRecord, 'Return request registered successfully (Pending manager approval)'))
})

export const approveReturn = asyncHandler(async (req, res) => {
  const result = await returnService.approveReturn(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Return request approved and restocked successfully'))
})

export const rejectReturn = asyncHandler(async (req, res) => {
  const result = await returnService.rejectReturn(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Return request rejected'))
})

export const getReturns = asyncHandler(async (req, res) => {
  const result = await returnService.listReturns(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Returns retrieved successfully'))
})

export const getReturnById = asyncHandler(async (req, res) => {
  const result = await returnService.getReturnById(req.params.id)
  return res.status(200).json(new ApiResponse(200, result, 'Return details retrieved'))
})

