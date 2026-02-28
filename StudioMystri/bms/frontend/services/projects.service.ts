import api from './api';

export interface ProjectParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const getProjects = (params?: ProjectParams) =>
    api.get('/projects', { params }).then(r => r.data);

export const getProject = (id: string) =>
    api.get(`/projects/${id}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const createProject = (data: Record<string, unknown>) =>
    api.post('/projects', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateProject = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.patch(`/projects/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateProjectStage = ({ id, stage, progress }: { id: string; stage: string; progress?: number }) =>
    api.patch(`/projects/${id}/stage`, { stage, progress }).then(r => ('data' in r.data ? r.data.data : r.data));

export const addProjectPayment = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.post(`/projects/${id}/payments`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const getProjectPayments = (id: string) =>
    api.get(`/projects/${id}/payments`).then(r => ('data' in r.data ? r.data.data : r.data));

export const getProjectStats = () =>
    api.get('/projects/stats').then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteProject = (id: string) =>
    api.delete(`/projects/${id}`).then(() => undefined);
