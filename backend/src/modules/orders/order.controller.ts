import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await orderService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await orderService.getById(req.params.id)); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await orderService.create(req.body);
        logActivity(prisma, req.user?.id, 'ORDERS', 'CREATE', data.id, { orderNumber: data.orderNumber, total: data.total }, req.ip);
        success(res, data, 'Order created', 201);
    } catch (e) { next(e); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await orderService.updateStatus(req.params.id, req.body.status);
        logActivity(prisma, req.user?.id, 'ORDERS', 'STATUS_CHANGE', data.id, { status: req.body.status }, req.ip);
        success(res, data, 'Order status updated');
    } catch (e) { next(e); }
};
