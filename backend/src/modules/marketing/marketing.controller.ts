import { Request, Response, NextFunction } from 'express';
import * as svc from './marketing.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await svc.list(req.query as Record<string, string>)); } catch (e) { next(e); } };
export const getById = async (req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.create(req.body); logActivity(prisma, req.user?.id, 'MARKETING', 'CREATE', d.id, { name: d.name }, req.ip); success(res, d, 'Campaign created', 201); } catch (e) { next(e); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.update(req.params.id, req.body); logActivity(prisma, req.user?.id, 'MARKETING', 'UPDATE', d.id, req.body, req.ip); success(res, d, 'Campaign updated'); } catch (e) { next(e); } };
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.updateStatus(req.params.id, req.body.status); logActivity(prisma, req.user?.id, 'MARKETING', 'STATUS_CHANGE', d.id, { status: d.status }, req.ip); success(res, d, 'Campaign status updated'); } catch (e) { next(e); } };
export const remove = async (req: Request, res: Response, next: NextFunction) => { try { await svc.remove(req.params.id); logActivity(prisma, req.user?.id, 'MARKETING', 'DELETE', req.params.id, {}, req.ip); success(res, null, 'Campaign deleted'); } catch (e) { next(e); } };
export const stats = async (_req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getStats()); } catch (e) { next(e); } };
