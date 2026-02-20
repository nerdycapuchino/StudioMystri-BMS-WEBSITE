import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { success } from '../../utils/apiResponse';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = (req.query.q as string) || '';
        if (!q || q.length < 2) {
            return success(res, { customers: [], products: [], orders: [], invoices: [], projects: [], leads: [], employees: [] }, 'Search query too short');
        }

        const filter = { contains: q, mode: 'insensitive' as const };

        const [customers, products, orders, invoices, projects, leads, employees] = await Promise.all([
            prisma.customer.findMany({ where: { OR: [{ name: filter }, { email: filter }, { phone: filter }] }, take: 5, select: { id: true, name: true, email: true } }),
            prisma.product.findMany({ where: { OR: [{ name: filter }, { sku: filter }, { barcode: filter }] }, take: 5, select: { id: true, name: true, sku: true } }),
            prisma.order.findMany({ where: { orderNumber: filter }, take: 5, select: { id: true, orderNumber: true, total: true, status: true } }),
            prisma.invoice.findMany({ where: { invoiceNumber: filter }, take: 5, select: { id: true, invoiceNumber: true, total: true, status: true } }),
            prisma.project.findMany({ where: { OR: [{ name: filter }, { description: filter }] }, take: 5, select: { id: true, name: true, stage: true } }),
            prisma.lead.findMany({ where: { OR: [{ companyName: filter }, { pocName: filter }, { email: filter }] }, take: 5, select: { id: true, companyName: true, pocName: true, stage: true } }),
            prisma.employee.findMany({ where: { OR: [{ name: filter }, { email: filter }] }, take: 5, select: { id: true, name: true, department: true } }),
        ]);

        success(res, { customers, products, orders, invoices, projects, leads, employees });
    } catch (e) { next(e); }
});
