import { z } from 'zod';

export const sendMessageSchema = z.object({
    content: z.string().max(2000).optional(),
    channelId: z.string().min(1, 'Channel is required'),
    type: z.enum(['TEXT', 'FILE', 'IMAGE']).optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    mentions: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
