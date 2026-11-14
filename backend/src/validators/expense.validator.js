import { z } from 'zod'

export const createExpenseSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(3, 'Title too short'),
  category: z.string({ required_error: 'Category is required' }).min(2, 'Category required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']).default('CASH'),
  expenseDate: z.string().optional(),
  notes: z.string().optional().or(z.literal('')),
})

export const updateExpenseSchema = z.object({
  title: z.string().min(3).optional(),
  category: z.string().min(2).optional(),
  amount: z.coerce.number().min(0.01).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']).optional(),
  expenseDate: z.string().optional(),
  notes: z.string().optional().or(z.literal('')),
})

