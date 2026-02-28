import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../config/db';
import { logActivity } from '../utils/activityLogger';
import fs from "fs";
import path from "path";
import * as meetingService from '../modules/team/meeting.service';
import { MeetingStatus, ParticipantStatus } from '../modules/team/meeting.service';

const onlineUsers = new Map<string, { socketId: string; name: string }>();
const activeCalls = new Map<string, { channel: string; participants: string[] }>();

// ─── IP + MEETING RATE LIMITING (Fix #4) ─────────────────────────────────────
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW = 10_000; // 10 seconds
const RATE_MAX = 5;

function checkRateLimit(ip: string, meetingCode: string): boolean {
    const key = `${ip}:${meetingCode}`;
    const now = Date.now();
    const entry = rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }
    if (entry.count >= RATE_MAX) return false;
    entry.count++;
    return true;
}

// Periodic cleanup of stale rate limit entries
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits.entries()) {
        if (now > entry.resetAt) rateLimits.delete(key);
    }
}, 30_000);

// ─── SERVER-SIDE ACTIVE SPEAKER (Fix #5) ─────────────────────────────────────
const speakerLevels = new Map<string, Map<string, { level: number; ts: number }>>();
const SPEAKER_INTERVAL = 500;

function processActiveSpeaker(io: SocketIOServer, meetingCode: string) {
    const levels = speakerLevels.get(meetingCode);
    if (!levels || levels.size === 0) return;

    const cutoff = Date.now() - SPEAKER_INTERVAL * 2;
    let loudestId: string | null = null;
    let loudestLevel = 15; // threshold

    for (const [uid, { level, ts }] of levels) {
        if (ts < cutoff) { levels.delete(uid); continue; }
        if (level > loudestLevel) {
            loudestLevel = level;
            loudestId = uid;
        }
    }

    if (loudestId) {
        io.to(`meeting:${meetingCode}`).emit('active-speaker:update', {
            userId: loudestId,
            level: loudestLevel,
        });
    }
}

// Run active speaker calculation every 500ms per meeting
const speakerTimers = new Map<string, NodeJS.Timeout>();

function ensureSpeakerTimer(io: SocketIOServer, meetingCode: string) {
    if (speakerTimers.has(meetingCode)) return;
    const timer = setInterval(() => processActiveSpeaker(io, meetingCode), SPEAKER_INTERVAL);
    speakerTimers.set(meetingCode, timer);
}

function cleanupSpeakerTimer(meetingCode: string) {
    const timer = speakerTimers.get(meetingCode);
    if (timer) {
        clearInterval(timer);
        speakerTimers.delete(meetingCode);
    }
    speakerLevels.delete(meetingCode);
}

