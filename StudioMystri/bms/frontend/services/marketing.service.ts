import api from './api';

export interface MarketingParams {
    page?: number;
    limit?: number;
}

export const getCampaigns = (params?: MarketingParams) =>
    api.get('/marketing/campaigns', { params }).then(r => r.data);

export const createCampaign = (data: Record<string, unknown>) =>
    api.post('/marketing/campaigns', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateCampaign = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put(`/marketing/campaigns/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const getMarketingStats = () =>
    api.get('/marketing/stats').then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteCampaign = (id: string) =>
    api.delete(`/marketing/campaigns/${id}`).then(() => undefined);
