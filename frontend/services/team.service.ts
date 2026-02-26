import api from './api';

export const getChannels = () =>
    api.get('/team/channels').then(r => ('data' in r.data ? r.data.data : r.data));

export const getMembers = () =>
    api.get('/team/members').then(r => ('data' in r.data ? r.data.data : r.data));

export const getMessages = (channelId: string, params?: { page?: number; limit?: number }) =>
    api.get('/team/messages', { params: { channelId, ...params } }).then(r => r.data);

export const sendMessage = (data: { content: string; channelId: string }) =>
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
