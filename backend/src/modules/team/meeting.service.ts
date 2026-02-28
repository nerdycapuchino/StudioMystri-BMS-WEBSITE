import prisma from '../../config/db';
import { MeetingStatus as PrismaMeetingStatus, ParticipantStatus as PrismaParticipantStatus } from '@prisma/client';
import { createError } from '../../middleware/errorHandler';
import { logActivity } from '../../utils/activityLogger';
import { generateGuestToken } from './guestToken';
import crypto from 'crypto';

// Re-export enums for socket handlers
export const MeetingStatus = PrismaMeetingStatus;
export const ParticipantStatus = PrismaParticipantStatus;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const MEETING_CODE_REGEX = /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/;

const generateMeetingCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(10);
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return `${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7, 10)}`;
};

export const validateMeetingCode = (code: string): boolean => MEETING_CODE_REGEX.test(code);

const getMeetingInclude = () => ({
    participants: {
        select: {
            id: true,
            userId: true,
            guestName: true,
            role: true,
            status: true,
            joinedAt: true,
            leftAt: true,
        },
    },
    createdBy: {
        select: { id: true, name: true, email: true },
    },
});

// ─── CREATE MEETING ──────────────────────────────────────────────────────────

export const createMeeting = async (
    userId: string,
    options: {
        title?: string;
        isScheduled?: boolean;
        startsAt?: string | Date;
        allowGuests?: boolean;
    } = {}
) => {
    const meetingCode = generateMeetingCode();
    const isScheduled = options.isScheduled || false;
    const status = isScheduled ? PrismaMeetingStatus.SCHEDULED : PrismaMeetingStatus.ACTIVE;

    const meeting = await prisma.meeting.create({
        data: {
            meetingCode,
            title: options.title || 'Team Meeting',
            createdById: userId,
            status,
            isScheduled,
            startsAt: options.startsAt ? new Date(options.startsAt) : null,
            allowGuests: options.allowGuests ?? false,
            meetingVersion: 1,
            participants: {
                create: {
                    userId,
                    role: 'HOST',
                    status: PrismaParticipantStatus.JOINED,
                },
            },
        },
        include: getMeetingInclude(),
    });

    await logActivity(prisma, userId, 'MEETING', 'CREATE', meeting.id, {
        meetingCode,
        title: meeting.title,
        isScheduled,
    });

    return meeting;
};

// ─── GET MEETING ─────────────────────────────────────────────────────────────

export const getMeeting = async (meetingCode: string) => {
    if (!validateMeetingCode(meetingCode)) throw createError(400, 'Invalid meeting code format');

    const meeting = await prisma.meeting.findUnique({
        where: { meetingCode },
        include: getMeetingInclude(),
    });
    if (!meeting) throw createError(404, 'Meeting not found');
    return meeting;
};

// ─── JOIN MEETING ────────────────────────────────────────────────────────────

