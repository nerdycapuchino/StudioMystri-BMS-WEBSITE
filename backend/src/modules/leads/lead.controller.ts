import { Request, Response, NextFunction } from 'express';
import * as leadService from './lead.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await leadService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await leadService.getById(req.params.id), 'Lead retrieved'); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await leadService.create(req.body);
        logActivity(prisma, req.user?.id, 'LEADS', 'CREATE', data.id, { companyName: data.companyName }, req.ip);
        success(res, data, 'Lead created', 201);
    } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await leadService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'LEADS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Lead updated');
    } catch (e) { next(e); }
};

export const updateStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await leadService.updateStage(req.params.id, req.body.stage);
        logActivity(prisma, req.user?.id, 'LEADS', 'STATUS_CHANGE', data.id, { stage: data.stage }, req.ip);
        success(res, data, 'Lead stage updated');
    } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await leadService.remove(req.params.id);
        logActivity(prisma, req.user?.id, 'LEADS', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Lead deleted');
    } catch (e) { next(e); }
};

export const pipeline = async (_req: Request, res: Response, next: NextFunction) => {
    try { success(res, await leadService.getPipeline(), 'Pipeline retrieved'); } catch (e) { next(e); }
};

export const convertToProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const project = await leadService.convertToProject(req.params.id);
        logActivity(prisma, req.user?.id, 'LEADS', 'CONVERT_TO_PROJECT', req.params.id, { projectId: project.id }, req.ip);
        success(res, project, 'Lead converted to project', 201);
    } catch (e) { next(e); }
};
