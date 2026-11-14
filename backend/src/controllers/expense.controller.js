import * as expenseService from '../services/expense.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.query)
  return res.status(200).json(new ApiResponse(200, result, 'Expenses retrieved successfully'))
})

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user?.id)
  return res.status(201).json(new ApiResponse(201, expense, 'Expense recorded successfully'))
})

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body)
  return res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'))
})

export const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(req.params.id)
  return res.status(200).json(new ApiResponse(200, result, 'Expense deleted successfully'))
})

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await expenseService.getExpenseCategories()
  return res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'))
})

