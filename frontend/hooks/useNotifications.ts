import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '../services/notifications.service';

export const useNotifications = (params?: { page?: number; limit?: number }) =>
    useQuery({ queryKey: ['notifications', params], queryFn: () => getNotifications(params) });

export const useUnreadCount = () =>
    useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: getUnreadCount,
    });

export const useMarkNotificationRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markAllRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
