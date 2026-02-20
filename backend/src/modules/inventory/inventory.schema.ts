import { z } from 'zod';

export const createInventorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    type: z.enum(['RAW', 'FINISHED', 'CONSUMABLE']).optional(),
    quantity: z.number().min(0).optional(),
    unit: z.string().optional(),
    reorderPoint: z.number().min(0).optional(),
    cost: z.number().min(0).optional(),
    location: z.string().optional().nullable(),
    batchNumber: z.string().optional().nullable(),
    expiryDate: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    bom: z.record(z.unknown()).optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
});

export const updateInventorySchema = createInventorySchema.partial();

export const stockTransactionSchema = z.object({
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.number().positive('Quantity must be positive'),
    reason: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
});

export const createSupplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contactPerson: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type StockTransactionInput = z.infer<typeof stockTransactionSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
