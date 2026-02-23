import api from './api';

export const getNotifications = (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }).then(r => ('data' in r.data ? r.data.data : r.data));

export const getUnreadCount = (): Promise<number> =>
    api.get('/notifications/unread-count').then(r => r.data.data?.count ?? r.data.data ?? 0);

export const markAsRead = (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data);

export const markAllRead = () =>
    api.patch('/notifications/read-all').then(r => r.data);
