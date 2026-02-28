import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import crypto from 'crypto';

/**
 * Payload shape for guest meeting tokens.
 */
interface GuestTokenPayload {
    guestId: string;
    guestName: string;
    meetingCode: string;
    meetingVersion: number;
    role: 'GUEST';
}

/**
 * Generate a temporary JWT for guest meeting participants.
 * Token is short-lived (2 hours), scoped to a specific meeting,
 * and includes meetingVersion for automatic invalidation on meeting end.
 */
export const generateGuestToken = (
    meetingCode: string,
    guestName: string,
    meetingVersion: number
): { token: string; guestId: string } => {
    const guestId = `guest_${crypto.randomBytes(8).toString('hex')}`;

    const payload: GuestTokenPayload = {
        guestId,
        guestName,
        meetingCode,
        meetingVersion,
        role: 'GUEST',
    };

    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: '2h',
        subject: guestId,
    });

    return { token, guestId };
};

/**
 * Verify and decode a guest token.
 * Returns null if invalid, expired, or meetingVersion mismatches.
 */
export const verifyGuestToken = (
    token: string,
    currentMeetingVersion?: number
): GuestTokenPayload | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as GuestTokenPayload;
        if (decoded.role !== 'GUEST' || !decoded.meetingCode || !decoded.guestId) {
            return null;
        }
        // Version check: if current version provided and doesn't match, token is stale
        if (currentMeetingVersion !== undefined && decoded.meetingVersion !== currentMeetingVersion) {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
};
