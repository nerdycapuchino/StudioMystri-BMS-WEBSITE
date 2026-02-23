import { validateQuery } from '../../middleware/validateQuery';
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { success } from '../../utils/apiResponse';

export const notificationsRouter = Router();

// GET /api/v1/notifications — list for current user
notificationsRouter.get('/', validateQuery, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { skip, take, page, limit } = paginate(req.query as Record<string, string>);
        const where: Record<string, unknown> = { userId: req.user!.id };
        const query = req.query as Record<string, string>;
        if (query.isRead === 'true') where.isRead = true;
        if (query.isRead === 'false') where.isRead = false;

        const [data, total] = await Promise.all([
            prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
            prisma.notification.count({ where }),
        ]);
        res.json(paginatedResponse(data, total, page, limit));
    } catch (e) { next(e); }
});

// GET /api/v1/notifications/count — unread count
notificationsRouter.get('/count', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const unread = await prisma.notification.count({ where: { userId: req.user!.id, isRead: false } });
        success(res, { unread });
    } catch (e) { next(e); }
});

// PUT /api/v1/notifications/read-all
notificationsRouter.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
        success(res, null, 'All notifications marked as read');
    } catch (e) { next(e); }
});

// PUT /api/v1/notifications/:id/read
notificationsRouter.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
        success(res, null, 'Notification marked as read');
    } catch (e) { next(e); }
});

// DELETE /api/v1/notifications/:id
notificationsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
        if (n && n.userId === req.user!.id) {
            await prisma.notification.delete({ where: { id: req.params.id } });
        }
        success(res, null, 'Notification deleted');
    } catch (e) { next(e); }
});
