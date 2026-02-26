import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../config/db';
import { logActivity } from '../utils/activityLogger';
import fs from "fs";
import path from "path";

const onlineUsers = new Map<string, { socketId: string; name: string }>();
const activeCalls = new Map<string, { channel: string; participants: string[] }>();

const policyPath = path.join(__dirname, "../../../rbac-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

export async function canAccessChannel(userId: string, role: string, channelId: string): Promise<boolean> {
    if (!role) return false;

    // Check if channel exists
    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) return false;

    // Public channels: check only general teamhub access
    if (channel.type === 'public') {
        const hasTeamhubAccess = policy[role]?.modules?.['teamhub']?.includes('read');

        // Strict mapping for Finance/HR naming conventions (extra guardrail)
        if (channel.name.toLowerCase().includes('finance') || channel.name.toLowerCase().includes('invoice')) {
            return role === 'FINANCE' || role === 'SUPER_ADMIN';
        }
        if (channel.name.toLowerCase().includes('hr') || channel.name.toLowerCase().includes('employee')) {
            return role === 'HR' || role === 'SUPER_ADMIN';
        }

        return !!hasTeamhubAccess;
    }

    // Private and DM channels: check participant list
    if (channel.type === 'private' || channel.type === 'dm') {
        return channel.participants.includes(userId) || role === 'SUPER_ADMIN';
    }

    return false;
}

