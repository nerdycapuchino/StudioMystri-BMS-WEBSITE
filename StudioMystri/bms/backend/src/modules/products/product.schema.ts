import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional().nullable(),
    category: z.string().min(1, 'Category is required'),
    price: z.number().positive('Price must be positive'),
    cost: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    unit: z.string().optional(),
    description: z.string().optional().nullable(),
    materials: z.string().optional().nullable(),
    dimensions: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
    manualUrl: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const createVariantSchema = z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'Variant SKU is required'),
    price: z.number().positive(),
    stock: z.number().int().min(0).optional(),
    attributes: z.record(z.unknown()).optional().nullable(),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