export const joinMeeting = async (
    meetingCode: string,
    userId?: string,
    guestName?: string,
    guestEmail?: string
) => {
    if (!validateMeetingCode(meetingCode)) throw createError(400, 'Invalid meeting code format');

    const meeting = await prisma.meeting.findUnique({
        where: { meetingCode },
        include: { participants: true },
    });

    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.status === PrismaMeetingStatus.ENDED) {
        throw createError(410, 'This meeting has ended and cannot be rejoined');
    }
    if (meeting.isLocked) {
        throw createError(403, 'This meeting is locked by the host');
    }

    // Guest validation
    if (!userId) {
        if (!meeting.allowGuests) {
            throw createError(403, 'Guest access is not allowed. Please log in.');
        }
        if (!guestName || guestName.trim().length < 2) {
            throw createError(400, 'Guest name is required (minimum 2 characters)');
        }
    }

    // Check if user already has an active participant record
    if (userId) {
        const existing = meeting.participants.find(
            (p) => p.userId === userId && (p.status === PrismaParticipantStatus.JOINED || p.status === PrismaParticipantStatus.WAITING)
        );
        if (existing) {
            return {
                meeting,
                participantId: existing.id,
                participantStatus: existing.status,
                isRejoin: true,
                guestToken: null,
            };
        }
    }

    // Waiting room: if meeting is SCHEDULED and user is NOT the host
    const isHost = userId === meeting.createdById;
    const participantStatus = (meeting.status === PrismaMeetingStatus.SCHEDULED && !isHost)
        ? PrismaParticipantStatus.WAITING
        : PrismaParticipantStatus.JOINED;
    const isGuest = !userId;

    const participant = await prisma.meetingParticipant.create({
        data: {
            meetingId: meeting.id,
            userId: userId || null,
            guestName: isGuest ? guestName?.trim() : null,
            guestEmail: isGuest ? guestEmail?.trim() || null : null,
            role: isGuest ? 'GUEST' : (isHost ? 'HOST' : 'PARTICIPANT'),
            status: participantStatus,
        },
    });

    // Generate guest token with meetingVersion
    let guestToken = null;
    if (isGuest && guestName) {
        const tokenResult = generateGuestToken(meetingCode, guestName.trim(), meeting.meetingVersion);
        guestToken = tokenResult.token;
    }

    if (userId) {
        await logActivity(prisma, userId, 'MEETING', 'JOIN', meeting.id, {
            meetingCode,
            waitingRoom: participantStatus === PrismaParticipantStatus.WAITING,
        });
    }

    return {
        meeting,
        participantId: participant.id,
        participantStatus,
        isRejoin: false,
        guestToken,
    };
};

// ─── WAITING ROOM: ADMIT ─────────────────────────────────────────────────────

export const admitParticipant = async (
    meetingCode: string,
    participantId: string,
    hostUserId: string
) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.createdById !== hostUserId) {
        throw createError(403, 'Only the host can admit participants');
    }

    const participant = await prisma.meetingParticipant.findUnique({
        where: { id: participantId },
    });
    if (!participant || participant.meetingId !== meeting.id) {
        throw createError(404, 'Participant not found');
    }
    if (participant.status !== PrismaParticipantStatus.WAITING) {
        throw createError(400, 'Participant is not in the waiting room');
    }

    return prisma.meetingParticipant.update({
        where: { id: participantId },
        data: { status: PrismaParticipantStatus.JOINED },
    });
};

// ─── WAITING ROOM: REJECT ────────────────────────────────────────────────────

export const rejectParticipant = async (
    meetingCode: string,
    participantId: string,
    hostUserId: string
) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.createdById !== hostUserId) {
        throw createError(403, 'Only the host can reject participants');
    }

    const participant = await prisma.meetingParticipant.findUnique({
        where: { id: participantId },
    });
    if (!participant || participant.meetingId !== meeting.id) {
        throw createError(404, 'Participant not found');
    }

    return prisma.meetingParticipant.update({
        where: { id: participantId },
        data: { status: PrismaParticipantStatus.REJECTED },
    });
};

// ─── START SCHEDULED MEETING ─────────────────────────────────────────────────

export const startMeeting = async (meetingCode: string, hostUserId: string) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.createdById !== hostUserId) {
        throw createError(403, 'Only the host can start the meeting');
    }
    if (meeting.status === PrismaMeetingStatus.ENDED) {
        throw createError(400, 'Meeting has already ended');
    }
    if (meeting.status === PrismaMeetingStatus.ACTIVE) {
        throw createError(400, 'Meeting is already active');
    }

    const updated = await prisma.meeting.update({
        where: { meetingCode },
        data: { status: PrismaMeetingStatus.ACTIVE },
    });

    // Auto-admit all waiting participants
    await prisma.meetingParticipant.updateMany({
        where: {
            meetingId: meeting.id,
            status: PrismaParticipantStatus.WAITING,
        },
        data: { status: PrismaParticipantStatus.JOINED },
    });

    await logActivity(prisma, hostUserId, 'MEETING', 'UPDATE', meeting.id, {
        meetingCode,
        action: 'started',
    });

    return updated;
};

