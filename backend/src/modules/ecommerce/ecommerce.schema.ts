import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        userId: z.string().optional(),
        subtotal: z.number().positive(),
        taxAmount: z.number().min(0).default(0),
        shippingAmount: z.number().min(0).default(0),
        discountAmount: z.number().min(0).default(0),
        totalAmount: z.number().positive(),
        items: z.array(
            z.object({
                productId: z.string().uuid(),
                quantity: z.number().int().positive(),
                unitPrice: z.number().positive(),
                totalPrice: z.number().positive(),
            })
        ).min(1, 'Order must contain at least one item'),
        customerDetails: z.object({
            name: z.string().min(2),
            email: z.string().email(),
            phone: z.string().optional(),
        }).optional(),
    }),
});

export const validateDiscountSchema = z.object({
    body: z.object({
        code: z.string().min(1),
        orderAmount: z.number().positive(),
        userId: z.string().optional(),
    }),
});
