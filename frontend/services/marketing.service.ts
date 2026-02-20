import api from './api';

export interface MarketingParams {
    page?: number;
    limit?: number;
}

export const getCampaigns = (params?: MarketingParams) =>
    api.get('/marketing', { params }).then(r => r.data);

export const createCampaign = (data: Record<string, unknown>) =>
    api.post('/marketing', data).then(r => r.data.data || r.data);

export const updateCampaign = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.patch(`/marketing/${id}`, data).then(r => r.data.data || r.data);

export const getMarketingStats = () =>
    api.get('/marketing/stats').then(r => r.data.data || r.data);

export const deleteCampaign = (id: string) =>
    api.delete(`/marketing/${id}`).then(() => undefined);
