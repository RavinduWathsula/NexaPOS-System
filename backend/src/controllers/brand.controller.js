import {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/brand.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getBrands(req, res, next) {
  try {
    const brands = await listBrands()
    return successResponse(res, brands, 'Brands retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getBrand(req, res, next) {
  try {
    const brand = await getBrandById(req.params.id)
    return successResponse(res, brand, 'Brand details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function createNewBrand(req, res, next) {
  try {
    const brand = await createBrand(req.body)
    return successResponse(res, brand, 'Brand created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateExistingBrand(req, res, next) {
  try {
    const updated = await updateBrand(req.params.id, req.body)
    return successResponse(res, updated, 'Brand updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function removeBrand(req, res, next) {
  try {
    const result = await deleteBrand(req.params.id)
    return successResponse(res, result, 'Brand deleted successfully.')
  } catch (error) {
    next(error)
  }
}

