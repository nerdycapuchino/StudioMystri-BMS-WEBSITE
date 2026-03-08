import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;

/** Get or lazily create the socket instance. Never throws. */
export const getSocket = (): Socket => {
    if (!socket) {
        try {
            const getApiBaseSocket = () => {
                if ((import.meta as any).env.VITE_API_URL) {
                    return (import.meta as any).env.VITE_API_URL.replace('/api/v1', '');
                }
                if (typeof window !== 'undefined') {
                    // On HTTPS deployments, use same-origin so socket upgrades to wss.
                    if (window.location.protocol === 'https:') {
                        return window.location.origin;
                    }
                    return `http://${window.location.hostname}:5000`;
                }
                return 'http://localhost:5000';
            };

            socket = io(getApiBaseSocket(), {
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



