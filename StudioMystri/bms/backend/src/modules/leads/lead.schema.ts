import { z } from 'zod';

const leadStageEnum = z.enum([
    'NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'DISCOVERY_SCHEDULED',
    'DISCOVERY_COMPLETED', 'PROPOSAL_DRAFTING', 'PROPOSAL_SENT',
    'NEGOTIATION', 'VERBAL_CONFIRMATION', 'AGREEMENT_SENT',
    'AGREEMENT_SIGNED', 'ADVANCE_PAYMENT_RECEIVED', 'CLOSED_WON', 'CLOSED_LOST',
    'PROSPECT_IDENTIFIED', 'RESEARCH_COMPLETED', 'OUTREACH_ATTEMPTED',
    'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3', 'INTERESTED',
    'OUTBOUND_QUALIFIED', 'MOVE_TO_INBOUND', 'ON_HOLD'
]);

const leadTypeEnum = z.enum(['INBOUND', 'OUTBOUND', 'REFERRAL']);

export const createLeadSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    pocName: z.string().min(1, 'POC name is required'),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    stage: leadStageEnum.optional(),
    type: leadTypeEnum.optional(),
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
