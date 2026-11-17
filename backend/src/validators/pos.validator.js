import { z } from 'zod'

export const saleItemSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
  discount: z.coerce.number().min(0).default(0),
  deviceIds: z.array(z.string()).optional(), // Array of Device.id for serialized devices
})

export const salePaymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT_KOKO', 'SPLIT'], {
    required_error: 'Payment method is required',
  }),
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than zero'),
  cardLastFour: z.string().optional(),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
})

export const tradeInSchema = z.object({
  brand: z.string({ required_error: 'Trade-in brand is required' }).min(1),
  modelName: z.string({ required_error: 'Trade-in model name is required' }).min(1),
  storage: z.string().optional(),
  color: z.string().optional(),
  imei1: z.string({ required_error: 'Trade-in IMEI is required' }).min(7, 'IMEI must be at least 7 characters'),
  imei2: z.string().optional(),
  serialNumber: z.string().optional(),
  conditionGrade: z.string().default('GRADE_B'),
  batteryHealth: z.coerce.number().optional(),
  screenCondition: z.string().optional(),
  housingCondition: z.string().optional(),
  defectsSummary: z.string().optional(),
  tradeInValue: z.coerce.number().min(0.01, 'Trade-in value must be greater than zero'),
  notes: z.string().optional(),
})

export const createSaleSchema = z.object({
  customerId: z.string().nullable().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item must be in the cart'),
  discount: z.coerce.number().min(0).default(0), // invoice level discount
  tax: z.coerce.number().min(0).default(0),
  payments: z.array(salePaymentSchema).min(1, 'At least one payment record is required'),
  cashReceived: z.coerce.number().optional(),
  notes: z.string().optional(),
  tradeIn: tradeInSchema.optional(),
})

export const quickCustomerSchema = z.object({
  name: z.string({ required_error: 'Customer name is required' }).min(2, 'Name must be at least 2 characters'),
  phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Phone number is too short'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  nic: z.string().optional(),
  address: z.string().optional(),
})

export const dispatchSmsSchema = z.object({
  saleId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  recipientPhone: z.string({ required_error: 'Recipient phone number is required' }).min(7, 'Phone number is too short'),
  customerName: z.string().optional(),
  customMessage: z.string().optional(),
})

