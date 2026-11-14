import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string({ required_error: 'Customer name is required' }).min(2, 'Name must be at least 2 characters'),
  phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Phone number is too short'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  nic: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  loyaltyTier: z.enum(['STANDARD', 'SILVER', 'GOLD', 'VIP']).default('STANDARD'),
})

export const updateCustomerSchema = createCustomerSchema.partial()

