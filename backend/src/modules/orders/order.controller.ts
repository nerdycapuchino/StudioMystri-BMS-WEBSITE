import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';
import { io } from '../../app';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await orderService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await orderService.getById(req.params.id)); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await orderService.create(req.body);
        logActivity(prisma, req.user?.id, 'ORDERS', 'CREATE', data.id, { orderNumber: data.orderNumber, totalAmount: data.totalAmount }, req.ip);

        // Real-time: broadcast order creation and inventory impact
        try {
            io.emit('order:created', { id: data.id, orderNumber: data.orderNumber, customerId: (data as any).customerId, totalAmount: data.totalAmount, orderStatus: data.orderStatus, createdAt: data.createdAt });
            const items = (data as any).items || req.body.items || [];
            if (items.length) {
                io.emit('inventory:updated', items.map((i: any) => ({ productId: i.productId, variantId: i.variantId })));
            }
        } catch { /* fire-and-forget */ }

        success(res, data, 'Order created', 201);
    } catch (e) { next(e); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await orderService.updateStatus(req.params.id, req.body.status);
        logActivity(prisma, req.user?.id, 'ORDERS', 'STATUS_CHANGE', data.id, { status: req.body.status }, req.ip);

        // Real-time: broadcast order status change
        try { io.emit('order:updated', { id: data.id, orderStatus: data.orderStatus }); } catch { /* fire-and-forget */ }

        success(res, data, 'Order status updated');
    } catch (e) { next(e); }
};
