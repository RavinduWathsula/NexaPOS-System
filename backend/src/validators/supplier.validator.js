import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string({ required_error: 'Supplier name is required' }).min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Phone number is too short'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  creditDays: z.coerce.number().int().min(0).default(0),
})

export const updateSupplierSchema = createSupplierSchema.partial()

