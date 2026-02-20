import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    shippingAddress: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
