import {
  getPOSCatalog,
  lookupByIMEI,
  processSale,
  getSaleReceipt,
  listSalesHistory,
  quickCreateCustomer,
  listCustomers,
} from '../services/pos.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getCustomers(req, res, next) {
  try {
    const customers = await listCustomers(req.query.search)
    return successResponse(res, customers, 'Customers list retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function getCatalog(req, res, next) {
  try {
    const products = await getPOSCatalog(req.query)
    return successResponse(res, products, 'POS catalog retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function lookupIMEI(req, res, next) {
  try {
    const result = await lookupByIMEI(req.params.imei)
    return successResponse(res, result, 'IMEI resolved for POS.')
  } catch (error) {
    next(error)
  }
}

export async function checkoutSale(req, res, next) {
  try {
    const sale = await processSale(req.body, req.user?.id)
    return successResponse(res, sale, 'Sale transaction completed successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function getReceipt(req, res, next) {
  try {
    const sale = await getSaleReceipt(req.params.idOrInvoice)
    return successResponse(res, sale, 'Receipt details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function getSales(req, res, next) {
  try {
    const result = await listSalesHistory(req.query)
    return successResponse(res, result, 'Sales history retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function postQuickCustomer(req, res, next) {
  try {
    const customer = await quickCreateCustomer(req.body)
    return successResponse(res, customer, 'Customer profile ready.', 201)
  } catch (error) {
    next(error)
  }
}
