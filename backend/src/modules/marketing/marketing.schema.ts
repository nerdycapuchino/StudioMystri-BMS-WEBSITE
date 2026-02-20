import { z } from 'zod';

export const createCampaignSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    channel: z.string().min(1, 'Channel is required'),
    status: z.string().optional(),
    conversionRate: z.number().min(0).max(100).optional(),
    audience: z.record(z.unknown()).optional().nullable(),
    content: z.string().optional().nullable(),
});
export const updateCampaignSchema = createCampaignSchema.partial();
export const updateCampaignStatusSchema = z.object({ status: z.string().min(1) });
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
