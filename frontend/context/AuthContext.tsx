import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import api from '../services/api';
import { setAccessToken, clearAccessToken } from '../services/tokenStore';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount — try to restore session via refresh cookie
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { data: refreshData } = await axios.post(
                    `${API_BASE}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const token = refreshData.data?.accessToken || refreshData.accessToken;
                setAccessToken(token);
                const { data: meData } = await api.get('/auth/me');
                setUser(meData.data || meData);
                connectSocket();
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    useEffect(() => {
        const handleForceLogout = () => {
            clearAccessToken();
            setUser(null);
            disconnectSocket();
        };
        window.addEventListener('force_logout', handleForceLogout);
        return () => window.removeEventListener('force_logout', handleForceLogout);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        const token = data.data?.accessToken || data.accessToken;
        setAccessToken(token);
        setUser(data.data?.user || data.user);
        connectSocket();
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // ignore errors on logout
        }
        disconnectSocket();
        clearAccessToken();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
