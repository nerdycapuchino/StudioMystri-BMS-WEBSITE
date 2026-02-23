import api from './api';

export const getChannels = () =>
    api.get('/team/channels').then(r => ('data' in r.data ? r.data.data : r.data));

export const getMessages = (channel: string, params?: { page?: number; limit?: number }) =>
    api.get('/team/messages', { params: { channel, ...params } }).then(r => r.data);

export const sendMessage = (data: { content: string; channel: string }) =>
    api.post('/team/messages', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteMessage = (id: string) =>
    api.delete(`/team/messages/${id}`).then(() => undefined);

export const uploadFile = (formData: FormData) =>
    api.post('/team/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
