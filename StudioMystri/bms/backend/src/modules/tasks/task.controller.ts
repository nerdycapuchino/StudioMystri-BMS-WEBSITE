import { Request, Response, NextFunction } from 'express';
import * as svc from './task.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await svc.list(req.query as Record<string, string>)); } catch (e) { next(e); } };
export const getById = async (req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.create(req.body); logActivity(prisma, req.user?.id, 'TASKS', 'CREATE', d.id, { title: d.title }, req.ip); success(res, d, 'Task created', 201); } catch (e) { next(e); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.update(req.params.id, req.body); logActivity(prisma, req.user?.id, 'TASKS', 'UPDATE', d.id, req.body, req.ip); success(res, d, 'Task updated'); } catch (e) { next(e); } };
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => { try { const d = await svc.updateStatus(req.params.id, req.body.status); logActivity(prisma, req.user?.id, 'TASKS', 'STATUS_CHANGE', d.id, { status: d.status }, req.ip); success(res, d, 'Task status updated'); } catch (e) { next(e); } };
export const remove = async (req: Request, res: Response, next: NextFunction) => { try { await svc.remove(req.params.id); logActivity(prisma, req.user?.id, 'TASKS', 'DELETE', req.params.id, {}, req.ip); success(res, null, 'Task deleted'); } catch (e) { next(e); } };
export const myTasks = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await svc.myTasks(req.user!.id, req.query as Record<string, string>)); } catch (e) { next(e); } };