// ─── LOCK / UNLOCK MEETING ───────────────────────────────────────────────────

export const toggleLock = async (meetingCode: string, hostUserId: string) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.createdById !== hostUserId) {
        throw createError(403, 'Only the host can lock/unlock');
    }

    return prisma.meeting.update({
        where: { meetingCode },
        data: { isLocked: !meeting.isLocked },
    });
};

// ─── END MEETING ─────────────────────────────────────────────────────────────

export const endMeeting = async (meetingCode: string, userId: string) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.status === PrismaMeetingStatus.ENDED) {
        throw createError(400, 'Meeting is already ended');
    }
    if (meeting.createdById !== userId) {
        throw createError(403, 'Only the meeting host can end the meeting');
    }

    // Increment meetingVersion to invalidate all guest tokens
    const updated = await prisma.meeting.update({
        where: { meetingCode },
        data: {
            status: PrismaMeetingStatus.ENDED,
            endedAt: new Date(),
            meetingVersion: { increment: 1 },
        },
    });

    // Mark all non-LEFT participants as LEFT
    await prisma.meetingParticipant.updateMany({
        where: {
            meetingId: meeting.id,
            status: { in: [PrismaParticipantStatus.JOINED, PrismaParticipantStatus.WAITING] },
        },
        data: {
            status: PrismaParticipantStatus.LEFT,
            leftAt: new Date(),
        },
    });

    await logActivity(prisma, userId, 'MEETING', 'END', meeting.id, {
        meetingCode,
        duration: Math.round((Date.now() - meeting.createdAt.getTime()) / 1000),
    });

    return updated;
};

// ─── LEAVE MEETING ───────────────────────────────────────────────────────────

export const leaveMeeting = async (
    meetingCode: string,
    userId?: string,
    participantId?: string
) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) return null;

    if (participantId) {
        await prisma.meetingParticipant.update({
            where: { id: participantId },
            data: { status: PrismaParticipantStatus.LEFT, leftAt: new Date() },
        });
    } else if (userId) {
        await prisma.meetingParticipant.updateMany({
            where: {
                meetingId: meeting.id,
                userId,
                status: { in: [PrismaParticipantStatus.JOINED, PrismaParticipantStatus.WAITING] },
            },
            data: { status: PrismaParticipantStatus.LEFT, leftAt: new Date() },
        });
    }

    const activeCount = await prisma.meetingParticipant.count({
        where: { meetingId: meeting.id, status: PrismaParticipantStatus.JOINED },
    });

    return { activeCount, meetingId: meeting.id };
};

// ─── VALIDATE MEETING ACCESS ─────────────────────────────────────────────────

export const validateMeetingAccess = async (meetingCode: string) => {
    if (!validateMeetingCode(meetingCode)) throw createError(400, 'Invalid meeting code format');

    const meeting = await prisma.meeting.findUnique({
        where: { meetingCode },
        select: {
            id: true,
            meetingCode: true,
            status: true,
            isScheduled: true,
            startsAt: true,
            isLocked: true,
            allowGuests: true,
            meetingVersion: true,
            title: true,
            createdById: true,
            createdBy: { select: { name: true } },
        },
    });

    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.status === PrismaMeetingStatus.ENDED) {
        throw createError(410, 'This meeting has ended');
    }

    return meeting;
};

// ─── GET WAITING PARTICIPANTS ────────────────────────────────────────────────

export const getWaitingParticipants = async (meetingCode: string, hostUserId: string) => {
    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) throw createError(404, 'Meeting not found');
    if (meeting.createdById !== hostUserId) {
        throw createError(403, 'Only the host can view the waiting room');
    }

    return prisma.meetingParticipant.findMany({
        where: {
            meetingId: meeting.id,
            status: PrismaParticipantStatus.WAITING,
        },
        select: {
            id: true,
            userId: true,
            guestName: true,
            role: true,
            joinedAt: true,
        },
        orderBy: { joinedAt: 'asc' },
    });
};
