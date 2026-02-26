import { Request, Response, NextFunction } from 'express';
import * as svc from './team.service';
import { success } from '../../utils/apiResponse';
import { upload } from '../../middleware/upload';
import { createError } from '../../middleware/errorHandler';

export const channels = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await svc.getChannels(req.user!.id, req.user!.role)); } catch (e) { next(e); }
};
export const members = async (_req: Request, res: Response, next: NextFunction) => {
    try { success(res, await svc.getMembers()); } catch (e) { next(e); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await svc.createChannel(req.body), 'Channel created', 201); } catch (e) { next(e); }
};
export const messages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const channelId = req.query.channelId as string | undefined;
        if (!channelId) throw createError(400, 'channelId is required');
        res.json(await svc.listMessages(channelId, req.user!.id, req.user!.role, req.query as Record<string, string>));
    } catch (e) { next(e); }
};
export const send = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await svc.sendMessage(req.user!.id, req.body), 'Message sent', 201); } catch (e) { next(e); }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await svc.deleteMessage(req.params.id, req.user!.id, req.user!.role); success(res, null, 'Message deleted'); } catch (e) { next(e); }
};
export const uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        success(res, { url: `/uploads/${req.file.filename}` }, 'Attachment uploaded');
    } catch (e) { next(e); }
};
