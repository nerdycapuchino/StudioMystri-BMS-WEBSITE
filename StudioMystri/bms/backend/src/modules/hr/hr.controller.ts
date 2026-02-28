import { Request, Response, NextFunction } from 'express';
import * as hrService from './hr.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';
import { upload } from '../../middleware/upload';

export const listEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await hrService.listEmployees(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await hrService.getEmployeeById(req.params.id)); } catch (e) { next(e); }
};
export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await hrService.createEmployee(req.body);
        logActivity(prisma, req.user?.id, 'HR', 'CREATE', data.id, { name: data.name }, req.ip);
        success(res, data, 'Employee created', 201);
    } catch (e) { next(e); }
};
export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await hrService.updateEmployee(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'HR', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Employee updated');
    } catch (e) { next(e); }
};
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await hrService.softDeleteEmployee(req.params.id);
        logActivity(prisma, req.user?.id, 'HR', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Employee deactivated');
    } catch (e) { next(e); }
};
export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await hrService.markAttendance(req.body);
        logActivity(prisma, req.user?.id, 'HR', 'CREATE', data.id, { status: data.status }, req.ip);
        success(res, data, 'Attendance marked', 201);
    } catch (e) { next(e); }
};
export const listAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await hrService.listAttendance(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const summary = async (_req: Request, res: Response, next: NextFunction) => {
    try { success(res, await hrService.getSummary()); } catch (e) { next(e); }
};
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        const emp = await hrService.getEmployeeById(req.params.id);
        const docUrl = `/uploads/${req.file.filename}`;
        const updated = await prisma.employee.update({
            where: { id: req.params.id },
            data: { documents: [...emp.documents, docUrl] },
        });
        success(res, updated, 'Document uploaded');
    } catch (e) { next(e); }
};
