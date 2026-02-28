import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    dimensions: z.string().optional().nullable(),
    siteAddress: z.string().optional().nullable(),
    stage: z.enum(['CONCEPT', 'DESIGN', 'APPROVAL', 'PROCUREMENT', 'CONSTRUCTION', 'EXECUTION', 'FINISHING', 'HANDOVER', 'COMPLETED']).optional(),
    budget: z.number().min(0).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    customerId: z.string().uuid().optional().nullable(),
    stages: z.array(z.string()).optional(),
    currentStage: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const updateStageSchema = z.object({
    stage: z.enum(['CONCEPT', 'DESIGN', 'APPROVAL', 'PROCUREMENT', 'CONSTRUCTION', 'EXECUTION', 'FINISHING', 'HANDOVER', 'COMPLETED']),
});

export const addPaymentSchema = z.object({
    amount: z.number().positive(),
    method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
    note: z.string().optional().nullable(),
    date: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
