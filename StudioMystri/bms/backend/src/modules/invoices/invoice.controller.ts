import { Request, Response, NextFunction } from 'express';
import * as invoiceService from './invoice.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await invoiceService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await invoiceService.getById(req.params.id)); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await invoiceService.create(req.body);
        logActivity(prisma, req.user?.id, 'INVOICES', 'CREATE', data.id, { invoiceNumber: data.invoiceNumber }, req.ip);
        success(res, data, 'Invoice created', 201);
    } catch (e) { next(e); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await invoiceService.updateStatus(req.params.id, req.body.status);
        logActivity(prisma, req.user?.id, 'INVOICES', 'STATUS_CHANGE', data.id, { status: req.body.status }, req.ip);
        success(res, data, 'Invoice status updated');
    } catch (e) { next(e); }
};

export const getPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invoice = await invoiceService.getById(req.params.id);
        // PDF generation placeholder — requires puppeteer (install separately)
        // For now, return the invoice data as JSON with a note
        success(res, invoice, 'PDF generation requires puppeteer setup. Invoice data returned.');
    } catch (e) { next(e); }
};
