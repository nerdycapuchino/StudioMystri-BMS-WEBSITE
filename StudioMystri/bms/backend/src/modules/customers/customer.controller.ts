import { Request, Response, NextFunction } from 'express';
import * as customerService from './customer.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await customerService.list(req.query as Record<string, string>);
        res.json(result);
    } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.getById(req.params.id);
        success(res, data, 'Customer retrieved');
    } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.create(req.body);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'CREATE', data.id, { name: data.name }, req.ip);
        success(res, data, 'Customer created', 201);
    } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.update(req.params.id, req.body, req.user?.role);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Customer updated');
    } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.user?.role;
        if (role === 'SALES' || role === 'FINANCE') {
            return res.status(403).json({ success: false, status: 403, message: `Role ${role} cannot delete clients` });
        }
        await customerService.softDelete(req.params.id, req.user?.id);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'DELETE', req.params.id, {}, req.ip);
        const io = req.app.get('io');
        if (io) io.emit('client.deleted', { clientId: req.params.id });
        success(res, null, 'Customer deleted');
    } catch (e) { next(e); }
};

export const checkDuplicates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const duplicates = await customerService.checkDuplicates(req.body);
        success(res, duplicates, 'Duplicate check complete');
    } catch (e) { next(e); }
};

export const merge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.user?.role;
        if (role === 'SALES' || role === 'FINANCE') {
            return res.status(403).json({ success: false, status: 403, message: `Role ${role} cannot merge clients` });
        }
        const { mergedClientId } = req.body;
        if (!mergedClientId) return next(new Error('mergedClientId is required'));
        const result = await customerService.mergeClients(req.params.id, mergedClientId, req.user!.id);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'MERGE', req.params.id, { mergedClientId }, req.ip);
        const io = req.app.get('io');
        if (io) io.emit('client.merged', { primaryId: req.params.id, mergedId: mergedClientId });
        success(res, result, 'Clients merged successfully');
    } catch (e) { next(e); }
};

export const stats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.getStats();
        success(res, data, 'Stats retrieved');
    } catch (e) { next(e); }
};

export const channelHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.getChannelHistory(req.params.id);
        success(res, data, 'Channel history retrieved');
    } catch (e) { next(e); }
};

export const financials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.getFinancials(req.params.id);
        success(res, data, 'Financials retrieved');
    } catch (e) { next(e); }
};
