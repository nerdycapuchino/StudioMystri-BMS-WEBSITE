import api from './api';
import type { CompanySettings } from '../types';

export const getUsers = (params?: { page?: number; limit?: number }) =>
    api.get('/admin/users', { params }).then(r => ('data' in r.data ? r.data.data : r.data));

export const createUser = (data: Record<string, unknown>) =>
    api.post('/admin/users', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateUser = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put(`/admin/users/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deactivateUser = (id: string) =>
    api.delete(`/admin/users/${id}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const getCompanySettings = (): Promise<CompanySettings> =>
    api.get('/admin/settings').then(r => ('data' in r.data ? r.data.data : r.data));

export const updateCompanySettings = (data: Partial<CompanySettings>) =>
    api.put('/admin/settings', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const uploadCompanyLogo = (file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return api.post('/admin/settings/logo', fd).then(r => ('data' in r.data ? r.data.data : r.data));
};
