import * as customerService from '../services/customer.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.listCustomers(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Customers retrieved successfully'))
})

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id)
  return res.status(200).json(new ApiResponse(200, customer, 'Customer retrieved successfully'))
})

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body)
  return res.status(201).json(new ApiResponse(201, customer, 'Customer created successfully'))
})

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body)
  return res.status(200).json(new ApiResponse(200, customer, 'Customer updated successfully'))
})

export const deleteCustomer = asyncHandler(async (req, res) => {
  const result = await customerService.deleteCustomer(req.params.id)
  return res.status(200).json(new ApiResponse(200, result, 'Customer deleted successfully'))
})

