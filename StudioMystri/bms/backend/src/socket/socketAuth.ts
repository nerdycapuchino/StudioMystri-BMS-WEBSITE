import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Socket authentication middleware.
 * Supports both authenticated users (standard JWT) and meeting guests (guest JWT).
 */
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

        // Guest token check (has guestId + meetingCode + role=GUEST)
        if (payload.role === 'GUEST' && payload.guestId && payload.meetingCode) {
            socket.data.userId = payload.guestId;
            socket.data.userName = payload.guestName || 'Guest';
            socket.data.userRole = 'GUEST';
            socket.data.isGuest = true;
            socket.data.meetingCode = payload.meetingCode;
            return next();
        }

        // Standard user token
        socket.data.userId = (payload.userId as string) || (payload.id as string);
        socket.data.userName = (payload.name as string) || (payload.email as string) || 'User';
        socket.data.userRole = payload.role;
        socket.data.isGuest = false;

        if (!socket.data.userId || !socket.data.userRole) {
            return next(new Error('Invalid token payload'));
        }
        next();
    } catch {
        next(new Error('Invalid token'));
    }
};
