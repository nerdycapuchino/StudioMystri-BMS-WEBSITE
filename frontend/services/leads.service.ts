import api from './api';
import type { Lead } from '../types';

export interface LeadParams {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
}

export const getLeads = (params?: LeadParams) =>
    api.get('/leads', { params }).then(r => r.data);

export const getLeadsPipeline = () =>
    api.get('/leads/pipeline').then(r => ('data' in r.data ? r.data.data : r.data));

export const createLead = (data: Partial<Lead>) =>
    api.post('/leads', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateLead = ({ id, data }: { id: string; data: Partial<Lead> }) =>
    api.patch(`/leads/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateLeadStage = ({ id, stage }: { id: string; stage: string }) =>
    api.patch(`/leads/${id}/stage`, { stage }).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteLead = (id: string) =>
    api.delete(`/leads/${id}`).then(() => undefined);
