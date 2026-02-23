import { Request, Response, NextFunction } from 'express';
import * as svc from './admin.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';
import { io } from '../../app';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await svc.listUsers(req.query as Record<string, string>)); } catch (e) { next(e); } };
export const getUser = async (req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getUserById(req.params.id)); } catch (e) { next(e); } };
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const d = await svc.createUser(req.body);
        logActivity(prisma, req.user?.id, 'ADMIN', 'CREATE', d.id, { name: d.name, email: d.email }, req.ip);
        success(res, d, 'User created', 201);
    } catch (e) { next(e); }
};
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const d = await svc.updateUser(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'ADMIN', 'UPDATE', d.id, req.body, req.ip);
        success(res, d, 'User updated');
    } catch (e) { next(e); }
};
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await svc.deactivateUser(req.params.id, req.user!.id);
        logActivity(prisma, req.user?.id, 'ADMIN', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'User deactivated');
    } catch (e) { next(e); }
};
export const getSettings = async (_req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getSettings()); } catch (e) { next(e); } };
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const d = await svc.updateSettings(req.body);
        logActivity(prisma, req.user?.id, 'ADMIN', 'UPDATE', d.id, req.body, req.ip);

        // Real-time: broadcast settings change to all clients
        try { io.emit('settings:updated', d); } catch { /* fire-and-forget */ }

        success(res, d, 'Settings updated');
    } catch (e) { next(e); }
};
export const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        const d = await svc.updateLogo(`/uploads/${req.file.filename}`);

        // Real-time: broadcast logo update
        try { io.emit('settings:updated', d); } catch { /* fire-and-forget */ }

        success(res, d, 'Logo uploaded');
    } catch (e) { next(e); }
};
