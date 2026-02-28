import api from './api';

export interface InventoryParams {
    page?: number;
    limit?: number;
    type?: string;
    lowStock?: boolean;
    search?: string;
}

export const getInventory = (params?: InventoryParams) =>
    api.get('/inventory', { params }).then(r => r.data);

export const createInventoryItem = (data: Record<string, unknown>) =>
    api.post('/inventory', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateInventoryItem = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put(`/inventory/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteInventoryItem = (id: string) =>
    api.delete(`/inventory/${id}`).then(() => undefined);

export const recordStockTransaction = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.post(`/inventory/${id}/transaction`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const getStockTransactions = (params?: { itemId?: string }) =>
    api.get('/inventory/transactions', { params }).then(r => ('data' in r.data ? r.data.data : r.data));

export const getSuppliers = (params?: { search?: string }) =>
    api.get('/inventory/suppliers', { params }).then(r => ('data' in r.data ? r.data.data : r.data));

export const createSupplier = (data: Record<string, unknown>) =>
    api.post('/inventory/suppliers', data).then(r => ('data' in r.data ? r.data.data : r.data));
