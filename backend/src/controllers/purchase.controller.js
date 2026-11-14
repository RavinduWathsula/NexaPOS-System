import {
  listPurchases,
  getPurchaseById,
  createPurchaseOrder,
  confirmGoodsReceived,
  recordSupplierPayment,
  cancelPurchaseOrder,
} from '../services/purchase.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getPurchases(req, res, next) {
  try {
    const result = await listPurchases(req.query)
    return successResponse(res, result, 'Purchases retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getPurchase(req, res, next) {
  try {
    const purchase = await getPurchaseById(req.params.id)
    return successResponse(res, purchase, 'Purchase order details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function postPurchase(req, res, next) {
  try {
    const purchase = await createPurchaseOrder(req.body, req.user?.id)
    return successResponse(res, purchase, 'Purchase order created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function receivePurchase(req, res, next) {
  try {
    const purchase = await confirmGoodsReceived(req.params.id, req.body, req.user?.id)
    return successResponse(res, purchase, 'Goods received and inventory updated.')
  } catch (error) {
    next(error)
  }
}

export async function postPayment(req, res, next) {
  try {
    const result = await recordSupplierPayment(req.params.id, req.body, req.user?.id)
    return successResponse(res, result, 'Payment recorded successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function cancelPurchase(req, res, next) {
  try {
    const purchase = await cancelPurchaseOrder(req.params.id)
    return successResponse(res, purchase, 'Purchase order cancelled.')
  } catch (error) {
    next(error)
  }
}

