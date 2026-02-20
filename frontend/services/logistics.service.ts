import api from './api';

export interface LogisticsParams {
    page?: number;
    limit?: number;
    status?: string;
}

export const getShipments = (params?: LogisticsParams) =>
    api.get('/logistics', { params }).then(r => r.data);

export const createShipment = (data: Record<string, unknown>) =>
    api.post('/logistics', data).then(r => r.data.data || r.data);

export const updateShipmentStatus = ({ id, status }: { id: string; status: string }) =>
    api.patch(`/logistics/${id}/status`, { status }).then(r => r.data.data || r.data);

export const deleteShipment = (id: string) =>
    api.delete(`/logistics/${id}`).then(() => undefined);
