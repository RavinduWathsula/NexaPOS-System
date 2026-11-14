import * as repairService from '../services/repair.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getRepairs = asyncHandler(async (req, res) => {
  const result = await repairService.listRepairs(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Repair jobs retrieved successfully'))
})

export const getMyAssignedRepairs = asyncHandler(async (req, res) => {
  const result = await repairService.getTechnicianRepairs(req.user.id, req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Technician assigned repairs retrieved'))
})

export const getRepairById = asyncHandler(async (req, res) => {
  const repair = await repairService.getRepairById(req.params.id)
  return res.status(200).json(new ApiResponse(200, repair, 'Repair job retrieved successfully'))
})

export const createRepairTicket = asyncHandler(async (req, res) => {
  const repair = await repairService.createRepairTicket(req.body, req.user?.id)
  return res.status(201).json(new ApiResponse(201, repair, 'Repair ticket created successfully'))
})

export const updateRepairStatus = asyncHandler(async (req, res) => {
  const repair = await repairService.updateRepairStatus(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, repair, 'Repair status updated successfully'))
})

export const addRepairPart = asyncHandler(async (req, res) => {
  const part = await repairService.addSparePart(req.params.id, req.body, req.user?.id)
  return res.status(201).json(new ApiResponse(201, part, 'Spare part added to repair successfully'))
})

export const removeRepairPart = asyncHandler(async (req, res) => {
  const result = await repairService.removeSparePart(req.params.partId, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Spare part removed successfully'))
})

export const completeRepair = asyncHandler(async (req, res) => {
  const repair = await repairService.completeRepair(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, repair, 'Repair job marked complete / ready for pickup'))
})

export const recordRepairPayment = asyncHandler(async (req, res) => {
  const result = await repairService.recordRepairPayment(req.params.id, req.body, req.user?.id)
  return res.status(200).json(new ApiResponse(200, result, 'Repair payment recorded successfully'))
})