export const registerSocketHandlers = (io: SocketIOServer) => {
    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;

        // Join a personal room for direct notifications
        socket.join(`user:${userId}`);

        // Track online status
        onlineUsers.set(userId, { socketId: socket.id, name: socket.data.userName });
        io.emit('presence:update', Array.from(onlineUsers.keys()));

        // ── TEAM HUB ──

        // Create a channel
        socket.on('channel:create', async (payload: { name: string; type: 'public' | 'private' | 'dm'; participants?: string[] }) => {
            try {
                const userRole = socket.data.userRole;
                const canCreate = policy[userRole]?.modules?.['teamhub']?.includes('create');
                if (!canCreate) {
                    return socket.emit('error', { message: 'Access denied: Cannot create channels.' });
                }

                // If DM, ensure participants sorted
                let participants = payload.participants || [];
                if (payload.type === 'dm' || payload.type === 'private') {
                    if (!participants.includes(userId)) participants.push(userId);
                }

                const channel = await prisma.channel.create({
                    data: {
                        name: payload.name,
                        type: payload.type,
                        participants: participants
                    }
                });

                // Notify participants to join
                if (payload.type !== 'public') {
                    participants.forEach(pId => {
                        io.to(`user:${pId}`).emit('channel:new', channel);
                    });
                } else {
                    io.emit('channel:new', channel);
                }

                logActivity(prisma, userId, 'TEAM', 'CREATE', channel.id, { name: channel.name }, 'socket');
            } catch (err) {
                socket.emit('error', { message: 'Failed to create channel' });
            }
        });

        // Join a channel room
        socket.on('channel:join', async (channelId: string) => {
            const userRole = socket.data.userRole;

            const hasAccess = await canAccessChannel(userId, userRole, channelId);
            if (!hasAccess) {
                return socket.emit('error', { message: 'Access denied: You do not have permission to view this channel.' });
            }

            socket.join(`channel:${channelId}`);
            console.log(`${socket.data.userName} joined channel: ${channelId}`);
        });

        // Leave a channel room
        socket.on('channel:leave', (channelId: string) => {
            socket.leave(`channel:${channelId}`);
        });

        // New message
        socket.on('message:send', async (payload: { channelId: string; content?: string; type?: 'TEXT' | 'FILE' | 'IMAGE'; fileUrl?: string; fileName?: string; fileSize?: number; mentions?: string[]; attachments?: string[] }) => {
            try {
                const hasAccess = await canAccessChannel(userId, socket.data.userRole, payload.channelId);
                if (!hasAccess) {
                    return socket.emit('error', { message: 'Access denied: Cannot send message to this channel.' });
                }

                const message = await prisma.message.create({
                    data: {
                        senderId: userId,
                        content: payload.content || '',
                        type: payload.type || 'TEXT',
                        fileUrl: payload.fileUrl,
                        fileName: payload.fileName,
                        fileSize: payload.fileSize,
                        mentions: payload.mentions || [],
                        channelId: payload.channelId,
                        attachments: payload.attachments || [],
                    },
                    include: { sender: { select: { id: true, name: true, avatar: true } } }
                });

                io.to(`channel:${payload.channelId}`).emit('message:new', message);

                logActivity(prisma, userId, 'TEAM', 'CREATE', message.id, { channel: payload.channelId, type: message.type }, 'socket');

                // Trigger Mentions Notifications
                if (payload.mentions && payload.mentions.length > 0) {
                    const channel = await prisma.channel.findUnique({ where: { id: payload.channelId } });
                    for (const mentionedId of payload.mentions) {
                        pushNotification(io, mentionedId, {
                            title: 'New Mention',
                            message: `${socket.data.userName} mentioned you in ${channel?.name || 'a channel'}`,
                            type: 'MENTION'
                        });
                    }
                }
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing:start', async (channelId: string) => {
            socket.to(`channel:${channelId}`).emit('typing:update', {
                userId,
                userName: socket.data.userName, // Broadcasts standard display name
                isTyping: true,
                channelId,
            });
        });

        socket.on('typing:stop', (channelId: string) => {
            socket.to(`channel:${channelId}`).emit('typing:update', {
                userId,
                userName: socket.data.userName,
                isTyping: false,
                channelId,
            });
        });

        // Message delete
        socket.on('message:delete', async (messageId: string) => {
            try {
                const msg = await prisma.message.findUnique({ where: { id: messageId } });
                if (!msg) return socket.emit('error', { message: 'Message not found' });
                if (msg.senderId !== userId && socket.data.userRole !== 'SUPER_ADMIN') {
                    return socket.emit('error', { message: 'Not authorized to delete' });
                }
                await prisma.message.delete({ where: { id: messageId } });
                io.to(`channel:${msg.channelId}`).emit('message:deleted', { messageId, channelId: msg.channelId });
            } catch (err) {
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // ── VIDEO CALLS (WebRTC Signalling) ──

        socket.on('call:start', async (payload: { channelId?: string; channel?: string }) => {
            const channelId = payload.channelId || payload.channel;
            if (!channelId) return;
            const hasAccess = await canAccessChannel(userId, socket.data.userRole, channelId);
            if (!hasAccess) return;

            if (!activeCalls.has(channelId)) {
                activeCalls.set(channelId, { channel: channelId, participants: [userId] });
            }
            socket.to(`channel:${channelId}`).emit('call:started', { channelId, startedBy: userId });
        });

        socket.on('call:join', async (payload: { channelId?: string; channel?: string }) => {
            const channelId = payload.channelId || payload.channel;
            if (!channelId) return;
            const hasAccess = await canAccessChannel(userId, socket.data.userRole, channelId);
            if (!hasAccess) return;

            const call = activeCalls.get(channelId);
            if (call) {
                if (!call.participants.includes(userId)) {
                    call.participants.push(userId);
                }
                socket.to(`channel:${channelId}`).emit('call:user-joined', { userId, channelId });
            }
        });

        socket.on('webrtc:signal', (payload: { targetId: string; signal: any; channelId?: string; channel?: string }) => {
            const channelId = payload.channelId || payload.channel;
            // Forward signal to specific user
            io.to(`user:${payload.targetId}`).emit('webrtc:signal', {
                senderId: userId,
                signal: payload.signal,
                channelId
            });
        });

        socket.on('call:end', (payload: { channelId?: string; channel?: string }) => {
            const channelId = payload.channelId || payload.channel;
            if (!channelId) return;
            const call = activeCalls.get(channelId);
            if (call) {
                call.participants = call.participants.filter(p => p !== userId);
                if (call.participants.length === 0) {
                    activeCalls.delete(channelId);
                    io.to(`channel:${channelId}`).emit('call:ended', { channelId });
                } else {
                    socket.to(`channel:${channelId}`).emit('call:user-left', { userId, channelId });
                }
            }
        });

        socket.on('presence:ping', () => {
            socket.emit('presence:update', Array.from(onlineUsers.keys()));
        });

        // ── NOTIFICATIONS ──

        socket.on('notifications:ping', async () => {
            const count = await prisma.notification.count({
                where: { userId, isRead: false }
            });
            socket.emit('notifications:count', { unread: count });
        });

        // ── DISCONNECT ──
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('presence:update', Array.from(onlineUsers.keys()));
        });
    });
};

export async function pushNotification(
    io: SocketIOServer,
    userId: string,
    notification: { title: string; message: string; type: string }
) {
    const saved = await prisma.notification.create({
        data: { userId, ...notification }
    });
    io.to(`user:${userId}`).emit('notification:new', saved);
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    io.to(`user:${userId}`).emit('notifications:count', { unread: count });
}
