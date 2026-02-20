import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { SendMessageInput } from './team.schema';

export const getChannels = async () => {
    const raw = await prisma.message.findMany({ distinct: ['channel'], select: { channel: true } });
    return raw.map(r => r.channel);
};

export const listMessages = async (channel: string, query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const where = { channel };
    const [data, total] = await Promise.all([
        prisma.message.findMany({ where, skip, take, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, avatar: true } } } }),
        prisma.message.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const sendMessage = async (userId: string, input: SendMessageInput) => {
    return prisma.message.create({
        data: { content: input.content, channel: input.channel, attachments: input.attachments || [], senderId: userId },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
};

export const deleteMessage = async (id: string, userId: string, userRole: string) => {
    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) throw createError(404, 'Message not found');
    if (msg.senderId !== userId && userRole !== 'ADMIN') throw createError(403, 'Cannot delete others\' messages');
    return prisma.message.delete({ where: { id } });
};
