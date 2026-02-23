import { z } from 'zod';

// Reusable pagination schema
// We keep values as strings to satisfy the existing Record<string, string> contracts in controllers/services
// but we validate that they are indeed numeric strings where expected.
export const paginationSchema = z.object({
    page: z.preprocess((val) => String(val), z.string().regex(/^\d+$/, 'Page must be a number').optional()),
    limit: z.preprocess((val) => String(val), z.string().regex(/^\d+$/, 'Limit must be a number').optional()),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    // Allow other arbitrary filters
    status: z.preprocess((val) => String(val), z.string().optional()),
    period: z.string().optional(),
    channel: z.string().optional(),
    supplierId: z.string().optional(),
    // Allow arbitrary query params to pass through as any string
}).catchall(z.any());

export type PaginationQuery = z.infer<typeof paginationSchema>;
