import { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await projectService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await projectService.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await projectService.create(req.body);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'CREATE', data.id, { name: data.name }, req.ip);
        success(res, data, 'Project created', 201);
    } catch (e) { next(e); }
};
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await projectService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Project updated');
    } catch (e) { next(e); }
};
export const updateStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await projectService.updateStage(req.params.id, req.body.stage);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'STATUS_CHANGE', data.id, { stage: data.stage }, req.ip);
        success(res, data, 'Project stage updated');
    } catch (e) { next(e); }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await projectService.remove(req.params.id);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Project deleted');
    } catch (e) { next(e); }
};
export const addPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await projectService.addPayment(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'CREATE', data.id, { amount: data.amount }, req.ip);
        success(res, data, 'Payment added', 201);
    } catch (e) { next(e); }
};
export const updatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await projectService.updatePayment(req.params.id, req.params.paymentId, req.body);
        logActivity(prisma, req.user?.id, 'PROJECTS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Payment updated');
    } catch (e) { next(e); }
};
export const stats = async (_req: Request, res: Response, next: NextFunction) => {
    try { success(res, await projectService.getStats()); } catch (e) { next(e); }
};
