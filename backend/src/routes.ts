import { Router, Request, Response } from 'express';
import { verifyToken } from './middleware/auth';

// Module routers
import { authRouter } from './modules/auth/auth.route';
import { dashboardRouter } from './modules/dashboard/dashboard.route';
import { customersRouter } from './modules/customers/customer.route';
import { leadsRouter } from './modules/leads/lead.route';
import { productsRouter } from './modules/products/product.route';
import { ordersRouter } from './modules/orders/order.route';
import { invoicesRouter } from './modules/invoices/invoice.route';
import { financeRouter } from './modules/finance/finance.route';
import { inventoryRouter } from './modules/inventory/inventory.route';
import { projectsRouter } from './modules/projects/project.route';
import { hrRouter } from './modules/hr/hr.route';
import { logisticsRouter } from './modules/logistics/logistics.route';
import { tasksRouter } from './modules/tasks/task.route';
import { teamRouter } from './modules/team/team.route';
import { marketingRouter } from './modules/marketing/marketing.route';
import { erpRouter } from './modules/erp/erp.route';
import { activityLogRouter } from './modules/activity-log/activityLog.route';
import { notificationsRouter } from './modules/notifications/notifications.route';
import { adminRouter } from './modules/admin/admin.route';
import { searchRouter } from './modules/search/search.route';
import ecommerceRouter from './modules/ecommerce/ecommerce.route';

export const apiRouter = Router();

// ─── Health Check ───────────────────────────────────────
apiRouter.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Studio Mystri BMS API is running',
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

// ─── Public Routes ──────────────────────────────────────
apiRouter.use('/auth', authRouter);
apiRouter.use('/ecommerce', ecommerceRouter);

// ─── Protected Routes (JWT required) ────────────────────
apiRouter.use('/dashboard', verifyToken, dashboardRouter);
apiRouter.use('/customers', verifyToken, customersRouter);
apiRouter.use('/leads', verifyToken, leadsRouter);
apiRouter.use('/products', verifyToken, productsRouter);
apiRouter.use('/orders', verifyToken, ordersRouter);
apiRouter.use('/invoices', verifyToken, invoicesRouter);
apiRouter.use('/finance', verifyToken, financeRouter);
apiRouter.use('/inventory', verifyToken, inventoryRouter);
apiRouter.use('/projects', verifyToken, projectsRouter);
apiRouter.use('/hr', verifyToken, hrRouter);
apiRouter.use('/logistics', verifyToken, logisticsRouter);
apiRouter.use('/tasks', verifyToken, tasksRouter);
apiRouter.use('/team', verifyToken, teamRouter);
apiRouter.use('/marketing', verifyToken, marketingRouter);
apiRouter.use('/erp', verifyToken, erpRouter);
apiRouter.use('/activity-log', verifyToken, activityLogRouter);
apiRouter.use('/notifications', verifyToken, notificationsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/search', verifyToken, searchRouter);
