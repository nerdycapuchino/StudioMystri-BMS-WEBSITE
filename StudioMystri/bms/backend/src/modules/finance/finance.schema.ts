import { z } from 'zod';

export const createTransactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
    date: z.string().optional(),
    invoiceId: z.string().uuid().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
