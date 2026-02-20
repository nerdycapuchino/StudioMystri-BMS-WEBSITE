import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
        socket.data.userId = payload.userId;
        socket.data.userName = payload.name;
        socket.data.userRole = payload.role;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
};
