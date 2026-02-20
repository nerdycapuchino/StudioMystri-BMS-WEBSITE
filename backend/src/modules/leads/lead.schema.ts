import { z } from 'zod';

const leadStageEnum = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST']);

export const createLeadSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    pocName: z.string().min(1, 'POC name is required'),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    stage: leadStageEnum.optional(),
    type: z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL']).optional(),
    source: z.string().optional().nullable(),
    value: z.number().min(0).optional(),
    probability: z.number().min(0).max(100).optional(),
    requirements: z.string().optional().nullable(),
    brief: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    assignedToId: z.string().uuid().optional().nullable(),
    expectedClose: z.string().datetime().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStageSchema = z.object({
    stage: leadStageEnum,
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
