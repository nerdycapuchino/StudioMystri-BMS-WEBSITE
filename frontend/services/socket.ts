import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
            auth: { token: getAccessToken() },
            transports: ['websocket', 'polling'],
            autoConnect: false,
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        // Refresh auth token before connecting (token may have changed)
        s.auth = { token: getAccessToken() };
        s.connect();
    }
};

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};
