import { z } from 'zod'

export const createReturnSchema = z.object({
  saleId: z.string({ required_error: 'Original Sale ID is required' }),
  type: z.enum(['REFUND', 'EXCHANGE']).default('REFUND'),
  refundMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']).default('CASH'),
  reason: z.string({ required_error: 'Return reason is required' }).min(3, 'Reason too short'),
  items: z
    .array(
      z.object({
        saleItemId: z.string({ required_error: 'Sale Item ID is required' }),
        deviceId: z.string().optional().or(z.literal('')),
        quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
        refundAmount: z.coerce.number().min(0, 'Refund amount cannot be negative'),
        condition: z.enum(['RESELLABLE', 'DEFECTIVE', 'DAMAGED']).default('RESELLABLE'),
      })
    )
    .min(1, 'At least one item must be selected for return'),
})

export const approveReturnSchema = z.object({
  restockSellable: z.boolean().default(true),
  inspectionNotes: z.string().optional().or(z.literal('')),
})

export const rejectReturnSchema = z.object({
  rejectionReason: z.string({ required_error: 'Rejection reason is required' }).min(3, 'Reason too short'),
})

