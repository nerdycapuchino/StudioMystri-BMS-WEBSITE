import { z } from 'zod';

// Normalize phone: strip spaces, dashes, parens
const phoneSchema = z.string()
    .transform(v => v.replace(/[\s\-()]/g, ''))
    .pipe(z.string().min(7, 'Phone must be at least 7 digits').max(20))
    .optional().nullable();

export const createCustomerSchema = z.object({
    // Identity
    name: z.string().min(1, 'Company name is required').max(200),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: phoneSchema,
    company: z.string().optional().nullable(),   // kept for backward compat
    address: z.string().optional().nullable(),
    shippingAddress: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(5000).optional().nullable(),
    status: z.string().optional().nullable(),
}).passthrough();  // Allow extra fields (contactName, industry, etc.) to pass through

export const updateCustomerSchema = createCustomerSchema.partial();

export const listCustomerQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomerQuery = z.infer<typeof listCustomerQuerySchema>;
