import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const getApiBase = () => {
    if ((import.meta as any).env.VITE_API_URL) return (import.meta as any).env.VITE_API_URL;
    if (typeof window !== 'undefined') {
        // On HTTPS deployments, always use same-origin API to avoid mixed-content blocking.
        if (window.location.protocol === 'https:') {
            return `${window.location.origin}/api/v1`;
        }
        const hostname = window.location.hostname;
        return `http://${hostname}:5000/api/v1`;
    }
    return 'http://localhost:5000/api/v1';
};
const API_BASE = getApiBase();

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // sends httpOnly refresh cookie automatically
});

// ── Request Interceptor — attach access token ──────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response Interceptor — silent 401 refresh ──────────────────────
interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const shouldSkipRefreshFlow = (url?: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
        lowerUrl.includes('/auth/login') ||
        lowerUrl.includes('/auth/refresh') ||
        lowerUrl.includes('/auth/logout') ||
        lowerUrl.includes('/auth/reset-password')
    );
};

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const skipRefresh = shouldSkipRefreshFlow(originalRequest?.url);

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_BASE}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken: string = data.data?.accessToken || data.accessToken;
                setAccessToken(newToken);
                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                clearAccessToken();
                window.dispatchEvent(new Event('force_logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;


