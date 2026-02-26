import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
        socket.data.userId = (payload.userId as string) || (payload.id as string);
        socket.data.userName = (payload.name as string) || (payload.email as string) || 'User';
        socket.data.userRole = payload.role;
        if (!socket.data.userId || !socket.data.userRole) {
            return next(new Error('Invalid token payload'));
        }
        next();
    } catch {
        next(new Error('Invalid token'));
    }
};
