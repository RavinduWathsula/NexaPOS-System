import {
  getInventoryDashboard,
  getInventoryStockList,
  adjustStock,
  manualStockIn,
  manualStockOut,
  getStockMovements,
  updateStockThreshold,
  getStockAdjustments,
} from '../services/inventory.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getDashboard(req, res, next) {
  try {
    const data = await getInventoryDashboard()
    return successResponse(res, data, 'Inventory metrics retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function getStock(req, res, next) {
  try {
    const data = await getInventoryStockList(req.query)
    return successResponse(res, data, 'Inventory stock list retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function postStockAdjustment(req, res, next) {
  try {
    const result = await adjustStock(req.body, req.user?.id)
    return successResponse(res, result, 'Stock adjustment completed.', 201)
  } catch (error) {
    next(error)
  }
}

export async function postStockIn(req, res, next) {
  try {
    const result = await manualStockIn(req.body, req.user?.id)
    return successResponse(res, result, 'Stock added to inventory.', 201)
  } catch (error) {
    next(error)
  }
}

export async function postStockOut(req, res, next) {
  try {
    const result = await manualStockOut(req.body, req.user?.id)
    return successResponse(res, result, 'Stock removed from inventory.', 200)
  } catch (error) {
    next(error)
  }
}

export async function getMovements(req, res, next) {
  try {
    const data = await getStockMovements(req.query)
    return successResponse(res, data, 'Stock movements retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function putThreshold(req, res, next) {
  try {
    const result = await updateStockThreshold(req.params.productId, req.body)
    return successResponse(res, result, 'Stock threshold updated.')
  } catch (error) {
    next(error)
  }
}

export async function getAdjustments(req, res, next) {
  try {
    const data = await getStockAdjustments(req.query)
    return successResponse(res, data, 'Stock adjustments retrieved.')
  } catch (error) {
    next(error)
  }
}

