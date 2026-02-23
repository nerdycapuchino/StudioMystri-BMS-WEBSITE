import api from './api';

export interface OrderParams {
    page?: number;
    limit?: number;
    status?: string;
}

export const getOrders = (params?: OrderParams) =>
    api.get('/orders', { params }).then(r => r.data);

export const createOrder = (data: Record<string, unknown>) =>
    api.post('/orders', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateOrderStatus = ({ id, status }: { id: string; status: string }) =>
    api.patch(`/orders/${id}/cancel`, { status }).then(r => ('data' in r.data ? r.data.data : r.data));
