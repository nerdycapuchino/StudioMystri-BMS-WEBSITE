import api from './api';

export const getChannels = () =>
    api.get('/team/channels').then(r => ('data' in r.data ? r.data.data : r.data));

export const getMembers = () =>
    api.get('/team/members').then(r => ('data' in r.data ? r.data.data : r.data));

export const getMessages = (channelId: string, params?: { page?: number; limit?: number }) =>
    api.get('/team/messages', { params: { channelId, ...params } }).then(r => r.data);

export const sendMessage = (data: { content: string; channelId: string; attachments?: string[] }) =>
    api.post('/team/messages', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const createChannel = (data: { name: string; type: 'public' | 'private' | 'dm'; participants: string[] }) =>
    api.post('/team/channels', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteMessage = (id: string) =>
    api.delete(`/team/messages/${id}`).then(() => undefined);

export const uploadFile = (formData: FormData) =>
    api.post('/team/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);

export const uploadFileWithProgress = (
    formData: FormData,
    onProgress?: (percent: number) => void
) =>
    api.post('/team/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
            if (!evt.total || !onProgress) return;
            onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
    }).then(r => r.data);

export const clearConversation = (channelId: string) =>
    api.delete(`/team/conversations/${channelId}`).then(r => r.data);

export const reportConversation = (data: { channelId: string; reason: string; details?: string }) =>
    api.post('/team/conversations/report', data).then(r => r.data);

// ── Meeting APIs ──

export const createMeeting = (data: {
    title?: string;
    isScheduled?: boolean;
    startsAt?: string;
    allowGuests?: boolean;
}) => api.post('/team/meetings', data).then(r => r.data?.data || r.data);

export const getMeeting = (meetingCode: string) =>
    api.get(`/team/meetings/${meetingCode}`).then(r => r.data?.data || r.data);

export const validateMeeting = (meetingCode: string) =>
    api.get(`/team/meetings/${meetingCode}/validate`).then(r => r.data?.data || r.data);

export const joinMeeting = (meetingCode: string, data?: { guestName?: string; guestEmail?: string }) =>
    api.post(`/team/meetings/${meetingCode}/join`, data || {}).then(r => r.data?.data || r.data);

export const startMeeting = (meetingCode: string) =>
    api.post(`/team/meetings/${meetingCode}/start`).then(r => r.data?.data || r.data);

export const endMeeting = (meetingCode: string) =>
    api.post(`/team/meetings/${meetingCode}/end`).then(r => r.data?.data || r.data);

export const lockMeeting = (meetingCode: string) =>
    api.post(`/team/meetings/${meetingCode}/lock`).then(r => r.data?.data || r.data);

export const admitParticipant = (meetingCode: string, participantId: string) =>
    api.post(`/team/meetings/${meetingCode}/admit`, { participantId }).then(r => r.data?.data || r.data);

export const rejectParticipant = (meetingCode: string, participantId: string) =>
    api.post(`/team/meetings/${meetingCode}/reject`, { participantId }).then(r => r.data?.data || r.data);

export const getWaitingList = (meetingCode: string) =>
    api.get(`/team/meetings/${meetingCode}/waiting`).then(r => r.data?.data || r.data);
