import api from './api';

export interface FinanceParams {
    page?: number;
    limit?: number;
    type?: string;
}

export const getTransactions = (params?: FinanceParams) =>
    api.get('/finance', { params }).then(r => r.data);

export const createTransaction = (data: Record<string, unknown>) =>
    api.post('/finance', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateTransaction = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.patch(`/finance/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteTransaction = (id: string) =>
    api.delete(`/finance/${id}`).then(() => undefined);

export const getFinanceSummary = (period?: string) =>
    api.get('/finance/summary', { params: { period } }).then(r => ('data' in r.data ? r.data.data : r.data));

export const getCashflow = () =>
    api.get('/finance/cashflow').then(r => ('data' in r.data ? r.data.data : r.data));
