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
}

export const getCustomers = (params?: CustomerParams): Promise<PaginatedResponse<Customer>> =>
    api.get('/customers', { params }).then(r => r.data);

export const getCustomer = (id: string): Promise<Customer> =>
    api.get(`/customers/${id}`).then(r => r.data.data || r.data);

export const createCustomer = (data: Partial<Customer>): Promise<Customer> =>
    api.post('/customers', data).then(r => r.data.data || r.data);

export const updateCustomer = ({ id, data }: { id: string; data: Partial<Customer> }): Promise<Customer> =>
    api.patch(`/customers/${id}`, data).then(r => r.data.data || r.data);

export const deleteCustomer = (id: string): Promise<void> =>
    api.delete(`/customers/${id}`).then(() => undefined);
