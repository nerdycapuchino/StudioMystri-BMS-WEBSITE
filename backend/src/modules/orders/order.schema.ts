import { z } from 'zod';

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    name: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).optional(),
});

export const createOrderSchema = z.object({
    customerId: z.string().uuid().optional().nullable(),
    items: z.array(orderItemSchema).min(1, 'At least one item required'),
    paymentMethod: z.string().optional(),
    discount: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
    currency: z.string().optional(),
});

export const updateStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
