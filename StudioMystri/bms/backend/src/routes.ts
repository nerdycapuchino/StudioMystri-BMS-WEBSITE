import { Router, Request, Response } from 'express';
import { verifyToken } from './middleware/auth';
import { enforceModuleRbac } from './middleware/rbac';

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
import { meetingRouter } from './modules/team/meeting.route';
import { marketingRouter } from './modules/marketing/marketing.route';
import { erpRouter } from './modules/erp/erp.route';
import { activityLogRouter } from './modules/activity-log/activityLog.route';
import { notificationsRouter } from './modules/notifications/notifications.route';
import { adminRouter } from './modules/admin/admin.route';
import * as adminController from './modules/admin/admin.controller';
import { searchRouter } from './modules/search/search.route';
import ecommerceRouter from './modules/ecommerce/ecommerce.route';
import paymentRouter from './modules/payments/payment.routes';

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
apiRouter.use('/payments', paymentRouter);
apiRouter.get('/admin/settings', adminController.getSettings);
apiRouter.use('/team/meetings', meetingRouter); // Meeting routes handle their own auth (public + protected)

// ─── Protected Routes (JWT required) ────────────────────
apiRouter.use('/dashboard', verifyToken, dashboardRouter);
apiRouter.use('/customers', verifyToken, enforceModuleRbac('crm'), customersRouter);
apiRouter.use('/leads', verifyToken, enforceModuleRbac('crm'), leadsRouter);
apiRouter.use('/products', verifyToken, enforceModuleRbac('ecommerce'), productsRouter);
apiRouter.use('/orders', verifyToken, enforceModuleRbac('ecommerce'), ordersRouter);
apiRouter.use('/invoices', verifyToken, enforceModuleRbac('finance'), invoicesRouter);
apiRouter.use('/finance', verifyToken, enforceModuleRbac('finance'), financeRouter);
apiRouter.use('/inventory', verifyToken, enforceModuleRbac('inventory'), inventoryRouter);
apiRouter.use('/projects', verifyToken, enforceModuleRbac('projects'), projectsRouter);
apiRouter.use('/hr', verifyToken, enforceModuleRbac('hr'), hrRouter);
apiRouter.use('/logistics', verifyToken, enforceModuleRbac('inventory'), logisticsRouter);
apiRouter.use('/tasks', verifyToken, enforceModuleRbac('projects'), tasksRouter);
apiRouter.use('/team', verifyToken, enforceModuleRbac('teamhub'), teamRouter);
apiRouter.use('/marketing', verifyToken, enforceModuleRbac('ecommerce'), marketingRouter);
apiRouter.use('/erp', verifyToken, enforceModuleRbac('projects'), erpRouter);
apiRouter.use('/activity-log', verifyToken, enforceModuleRbac('auth'), activityLogRouter);
apiRouter.use('/notifications', verifyToken, notificationsRouter);
apiRouter.use('/admin', verifyToken, enforceModuleRbac('auth'), adminRouter);
apiRouter.use('/search', verifyToken, searchRouter);
