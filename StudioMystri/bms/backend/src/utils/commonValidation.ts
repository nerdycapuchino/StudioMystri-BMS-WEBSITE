import { z } from 'zod';

// Reusable pagination schema for list endpoints
export const paginationSchema = z.object({
    page: z.preprocess((val) => val === undefined ? undefined : String(val), z.string().regex(/^\d+$/, 'Page must be a number').optional()),
    limit: z.preprocess((val) => val === undefined ? undefined : String(val), z.string().regex(/^\d+$/, 'Limit must be a number').optional()),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    status: z.preprocess((val) => val === undefined ? undefined : String(val), z.string().optional()),
    period: z.string().optional(),
    channel: z.string().optional(),
    supplierId: z.string().optional(),
}).catchall(z.any());

export type PaginationQuery = z.infer<typeof paginationSchema>;
