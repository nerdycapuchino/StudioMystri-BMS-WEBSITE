import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { SendMessageInput } from './team.schema';

export const getChannels = async (userId: string, role: string) => {
    // Return channels the user has access to
    const channels = await prisma.channel.findMany({
        orderBy: { name: 'asc' }
    });

    // Filter based on RBAC logic (same as socket logic)
    return channels.filter(ch => {
        if (ch.type === 'public') return true;
        if (ch.type === 'dm' || ch.type === 'private') {
            return ch.participants.includes(userId);
        }
        // Strict mapping for Finance/HR
        if (ch.name.toLowerCase().includes('finance') || ch.name.toLowerCase().includes('invoice')) {
            return role === 'FINANCE' || role === 'SUPER_ADMIN';
        }
        if (ch.name.toLowerCase().includes('hr') || ch.name.toLowerCase().includes('employee')) {
            return role === 'HR' || role === 'SUPER_ADMIN';
        }
        return true;
    });
};

export const createChannel = async (data: { name: string, type: 'public' | 'private' | 'dm', participants: string[] }) => {
    return prisma.channel.create({
        data: {
            name: data.name,
            type: data.type,
            participants: data.participants
        }
    });
};

export const listMessages = async (channelId: string, query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const where = { channelId };
    const [data, total] = await Promise.all([
        prisma.message.findMany({ where, skip, take, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, avatar: true } } } }),
        prisma.message.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const sendMessage = async (userId: string, input: SendMessageInput) => {
    return prisma.message.create({
        data: { content: input.content, channelId: input.channelId, attachments: input.attachments || [], senderId: userId },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
};

export const deleteMessage = async (id: string, userId: string, userRole: string) => {
    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) throw createError(404, 'Message not found');
    if (msg.senderId !== userId && userRole !== 'SUPER_ADMIN') throw createError(403, 'Permission denied');
    return prisma.message.delete({ where: { id } });
};
