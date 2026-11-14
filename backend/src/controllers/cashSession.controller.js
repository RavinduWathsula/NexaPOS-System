import * as cashSessionService from '../services/cashSession.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getCurrentSession = asyncHandler(async (req, res) => {
  const session = await cashSessionService.getCurrentSession(req.user.id)
  return res.status(200).json(new ApiResponse(200, session, 'Current cash session retrieved'))
})

export const openSession = asyncHandler(async (req, res) => {
  const session = await cashSessionService.openSession(req.body, req.user.id)
  return res.status(201).json(new ApiResponse(201, session, 'Cash session opened successfully'))
})

export const closeSession = asyncHandler(async (req, res) => {
  const result = await cashSessionService.closeSession(req.params.id, req.body, req.user.id)
  return res.status(200).json(new ApiResponse(200, result, 'Cash session closed and reconciled'))
})

export const listSessions = asyncHandler(async (req, res) => {
  const result = await cashSessionService.listSessions(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Cash sessions retrieved successfully'))
})

export const getSessionById = asyncHandler(async (req, res) => {
  const session = await cashSessionService.getSessionById(req.params.id)
  return res.status(200).json(new ApiResponse(200, session, 'Cash session retrieved'))
})

