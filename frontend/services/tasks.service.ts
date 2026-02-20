import api from './api';

export interface TaskParams {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
}

export const getTasks = (params?: TaskParams) =>
    api.get('/tasks', { params }).then(r => r.data);

export const getMyTasks = () =>
    api.get('/tasks/my').then(r => r.data.data || r.data);

export const createTask = (data: Record<string, unknown>) =>
    api.post('/tasks', data).then(r => r.data.data || r.data);

export const updateTask = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.patch(`/tasks/${id}`, data).then(r => r.data.data || r.data);

export const deleteTask = (id: string) =>
    api.delete(`/tasks/${id}`).then(() => undefined);
