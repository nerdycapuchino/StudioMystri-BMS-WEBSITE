import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
    supplierId: z.string().uuid(),
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    unitCost: z.number().positive(),
    notes: z.string().optional().nullable(),
});
export type CreatePOInput = z.infer<typeof createPurchaseOrderSchema>;
