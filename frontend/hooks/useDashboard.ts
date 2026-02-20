import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRevenueChart, getRecentActivity, getTopProducts } from '../services/dashboard.service';

export const useDashboardStats = () =>
    useQuery({ queryKey: ['dashboard', 'stats'], queryFn: getDashboardStats });

export const useRevenueChart = (period: '7d' | '30d' | '90d' | '12m' = '7d') =>
    useQuery({ queryKey: ['dashboard', 'chart', period], queryFn: () => getRevenueChart(period) });

export const useRecentActivity = () =>
    useQuery({ queryKey: ['dashboard', 'activity'], queryFn: getRecentActivity });

export const useTopProducts = () =>
    useQuery({ queryKey: ['dashboard', 'top-products'], queryFn: getTopProducts });
