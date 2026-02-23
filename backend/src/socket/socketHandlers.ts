import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../config/db';
import { logActivity } from '../utils/activityLogger';

const onlineUsers = new Map<string, { socketId: string; name: string }>();
const activeCalls = new Map<string, { channel: string; participants: string[] }>();

export const registerSocketHandlers = (io: SocketIOServer) => {
    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;

        // Join a personal room for direct notifications
        socket.join(`user:${userId}`);

        // Track online status
        onlineUsers.set(userId, { socketId: socket.id, name: socket.data.userName });
        io.emit('presence:update', Array.from(onlineUsers.keys()));

        // ── TEAM HUB ──

        // Join a channel room
        socket.on('channel:join', (channel: string) => {
            socket.join(`channel:${channel}`);
            console.log(`${socket.data.userName} joined channel: ${channel}`);
        });

        // Leave a channel room
        socket.on('channel:leave', (channel: string) => {
            socket.leave(`channel:${channel}`);
        });

        // New message
        socket.on('message:send', async (payload: { channel: string; content: string; attachments?: string[] }) => {
            try {
                const message = await prisma.message.create({
                    data: {
                        senderId: userId,
                        content: payload.content,
                        channel: payload.channel,
                        attachments: payload.attachments || [],
                    },
                    include: { sender: { select: { id: true, name: true, avatar: true } } }
                });

                io.to(`channel:${payload.channel}`).emit('message:new', message);

                logActivity(prisma, userId, 'TEAM', 'CREATE', message.id, { channel: payload.channel }, 'socket');
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing:start', (channel: string) => {
            socket.to(`channel:${channel}`).emit('typing:update', {
                userId,
                userName: socket.data.userName,
                isTyping: true,
                channel,
            });
        });

        socket.on('typing:stop', (channel: string) => {
            socket.to(`channel:${channel}`).emit('typing:update', {
                userId,
                userName: socket.data.userName,
                isTyping: false,
                channel,
            });
        });

        // Message delete
        socket.on('message:delete', async (messageId: string) => {
            try {
                const msg = await prisma.message.findUnique({ where: { id: messageId } });
                if (!msg) return socket.emit('error', { message: 'Message not found' });
                if (msg.senderId !== userId && socket.data.userRole !== 'ADMIN') {
                    return socket.emit('error', { message: 'Not authorized' });
                }
                await prisma.message.delete({ where: { id: messageId } });
                io.to(`channel:${msg.channel}`).emit('message:deleted', { messageId, channel: msg.channel });
            } catch (err) {
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // ── VIDEO CALLS (WebRTC Signalling) ──

        socket.on('call:start', (payload: { channel: string }) => {
            if (!activeCalls.has(payload.channel)) {
                activeCalls.set(payload.channel, { channel: payload.channel, participants: [userId] });
            }
            socket.to(`channel:${payload.channel}`).emit('call:started', { channel: payload.channel, startedBy: userId });
        });

        socket.on('call:join', (payload: { channel: string }) => {
            const call = activeCalls.get(payload.channel);
            if (call) {
                if (!call.participants.includes(userId)) {
                    call.participants.push(userId);
                }
                socket.to(`channel:${payload.channel}`).emit('call:user-joined', { userId, channel: payload.channel });
            }
        });

        socket.on('webrtc:signal', (payload: { targetId: string; signal: any; channel: string }) => {
            // Forward signal to specific user
            io.to(`user:${payload.targetId}`).emit('webrtc:signal', {
                senderId: userId,
                signal: payload.signal,
                channel: payload.channel
            });
        });

        socket.on('call:end', (payload: { channel: string }) => {
            const call = activeCalls.get(payload.channel);
            if (call) {
                call.participants = call.participants.filter(p => p !== userId);
                if (call.participants.length === 0) {
                    activeCalls.delete(payload.channel);
                    io.to(`channel:${payload.channel}`).emit('call:ended', { channel: payload.channel });
                } else {
                    socket.to(`channel:${payload.channel}`).emit('call:user-left', { userId, channel: payload.channel });
                }
            }
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
