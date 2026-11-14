import { z } from 'zod'

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['today', 'yesterday', '7days', '30days', 'month', 'year', 'custom']).optional(),
  cashierId: z.string().optional(),
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
  branch: z.string().optional(),
})

