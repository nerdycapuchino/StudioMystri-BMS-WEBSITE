import { Request, Response, NextFunction } from 'express';
import * as financeService from './finance.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await financeService.listTransactions(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await financeService.getById(req.params.id)); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await financeService.create(req.body);
        logActivity(prisma, req.user?.id, 'FINANCE', 'CREATE', data.id, { type: data.type, amount: data.amount }, req.ip);
        success(res, data, 'Transaction created', 201);
    } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await financeService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'FINANCE', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Transaction updated');
    } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await financeService.remove(req.params.id);
        logActivity(prisma, req.user?.id, 'FINANCE', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Transaction deleted');
    } catch (e) { next(e); }
};

export const summary = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await financeService.getSummary((req.query.period as string) || 'thisMonth')); } catch (e) { next(e); }
};

export const cashflow = async (_req: Request, res: Response, next: NextFunction) => {
    try { success(res, await financeService.getCashflow()); } catch (e) { next(e); }
};
