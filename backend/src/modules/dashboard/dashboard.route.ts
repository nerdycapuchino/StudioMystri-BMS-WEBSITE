import { Router } from 'express';
import * as ctrl from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', ctrl.getStats);
dashboardRouter.get('/revenue-chart', ctrl.getRevenueChart);
dashboardRouter.get('/recent-activity', ctrl.getRecentActivity);
dashboardRouter.get('/top-products', ctrl.getTopProducts);
