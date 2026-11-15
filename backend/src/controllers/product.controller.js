import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  addProductImage,
  deleteProductImage,
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
    const product = await updateProduct(req.params.id, req.body, req.user?.id)
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

export async function createVariant(req, res, next) {
  try {
    const variant = await addProductVariant(req.params.id, req.body)
    return successResponse(res, variant, 'Product variant added successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateVariant(req, res, next) {
  try {
    const variant = await updateProductVariant(req.params.variantId, req.body)
    return successResponse(res, variant, 'Product variant updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function removeVariant(req, res, next) {
  try {
    const result = await deleteProductVariant(req.params.variantId)
    return successResponse(res, result, 'Product variant removed successfully.')
  } catch (error) {
    next(error)
  }
}

export async function uploadImage(req, res, next) {
  try {
    const image = await addProductImage(req.params.id, req.body)
    return successResponse(res, image, 'Image attached to product.', 201)
  } catch (error) {
    next(error)
  }
}

export async function removeImage(req, res, next) {
  try {
    const result = await deleteProductImage(req.params.imageId)
    return successResponse(res, result, 'Image removed from product.')
  } catch (error) {
    next(error)
  }
}

