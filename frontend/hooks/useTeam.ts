import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getChannels, getMessages, sendMessage, deleteMessage } from '../services/team.service';

export const useChannels = () =>
    useQuery({ queryKey: ['team', 'channels'], queryFn: getChannels });

export const useMessages = (channel: string | null, params?: { page?: number; limit?: number }) =>
    useQuery({
        queryKey: ['team', 'messages', channel, params],
        queryFn: () => getMessages(channel!, params),
        enabled: !!channel,
        refetchInterval: 5000,
    });

export const useSendMessage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: sendMessage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['team', 'messages'] }); },
        onError: () => toast.error('Failed to send message'),
    });
};

export const useDeleteMessage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteMessage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['team', 'messages'] }); },
    });
};
