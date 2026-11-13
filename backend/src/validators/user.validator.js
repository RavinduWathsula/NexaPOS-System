import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string({ required_error: 'Full name is required' }).min(2, 'Name too short'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.string({ required_error: 'Role ID is required' }),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
})

