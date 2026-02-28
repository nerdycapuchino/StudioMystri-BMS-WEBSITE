import api from './api';

export interface ERPParams {
    page?: number;
    limit?: number;
    supplierId?: string;
}

export const getERPSuppliers = () =>
    api.get('/erp/suppliers').then(r => ('data' in r.data ? r.data.data : r.data));

export const getPurchaseOrders = (params?: ERPParams) =>
    api.get('/erp/purchase-orders', { params }).then(r => r.data);

export const createPurchaseOrder = (data: Record<string, unknown>) =>
    api.post('/erp/purchase-orders', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const getERPStats = () =>
    api.get('/erp/stats').then(r => ('data' in r.data ? r.data.data : r.data));
