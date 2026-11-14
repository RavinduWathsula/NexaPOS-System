import { z } from 'zod'

export const openSessionSchema = z.object({
  openingBalance: z.coerce.number().min(0, 'Opening balance cannot be negative'),
  notes: z.string().optional().or(z.literal('')),
})

export const closeSessionSchema = z.object({
  closingBalance: z.coerce.number().min(0, 'Closing balance cannot be negative'),
  notes: z.string().optional().or(z.literal('')),
})

