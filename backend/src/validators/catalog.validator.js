import { z } from 'zod'

// ==============================
// Category Validators
// ==============================
export const createCategorySchema = z.object({
  name: z.string({ required_error: 'Category name is required' }).min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

// ==============================
// Brand Validators
// ==============================
export const createBrandSchema = z.object({
  name: z.string({ required_error: 'Brand name is required' }).min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional(),
  country: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
})

export const updateBrandSchema = createBrandSchema.partial()

// ==============================
// Product Validators
// ==============================
export const variantItemSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2, 'Variant SKU must be at least 2 characters'),
  color: z.string().optional().or(z.literal('')),
  storage: z.string().optional().or(z.literal('')),
  ram: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  barcode: z.string().optional().or(z.literal('')),
  costPrice: z.coerce.number().min(0).optional(),
  retailPrice: z.coerce.number().min(0).optional(),
})

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).min(2, 'Product name is too short'),
  sku: z.string({ required_error: 'SKU code is required' }).min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  categoryId: z.string({ required_error: 'Category ID is required' }),
  brandId: z.string().nullable().optional(),
  isSerialized: z.boolean().default(false),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  retailPrice: z.coerce.number().min(0, 'Retail price cannot be negative'),
  minPrice: z.coerce.number().min(0).optional(),
  defaultWarrantyMonths: z.coerce.number().int().min(0).default(0),
  initialStock: z.coerce.number().int().min(0).optional().default(0),
  quantity: z.coerce.number().int().min(0).optional(),
  reorderLevel: z.coerce.number().int().min(0).optional().default(5),
  location: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  variants: z.array(variantItemSchema).optional(),
})

export const updateProductSchema = createProductSchema.partial()

export const createVariantSchema = variantItemSchema.extend({
  productId: z.string({ required_error: 'Product ID is required' }),
})

export const updateVariantSchema = variantItemSchema.partial()

// ==============================
// Serialized Device / IMEI Validators
// ==============================
export const createDeviceSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  variantId: z.string().nullable().optional(),
  imei1: z
    .string({ required_error: 'Primary IMEI (IMEI 1) is required' })
    .min(8, 'IMEI must be at least 8 digits')
    .max(18, 'IMEI exceeds standard length'),
  imei2: z.string().optional(),
  serialNumber: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  batteryHealth: z.coerce.number().int().min(0).max(100).optional(),
  purchaseCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export const bulkDeviceSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  variantId: z.string().nullable().optional(),
  purchaseCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0).optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  devices: z
    .array(
      z.object({
        imei1: z.string().min(8),
        imei2: z.string().optional(),
        serialNumber: z.string().optional(),
      })
    )
    .min(1, 'At least one device IMEI must be provided'),
})

export const updateDeviceStatusSchema = z.object({
  status: z.enum(['IN_STOCK', 'SOLD', 'RESERVED', 'UNDER_REPAIR', 'DEFECTIVE', 'DAMAGED', 'RETURNED']),
  reason: z.string().min(2, 'A reason for status change is required'),
  referenceId: z.string().optional(),
})

