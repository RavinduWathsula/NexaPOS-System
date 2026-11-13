import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/product.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getProducts(req, res, next) {
  try {
    const result = await listProducts(req.query)
    return successResponse(res, result, 'Products retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getProductById(req.params.id)
    return successResponse(res, product, 'Product details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function createNewProduct(req, res, next) {
  try {
    const product = await createProduct(req.body, req.user?.id)
    return successResponse(res, product, 'Product created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateExistingProduct(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body)
    return successResponse(res, product, 'Product updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function removeProduct(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id)
    return successResponse(res, result, 'Product deleted successfully.')
  } catch (error) {
    next(error)
  }
}

