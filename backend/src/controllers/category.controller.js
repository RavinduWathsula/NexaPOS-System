import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getCategories(req, res, next) {
  try {
    const categories = await listCategories()
    return successResponse(res, categories, 'Categories retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await getCategoryById(req.params.id)
    return successResponse(res, category, 'Category details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function createNewCategory(req, res, next) {
  try {
    const category = await createCategory(req.body)
    return successResponse(res, category, 'Category created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateExistingCategory(req, res, next) {
  try {
    const updated = await updateCategory(req.params.id, req.body)
    return successResponse(res, updated, 'Category updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function removeCategory(req, res, next) {
  try {
    const result = await deleteCategory(req.params.id)
    return successResponse(res, result, 'Category deleted successfully.')
  } catch (error) {
    next(error)
  }
}
