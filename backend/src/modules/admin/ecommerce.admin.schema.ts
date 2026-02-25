import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum([
            'CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED',
            'PENDING', 'CONFIRMED', 'COMPLETED', 'REFUNDED', 'CANCELLED'
        ]),
    }),
});

export const updateShippingSchema = z.object({
    body: z.object({
        courierName: z.string().optional(),
        trackingId: z.string().optional(),
        trackingUrl: z.string().url().optional(),
        shippedAt: z.string().datetime().optional(),
        deliveredAt: z.string().datetime().optional(),
    }),
});

export const createDiscountSchema = z.object({
    body: z.object({
        code: z.string().min(3),
        type: z.enum(['FLAT', 'PERCENT']),
        value: z.number().positive(),
        minOrderAmount: z.number().min(0).optional(),
        maxDiscountAmount: z.number().min(0).optional(),
        usageLimit: z.number().int().positive().optional(),
        perUserLimit: z.number().int().positive().optional(),
        expiryDate: z.string().datetime().optional(),
        isActive: z.boolean().default(true),
    }),
});
