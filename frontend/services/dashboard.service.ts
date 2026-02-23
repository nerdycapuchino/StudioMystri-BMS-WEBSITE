import api from './api';

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    activeProjects: number;
    pipelineLeads: number;
    lowStockCount: number;
    pendingInvoices: number;
    pendingInvoiceAmount: number;
    salesToday: number;
}

export const getDashboardStats = (): Promise<DashboardStats> =>
    api.get('/dashboard/stats').then(r => ('data' in r.data ? r.data.data : r.data));

export const getRevenueChart = (period: '7d' | '30d' | '90d' | '12m' = '7d') =>
    api.get(`/dashboard/revenue-chart?period=${period}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const getRecentActivity = () =>
    api.get('/dashboard/recent-activity').then(r => ('data' in r.data ? r.data.data : r.data));

export const getTopProducts = () =>
    api.get('/dashboard/top-products').then(r => ('data' in r.data ? r.data.data : r.data));
