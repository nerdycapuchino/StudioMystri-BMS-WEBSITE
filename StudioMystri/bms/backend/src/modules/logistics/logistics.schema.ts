import { z } from 'zod';

export const createShipmentSchema = z.object({
    orderId: z.string().uuid().optional().nullable(),
    customerId: z.string().uuid().optional().nullable(),
    origin: z.string().optional().nullable(),
    destination: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    trackingNumber: z.string().optional().nullable(),
    trackingUrl: z.string().optional().nullable(),
    estimatedDelivery: z.string().optional().nullable(),
    items: z.array(z.object({ name: z.string(), quantity: z.number() })).optional().nullable(),
});
export const updateShipmentSchema = createShipmentSchema.partial();
export const updateShipmentStatusSchema = z.object({
    status: z.enum(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']),
});
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
