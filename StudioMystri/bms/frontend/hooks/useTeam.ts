import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    getChannels, getMessages, sendMessage, deleteMessage,
    createChannel, getMembers,
    createMeeting, getMeeting, joinMeeting, endMeeting,
} from '../services/team.service';

export const useChannels = () =>
    useQuery({ queryKey: ['team', 'channels'], queryFn: getChannels });

export const useMembers = () =>
    useQuery({ queryKey: ['team', 'members'], queryFn: getMembers });

export const useMessages = (channelId: string | null, params?: { page?: number; limit?: number }) =>
    useQuery({
        queryKey: ['team', 'messages', channelId, params],
        queryFn: () => getMessages(channelId!, params),
        enabled: !!channelId,
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

export const useCreateChannel = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createChannel,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['team', 'channels'] });
            toast.success('Channel created successfully');
        },
        onError: () => toast.error('Failed to create channel'),
    });
};

export const useDeleteMessage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteMessage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['team', 'messages'] }); },
    });
};

// ── Meeting Hooks ──

export const useCreateMeeting = () => {
    return useMutation({
        mutationFn: createMeeting,
        onSuccess: () => toast.success('Meeting created'),
        onError: () => toast.error('Failed to create meeting'),
    });
};

export const useGetMeeting = (meetingCode: string | null) =>
    useQuery({
        queryKey: ['meeting', meetingCode],
        queryFn: () => getMeeting(meetingCode!),
        enabled: !!meetingCode,
    });

export const useJoinMeeting = () => {
    return useMutation({
        mutationFn: ({ meetingCode, data }: { meetingCode: string; data?: { guestName?: string; guestEmail?: string } }) =>
            joinMeeting(meetingCode, data),
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to join meeting'),
    });
};

export const useEndMeeting = () => {
    return useMutation({
        mutationFn: endMeeting,
        onSuccess: () => toast.success('Meeting ended'),
        onError: () => toast.error('Failed to end meeting'),
    });
};
