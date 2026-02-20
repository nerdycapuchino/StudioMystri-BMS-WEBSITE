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
        const data = await customerService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Customer updated');
    } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await customerService.softDelete(req.params.id);
        logActivity(prisma, req.user?.id, 'CUSTOMERS', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Customer deleted');
    } catch (e) { next(e); }
};
