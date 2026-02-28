import { z } from 'zod';

export const sendMessageSchema = z.object({
    content: z.string().min(1).max(2000),
    channelId: z.string().min(1, 'Channel is required'),
    attachments: z.array(z.string()).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const reportConversationSchema = z.object({
    channelId: z.string().min(1, 'Channel is required'),
    reason: z.string().min(3).max(120),
    details: z.string().max(2000).optional(),
});

export type ReportConversationInput = z.infer<typeof reportConversationSchema>;
