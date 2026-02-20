import { Request, Response, NextFunction } from 'express';
import * as svc from './logistics.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await svc.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await svc.create(req.body);
        logActivity(prisma, req.user?.id, 'LOGISTICS', 'CREATE', data.id, {}, req.ip);
        success(res, data, 'Shipment created', 201);
    } catch (e) { next(e); }
};
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await svc.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'LOGISTICS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Shipment updated');
    } catch (e) { next(e); }
};
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await svc.updateStatus(req.params.id, req.body.status);
        logActivity(prisma, req.user?.id, 'LOGISTICS', 'STATUS_CHANGE', data.id, { status: data.status }, req.ip);
        success(res, data, 'Shipment status updated');
    } catch (e) { next(e); }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await svc.remove(req.params.id);
        logActivity(prisma, req.user?.id, 'LOGISTICS', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Shipment deleted');
    } catch (e) { next(e); }
};
