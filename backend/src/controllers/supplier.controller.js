import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplier.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getSuppliers(req, res, next) {
  try {
    const result = await listSuppliers(req.query)
    return successResponse(res, result, 'Suppliers list retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function getSupplier(req, res, next) {
  try {
    const supplier = await getSupplierById(req.params.id)
    return successResponse(res, supplier, 'Supplier details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function postSupplier(req, res, next) {
  try {
    const supplier = await createSupplier(req.body)
    return successResponse(res, supplier, 'Supplier created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function putSupplier(req, res, next) {
  try {
    const supplier = await updateSupplier(req.params.id, req.body)
    return successResponse(res, supplier, 'Supplier updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function removeSupplier(req, res, next) {
  try {
    const result = await deleteSupplier(req.params.id)
    return successResponse(res, result, 'Supplier deleted successfully.')
  } catch (error) {
    next(error)
  }
}

