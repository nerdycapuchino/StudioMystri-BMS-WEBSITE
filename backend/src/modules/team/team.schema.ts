import { z } from 'zod';

export const sendMessageSchema = z.object({
    content: z.string().min(1).max(2000),
    channelId: z.string().min(1, 'Channel is required'),
    attachments: z.array(z.string()).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
