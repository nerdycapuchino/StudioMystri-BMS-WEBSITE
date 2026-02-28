import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { requireRole } from '../../middleware/auth';

export const activityLogRouter = Router();

// Admin only
activityLogRouter.use(requireRole('ADMIN'));

activityLogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { skip, take, page, limit } = paginate(req.query as Record<string, string>);
        const query = req.query as Record<string, string>;

        const where: Record<string, unknown> = {};
        if (query.userId) where.userId = query.userId;
        if (query.module) where.module = query.module;
        if (query.dateFrom || query.dateTo) {
            where.createdAt = {
                ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
                ...(query.dateTo && { lte: new Date(query.dateTo) }),
            };
        }

        const [data, total] = await Promise.all([
            prisma.activityLog.findMany({
                where, skip, take, orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, name: true } } },
            }),
            prisma.activityLog.count({ where }),
        ]);

        res.json(paginatedResponse(data, total, page, limit));
    } catch (e) { next(e); }
});
