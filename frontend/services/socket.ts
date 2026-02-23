import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;

/** Get or lazily create the socket instance. Never throws. */
export const getSocket = (): Socket => {
    if (!socket) {
        try {
            socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
                auth: { token: getAccessToken() },
                transports: ['websocket', 'polling'],
                autoConnect: false,
            });
        } catch {
            // If socket.io fails to initialize, return a no-op stub
            return null as unknown as Socket;
        }
    }
    return socket;
};

/** Safe getter — returns null if socket not available. Callers must null-check. */
export const getSocketSafe = (): Socket | null => {
    return socket;
};

export const connectSocket = () => {
    try {
        const s = getSocket();
        if (s && !s.connected) {
            s.auth = { token: getAccessToken() };
            s.connect();
        }
    } catch {
        // Socket connection failures should never crash the app
        console.warn('[Socket] Failed to connect — will retry on next interaction');
    }
};

export const disconnectSocket = () => {
    try { socket?.disconnect(); } catch { /* ignore */ }
    socket = null;
};

