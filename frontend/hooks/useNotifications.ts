import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '../services/notifications.service';
import { useAuth } from '../context/AuthContext';

export const useNotifications = (params?: { page?: number; limit?: number }) => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => getNotifications(params),
        enabled: isAuthenticated
    });
};

export const useUnreadCount = () => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: getUnreadCount,
        enabled: isAuthenticated,
    });
};

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
