import api from './api';
import type { Customer } from '../types';

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface CustomerParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tier?: string;
    primarySource?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface CustomerStats {
    totalClients: number;
    activeClients: number;
    totalLTV: number;
    totalOutstanding: number;
}

export interface DuplicateMatch {
    customer: Customer;
    confidence: number;
    matchField: string;
}

export const getCustomers = (params?: CustomerParams): Promise<PaginatedResponse<Customer>> =>
    api.get('/customers', { params }).then(r => r.data);

export const getCustomer = (id: string): Promise<Customer> =>
    api.get(`/customers/${id}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const createCustomer = (data: Partial<Customer>): Promise<Customer> =>
    api.post('/customers', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateCustomer = ({ id, data }: { id: string; data: Partial<Customer> }): Promise<Customer> =>
    api.put(`/customers/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteCustomer = (id: string): Promise<void> =>
    api.delete(`/customers/${id}`).then(() => undefined);

export const getStats = (): Promise<CustomerStats> =>
    api.get('/customers/stats').then(r => ('data' in r.data ? r.data.data : r.data));

export const checkDuplicates = (data: { email?: string; phone?: string; gstNumber?: string; name?: string }): Promise<DuplicateMatch[]> =>
    api.post('/customers/check-duplicates', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const mergeClients = (primaryId: string, mergedClientId: string): Promise<Customer> =>
    api.post(`/customers/${primaryId}/merge`, { mergedClientId }).then(r => ('data' in r.data ? r.data.data : r.data));

export const getChannelHistory = (clientId: string) =>
    api.get(`/customers/${clientId}/channel-history`).then(r => ('data' in r.data ? r.data.data : r.data));

export const getFinancials = (clientId: string) =>
    api.get(`/customers/${clientId}/financials`).then(r => ('data' in r.data ? r.data.data : r.data));
