import { z } from 'zod'

export const createWarrantySchema = z.object({
  deviceId: z.string().optional(),
  customerId: z.string().optional(),
  saleId: z.string().optional(),
  durationMonths: z.coerce.number().int().min(1, 'Duration must be at least 1 month'),
  terms: z.string().optional(),
})

export const createClaimSchema = z.object({
  warrantyId: z.string({ required_error: 'Warranty ID is required' }),
  issueReported: z.string({ required_error: 'Issue reported is mandatory' }).min(5, 'Issue description must be at least 5 characters'),
})

export const reviewClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'RESOLVED'], {
    required_error: 'Review status is required',
  }),
  resolutionNotes: z.string({ required_error: 'Resolution notes are required' }).min(3, 'Notes must be at least 3 characters'),
})