// ─── RBAC POLICY ─────────────────────────────────────────────────────────────
const policyPath = path.join(__dirname, "../../../rbac-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

export async function canAccessChannel(userId: string, role: string, channelId: string): Promise<boolean> {
    if (!role) return false;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
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

    if (channel.type === 'private' || channel.type === 'dm') {
        return channel.participants.includes(userId) || role === 'SUPER_ADMIN';
    }
    return false;
}

// ─── SOCKET → MEETING MAPPING FOR CLEANUP ────────────────────────────────────
const socketMeetings = new Map<string, { meetingCode: string; participantId: string }>();

export const registerSocketHandlers = (io: SocketIOServer) => {
    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        const isGuest = socket.data.isGuest === true;
        const clientIp = socket.handshake.address || 'unknown';

        socket.join(`user:${userId}`);

        if (!isGuest) {
            onlineUsers.set(userId, { socketId: socket.id, name: socket.data.userName });
            io.emit('presence:update', Array.from(onlineUsers.keys()));
        }

        // ══════════════════════════════════════════════════════════════════
        // ─── TEAM HUB CHANNELS (Chat) ────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════

        socket.on('channel:create', async (payload: { name: string; type: 'public' | 'private' | 'dm'; participants?: string[] }) => {
            if (isGuest) return socket.emit('error', { message: 'Guests cannot create channels' });
            try {
                const userRole = socket.data.userRole;
                const canCreate = policy[userRole]?.modules?.['teamhub']?.includes('create');
                if (!canCreate) return socket.emit('error', { message: 'Access denied: Cannot create channels.' });

                let participants = payload.participants || [];
                if (payload.type === 'dm' || payload.type === 'private') {
                    if (!participants.includes(userId)) participants.push(userId);
                }

                const channel = await prisma.channel.create({
                    data: { name: payload.name, type: payload.type, participants }
                });

                if (payload.type !== 'public') {
                    participants.forEach(pId => io.to(`user:${pId}`).emit('channel:new', channel));
                } else {
                    io.emit('channel:new', channel);
                }
                logActivity(prisma, userId, 'TEAM', 'CREATE', channel.id, { name: channel.name }, 'socket');
            } catch {
                socket.emit('error', { message: 'Failed to create channel' });
            }
        });

        socket.on('channel:join', async (channelId: string) => {
            if (isGuest) return;
            const hasAccess = await canAccessChannel(userId, socket.data.userRole, channelId);
            if (!hasAccess) return socket.emit('error', { message: 'Access denied.' });
            socket.join(`channel:${channelId}`);
        });

        socket.on('channel:leave', (channelId: string) => { socket.leave(`channel:${channelId}`); });

        socket.on('message:send', async (payload: { channelId: string; content: string; attachments?: string[] }) => {
            if (isGuest) return socket.emit('error', { message: 'Guests cannot send messages' });
            try {
                const hasAccess = await canAccessChannel(userId, socket.data.userRole, payload.channelId);
                if (!hasAccess) return socket.emit('error', { message: 'Access denied.' });

                const message = await prisma.message.create({
                    data: {
                        senderId: userId,
                        content: payload.content,
                        channelId: payload.channelId,
                        attachments: payload.attachments || [],
                    },
                    include: { sender: { select: { id: true, name: true, avatar: true } } }
                });
                io.to(`channel:${payload.channelId}`).emit('message:new', message);
                logActivity(prisma, userId, 'TEAM', 'CREATE', message.id, { channel: payload.channelId }, 'socket');
            } catch {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('typing:start', (channelId: string) => {
            socket.to(`channel:${channelId}`).emit('typing:update', { userId, userName: socket.data.userName, isTyping: true, channelId });
        });
        socket.on('typing:stop', (channelId: string) => {
            socket.to(`channel:${channelId}`).emit('typing:update', { userId, userName: socket.data.userName, isTyping: false, channelId });
        });

        // ── SOFT DELETE ──
        socket.on('message:delete', async (messageId: string) => {
            try {
                const msg = await prisma.message.findUnique({ where: { id: messageId } });
                if (!msg) return socket.emit('error', { message: 'Message not found' });
                if (msg.senderId !== userId && socket.data.userRole !== 'SUPER_ADMIN') {
                    return socket.emit('error', { message: 'Not authorized' });
                }
                await prisma.message.update({
                    where: { id: messageId },
                    data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
                });
                io.to(`channel:${msg.channelId}`).emit('message:deleted', { messageId, channelId: msg.channelId });
                logActivity(prisma, userId, 'TEAM', 'DELETE', messageId, { channelId: msg.channelId, softDelete: true }, 'socket');
            } catch {
                socket.emit('error', { message: 'Failed to delete' });
            }
        });

        socket.on('chat:delete', async (channelId: string) => {
            try {
                const hasAccess = await canAccessChannel(userId, socket.data.userRole, channelId);
                if (!hasAccess) return socket.emit('error', { message: 'Access denied' });
                await prisma.message.updateMany({
                    where: { channelId },
                    data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
                });
                io.to(`channel:${channelId}`).emit('chat:deleted', { channelId });
                logActivity(prisma, userId, 'TEAM', 'DELETE', channelId, { type: 'conversation_clear' }, 'socket');
            } catch {
                socket.emit('error', { message: 'Failed to delete chat' });
            }
        });

        // ══════════════════════════════════════════════════════════════════
        // ─── CHANNEL-BASED VIDEO CALLS (legacy) ──────────────────────────
        // ══════════════════════════════════════════════════════════════════

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
            if (call && !call.participants.includes(userId)) call.participants.push(userId);
            if (call) socket.to(`channel:${channelId}`).emit('call:user-joined', { userId, channelId });
        });

        socket.on('webrtc:signal', (payload: { targetId: string; signal: any; channelId?: string; channel?: string }) => {
            io.to(`user:${payload.targetId}`).emit('webrtc:signal', {
                senderId: userId, signal: payload.signal, channelId: payload.channelId || payload.channel
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

        // ══════════════════════════════════════════════════════════════════
        // ─── MEETING PROTOCOL (Production Video Call) ────────────────────
        // ══════════════════════════════════════════════════════════════════

        // ── meeting:join ──
        socket.on('meeting:join', async (payload: { meetingCode: string; participantId?: string }) => {
            // Rate limit per IP + meetingCode (Fix #4)
            if (!checkRateLimit(clientIp, payload.meetingCode)) {
                return socket.emit('error', { message: 'Rate limited. Please try again.' });
            }
            try {
                const { meetingCode, participantId } = payload;
                const meeting = await meetingService.validateMeetingAccess(meetingCode);

                // Guest scoping
                if (isGuest && socket.data.meetingCode !== meetingCode) {
                    return socket.emit('error', { message: 'Access denied: Invalid meeting token' });
                }

                const room = `meeting:${meetingCode}`;
                socket.join(room);

                if (participantId) {
                    socketMeetings.set(socket.id, { meetingCode, participantId });
                }

                // Waiting room: SCHEDULED meeting + not host → wait
                const isHost = meeting.createdById === userId;
                if (meeting.status === MeetingStatus.SCHEDULED && !isHost) {
                    io.to(room).emit('waiting:request', {
                        participantId,
                        userId,
                        userName: socket.data.userName,
                        isGuest,
                        meetingCode,
                    });
                    socket.emit('meeting:waiting', { meetingCode, status: 'WAITING' });
                } else {
                    socket.emit('meeting:joined', { meetingCode, status: 'JOINED' });
                    socket.to(room).emit('meeting:user-joined', {
                        userId,
                        userName: socket.data.userName,
                        participantId,
                        meetingCode,
                    });
                }

                // Start active speaker timer for this meeting
                ensureSpeakerTimer(io, meetingCode);
            } catch (err: any) {
                socket.emit('error', { message: err.message || 'Failed to join meeting' });
            }
        });

        // ── meeting:leave ──
        socket.on('meeting:leave', async (payload: { meetingCode: string }) => {
            try {
                const { meetingCode } = payload;
                const room = `meeting:${meetingCode}`;
                const mapping = socketMeetings.get(socket.id);
                const result = await meetingService.leaveMeeting(meetingCode, userId, mapping?.participantId);

                socket.leave(room);
                socketMeetings.delete(socket.id);

                socket.to(room).emit('meeting:user-left', { userId, userName: socket.data.userName, meetingCode });

                if (result && result.activeCount === 0) {
                    try {
                        await meetingService.endMeeting(meetingCode, userId);
                        io.to(room).emit('meeting:ended', { meetingCode, endedBy: userId, reason: 'all_left' });
                        cleanupSpeakerTimer(meetingCode);
                    } catch { /* not host */ }
                }
            } catch (err: any) {
                socket.emit('error', { message: err.message || 'Failed to leave' });
            }
        });

        // ── meeting:end ──
        socket.on('meeting:end', async (payload: { meetingCode: string }) => {
            try {
                const { meetingCode } = payload;
                await meetingService.endMeeting(meetingCode, userId);
                const room = `meeting:${meetingCode}`;

                io.to(room).emit('meeting:ended', { meetingCode, endedBy: userId });

                // Force-disconnect all sockets from room
                const sockets = await io.in(room).fetchSockets();
                for (const s of sockets) {
                    s.leave(room);
                    socketMeetings.delete(s.id);
                }

                cleanupSpeakerTimer(meetingCode);
            } catch (err: any) {
                socket.emit('error', { message: err.message || 'Failed to end' });
            }
        });

        // ── waiting:admit ──
        socket.on('waiting:admit', async (payload: { meetingCode: string; participantId: string; targetUserId: string }) => {
            try {
                await meetingService.admitParticipant(payload.meetingCode, payload.participantId, userId);
                const room = `meeting:${payload.meetingCode}`;

                io.to(`user:${payload.targetUserId}`).emit('waiting:admitted', { meetingCode: payload.meetingCode });
                io.to(room).emit('meeting:user-joined', {
                    userId: payload.targetUserId,
                    participantId: payload.participantId,
                    meetingCode: payload.meetingCode,
                });
            } catch (err: any) {
                socket.emit('error', { message: err.message || 'Failed to admit' });
            }
        });

        // ── waiting:reject ──
        socket.on('waiting:reject', async (payload: { meetingCode: string; participantId: string; targetUserId: string }) => {
            try {
                await meetingService.rejectParticipant(payload.meetingCode, payload.participantId, userId);
                io.to(`user:${payload.targetUserId}`).emit('waiting:rejected', { meetingCode: payload.meetingCode });
            } catch (err: any) {
                socket.emit('error', { message: err.message || 'Failed to reject' });
            }
        });

        // ── WebRTC Signaling (namespaced, never broadcast) ──
        socket.on('peer:offer', (payload: { targetId: string; sdp: any; meetingCode: string }) => {
            if (!checkRateLimit(clientIp, payload.meetingCode)) return;
            io.to(`user:${payload.targetId}`).emit('peer:offer', {
                senderId: userId, sdp: payload.sdp, meetingCode: payload.meetingCode,
            });
        });

        socket.on('peer:answer', (payload: { targetId: string; sdp: any; meetingCode: string }) => {
            io.to(`user:${payload.targetId}`).emit('peer:answer', {
                senderId: userId, sdp: payload.sdp, meetingCode: payload.meetingCode,
            });
        });

        socket.on('peer:ice', (payload: { targetId: string; candidate: any; meetingCode: string }) => {
            io.to(`user:${payload.targetId}`).emit('peer:ice', {
                senderId: userId, candidate: payload.candidate, meetingCode: payload.meetingCode,
            });
        });

        // ── Participant state broadcasts ──
        socket.on('participant:mute', (payload: { meetingCode: string; muted: boolean }) => {
            socket.to(`meeting:${payload.meetingCode}`).emit('participant:mute', { userId, muted: payload.muted });
        });

        socket.on('participant:video-toggle', (payload: { meetingCode: string; videoOff: boolean }) => {
            socket.to(`meeting:${payload.meetingCode}`).emit('participant:video-toggle', { userId, videoOff: payload.videoOff });
        });

        // ── Active speaker: client sends sample, SERVER decides (Fix #5) ──
        socket.on('active-speaker:sample', (payload: { meetingCode: string; level: number }) => {
            const { meetingCode, level } = payload;
            if (!speakerLevels.has(meetingCode)) {
                speakerLevels.set(meetingCode, new Map());
            }
            speakerLevels.get(meetingCode)!.set(userId, { level, ts: Date.now() });
        });

        // ── Raise hand ──
        socket.on('raise-hand', (payload: { meetingCode: string; raised: boolean }) => {
            io.to(`meeting:${payload.meetingCode}`).emit('raise-hand', {
                userId, userName: socket.data.userName, raised: payload.raised,
            });
        });

        // ── Screen sharing ──
        socket.on('screen:start', (payload: { meetingCode?: string; channelId?: string }) => {
            const room = payload.meetingCode ? `meeting:${payload.meetingCode}` : payload.channelId ? `channel:${payload.channelId}` : null;
            if (!room) return;
            socket.to(room).emit('screen:started', { userId, userName: socket.data.userName, meetingCode: payload.meetingCode, channelId: payload.channelId });
        });

        socket.on('screen:stop', (payload: { meetingCode?: string; channelId?: string }) => {
            const room = payload.meetingCode ? `meeting:${payload.meetingCode}` : payload.channelId ? `channel:${payload.channelId}` : null;
            if (!room) return;
            socket.to(room).emit('screen:stopped', { userId, userName: socket.data.userName, meetingCode: payload.meetingCode, channelId: payload.channelId });
        });

        // ── Presence ──
        socket.on('presence:ping', () => { socket.emit('presence:update', Array.from(onlineUsers.keys())); });

        // ── Notifications ──
        socket.on('notifications:ping', async () => {
            if (isGuest) return;
            const count = await prisma.notification.count({ where: { userId, isRead: false } });
            socket.emit('notifications:count', { unread: count });
        });

        // ══════════════════════════════════════════════════════════════════
        // ─── DISCONNECT CLEANUP ──────────────────────────────────────────
        // ══════════════════════════════════════════════════════════════════
        socket.on('disconnect', async () => {
            if (!isGuest) {
                onlineUsers.delete(userId);
                io.emit('presence:update', Array.from(onlineUsers.keys()));
            }

            // Channel call cleanup
            for (const [channelId, call] of activeCalls.entries()) {
                if (call.participants.includes(userId)) {
                    call.participants = call.participants.filter(p => p !== userId);
                    if (call.participants.length === 0) {
                        activeCalls.delete(channelId);
                        io.to(`channel:${channelId}`).emit('call:ended', { channelId });
                    } else {
                        io.to(`channel:${channelId}`).emit('call:user-left', { userId, channelId });
                    }
                }
            }

            // Meeting cleanup
            const meetingMapping = socketMeetings.get(socket.id);
            if (meetingMapping) {
                const { meetingCode, participantId } = meetingMapping;
                socketMeetings.delete(socket.id);

                try {
                    await meetingService.leaveMeeting(meetingCode, userId, participantId);
                    io.to(`meeting:${meetingCode}`).emit('meeting:user-left', {
                        userId, userName: socket.data.userName, meetingCode,
                    });
                } catch { /* meeting may be ended */ }

                // Clean speaker data for this user
                const levels = speakerLevels.get(meetingCode);
                if (levels) levels.delete(userId);
            }
        });
    });
};

export async function pushNotification(
    io: SocketIOServer,
    userId: string,
    notification: { title: string; message: string; type: string }
) {
    const saved = await prisma.notification.create({ data: { userId, ...notification } });
    io.to(`user:${userId}`).emit('notification:new', saved);
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    io.to(`user:${userId}`).emit('notifications:count', { unread: count });
}
