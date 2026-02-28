import api from './api';

export const getNotifications = (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }).then(r => ('data' in r.data ? r.data.data : r.data));

export const getUnreadCount = (): Promise<number> =>
    api.get('/notifications/count').then(r => r.data.data?.unread ?? r.data.data ?? 0);

export const markAsRead = (id: string) =>
    api.put(`/notifications/${id}/read`).then(r => r.data);

export const markAllRead = () =>
    api.put('/notifications/read-all').then(r => r.data);
