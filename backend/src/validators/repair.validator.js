import { z } from 'zod'

export const createRepairSchema = z.object({
  customerId: z.string({ required_error: 'Customer ID is required' }),
  deviceModel: z.string({ required_error: 'Device model is required' }).min(2, 'Model name too short'),
  imei: z.string().optional().or(z.literal('')),
  serialNumber: z.string().optional().or(z.literal('')),
  passcode: z.string().optional().or(z.literal('')),
  physicalCondition: z.string().optional().or(z.literal('')),
  accessoriesReceived: z.string().optional().or(z.literal('')),
  issueDescription: z.string({ required_error: 'Issue description is required' }).min(5, 'Description too short'),
  technicianId: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  estimatedCost: z.coerce.number().min(0, 'Estimated cost cannot be negative'),
  advancePaid: z.coerce.number().min(0).default(0),
  advancePaymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']).optional().default('CASH'),
  expectedCompletionDate: z.string().optional().or(z.literal('')),
  warrantyClaimId: z.string().optional().or(z.literal('')),
})

export const updateRepairStatusSchema = z.object({
  status: z.enum([
    'RECEIVED',
    'DIAGNOSING',
    'WAITING_FOR_PARTS',
    'IN_PROGRESS',
    'REPAIRING',
    'READY_FOR_PICKUP',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED',
  ]),
  diagnosis: z.string().optional(),
  serviceNotes: z.string().optional(),
  technicianId: z.string().optional(),
})

export const addRepairPartSchema = z.object({
  productId: z.string().optional().or(z.literal('')),
  partName: z.string({ required_error: 'Part name is required' }).min(2, 'Name too short'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  unitCost: z.coerce.number().min(0).default(0),
  unitPrice: z.coerce.number().min(0, 'Price cannot be negative'),
})

export const completeRepairSchema = z.object({
  laborCost: z.coerce.number().min(0).default(0),
  finalCost: z.coerce.number().min(0).optional(),
  diagnosis: z.string().optional(),
  serviceNotes: z.string().optional(),
})

export const repairPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than zero'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE'], {
    required_error: 'Payment method is required',
  }),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
})

