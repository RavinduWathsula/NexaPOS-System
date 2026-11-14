import { z } from 'zod'

export const purchaseItemInputSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.coerce.number().min(0, 'Unit cost cannot be negative'),
  devices: z
    .array(
      z.object({
        imei1: z.string().min(8, 'IMEI must be at least 8 digits'),
        imei2: z.string().optional(),
        serialNumber: z.string().optional(),
        color: z.string().optional(),
        storage: z.string().optional(),
        sellingPrice: z.coerce.number().min(0).optional(),
      })
    )
    .optional(),
})

export const createPurchaseSchema = z.object({
  supplierId: z.string({ required_error: 'Supplier ID is required' }),
  supplierInvoiceNumber: z.string().optional(),
  orderDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  tax: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  receiveImmediately: z.boolean().default(false),
  items: z.array(purchaseItemInputSchema).min(1, 'At least one purchase item is required'),
})

export const receivePurchaseSchema = z.object({
  notes: z.string().optional(),
  devices: z
    .array(
      z.object({
        productId: z.string(),
        imei1: z.string().min(8),
        imei2: z.string().optional(),
        serialNumber: z.string().optional(),
        color: z.string().optional(),
        storage: z.string().optional(),
        sellingPrice: z.coerce.number().min(0).optional(),
      })
    )
    .optional(),
})

export const purchasePaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than zero'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT_KOKO', 'SPLIT'], {
    required_error: 'Payment method is required',
  }),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
})

