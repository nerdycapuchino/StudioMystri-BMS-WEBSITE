import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { SendMessageInput } from './team.schema';
import fs from 'fs';
import path from 'path';

const policyPath = path.join(__dirname, "../../../../rbac-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

const ensureSystemChannels = async () => {
    const defaults = ['general', 'finance', 'hr'];
    for (const name of defaults) {
        const existing = await prisma.channel.findFirst({ where: { name, type: 'public' } });
        if (!existing) {
            await prisma.channel.create({
                data: { name, type: 'public', participants: [] }
            });
        }
    }
};

const resolveChannel = async (channelIdentifier: string) => {
    const byId = await prisma.channel.findUnique({ where: { id: channelIdentifier } });
    if (byId) return byId;
    return prisma.channel.findFirst({ where: { name: channelIdentifier } });
};

const canAccessChannel = async (userId: string, role: string, channelId: string) => {
    if (!role) return false;
    const channel = await resolveChannel(channelId);
    if (!channel) return false;

    if (channel.type === 'public') {
        const hasTeamhubAccess = policy[role]?.modules?.['teamhub']?.includes('read');
        if (channel.name.toLowerCase().includes('finance') || channel.name.toLowerCase().includes('invoice')) {
            return role === 'FINANCE' || role === 'SUPER_ADMIN';
        }
        if (channel.name.toLowerCase().includes('hr') || channel.name.toLowerCase().includes('employee')) {
            return role === 'HR' || role === 'SUPER_ADMIN';
        }
        return !!hasTeamhubAccess;
    }

    if (channel.type === 'dm' || channel.type === 'private') {
        return channel.participants.includes(userId) || role === 'SUPER_ADMIN';
    }

    return false;
};

export const getChannels = async (userId: string, role: string) => {
    await ensureSystemChannels();
    // Return channels the user has access to
    const channels = await prisma.channel.findMany({
        orderBy: { name: 'asc' }
    });

    // Filter based on RBAC logic (same as socket logic)
    return channels.filter(ch => {
        // Strict mapping for Finance/HR
        if (ch.name.toLowerCase().includes('finance') || ch.name.toLowerCase().includes('invoice')) {
            return role === 'FINANCE' || role === 'SUPER_ADMIN';
        }
        if (ch.name.toLowerCase().includes('hr') || ch.name.toLowerCase().includes('employee')) {
            return role === 'HR' || role === 'SUPER_ADMIN';
        }
        if (ch.type === 'public') return true;
        if (ch.type === 'dm' || ch.type === 'private') {
            return ch.participants.includes(userId) || role === 'SUPER_ADMIN';
        }
        return true;
    });
};

export const getMembers = async () => {
    const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true, email: true, role: true, avatar: true },
        orderBy: { name: 'asc' }
    });
    return users.filter((u) => policy[u.role]?.modules?.['teamhub']?.includes('read'));
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

export const listMessages = async (channelId: string, userId: string, role: string, query: Record<string, string>) => {
    await ensureSystemChannels();
    const channel = await resolveChannel(channelId);
    if (!channel) throw createError(404, 'Channel not found');

    const hasAccess = await canAccessChannel(userId, role, channelId);
    if (!hasAccess) throw createError(403, 'Access denied for this channel');
    const { skip, take, page, limit } = paginate(query);
    const where = { channelId: channel.id };
    const [data, total] = await Promise.all([
        prisma.message.findMany({ where, skip, take, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, avatar: true } } } }),
        prisma.message.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const sendMessage = async (userId: string, input: SendMessageInput) => {
    await ensureSystemChannels();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const channel = await resolveChannel(input.channelId);
    if (!channel) throw createError(404, 'Channel not found');

    const hasAccess = await canAccessChannel(userId, user?.role || '', input.channelId);
    if (!hasAccess) throw createError(403, 'Access denied for this channel');
    return prisma.message.create({
        data: { content: input.content, channelId: channel.id, attachments: input.attachments || [], senderId: userId },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
};

export const deleteMessage = async (id: string, userId: string, userRole: string) => {
    const msg = await prisma.message.findUnique({ where: { id } });
    if (!msg) throw createError(404, 'Message not found');
    if (msg.senderId !== userId && userRole !== 'SUPER_ADMIN') throw createError(403, 'Permission denied');
    return prisma.message.delete({ where: { id } });
};
