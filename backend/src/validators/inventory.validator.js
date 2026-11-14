import { z } from 'zod'

export const stockAdjustmentSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  type: z.enum(['ADD', 'SUBTRACT', 'SET'], {
    required_error: 'Adjustment type must be ADD, SUBTRACT, or SET',
  }),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  reason: z.string({ required_error: 'Reason for adjustment is mandatory' }).min(3, 'Reason must be at least 3 characters'),
  notes: z.string().optional(),
  branch: z.string().optional().default('Colombo Main'),
})

export const manualStockInSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
  unitCost: z.coerce.number().min(0).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  branch: z.string().optional().default('Colombo Main'),
})

export const manualStockOutSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(3, 'Reason for stock removal is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  branch: z.string().optional().default('Colombo Main'),
})

export const stockThresholdSchema = z.object({
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level cannot be negative'),
  location: z.string().optional(),
  branch: z.string().optional().default('Colombo Main'),
})

