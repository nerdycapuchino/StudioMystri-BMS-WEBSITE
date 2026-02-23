import { z } from 'zod';

// Reusable pagination schema
// We keep values as strings to satisfy the existing Record<string, string> contracts in controllers/services
// but we validate that they are indeed numeric strings where expected.
export const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    // Allow other arbitrary filters
    status: z.string().optional(),
    period: z.string().optional(),
    channel: z.string().optional(),
    supplierId: z.string().optional(),
}).catchall(z.string());

export type PaginationQuery = z.infer<typeof paginationSchema>;
