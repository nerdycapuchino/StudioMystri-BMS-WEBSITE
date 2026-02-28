import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';
import { success } from '../../utils/apiResponse';

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getStats();
        success(res, data, 'Dashboard stats retrieved');
    } catch (e) { next(e); }
};

export const getRevenueChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const period = (req.query.period as string) || '30d';
        const data = await dashboardService.getRevenueChart(period);
        success(res, data, 'Revenue chart data retrieved');
    } catch (e) { next(e); }
};

export const getRecentActivity = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getRecentActivity();
        success(res, data, 'Recent activity retrieved');
    } catch (e) { next(e); }
};

export const getTopProducts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getTopProducts();
        success(res, data, 'Top products retrieved');
    } catch (e) { next(e); }
};
