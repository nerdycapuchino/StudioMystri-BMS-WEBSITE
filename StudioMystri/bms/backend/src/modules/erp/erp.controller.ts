import { Request, Response, NextFunction } from 'express';
import * as svc from './erp.service';
import * as inventoryService from '../inventory/inventory.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';
import { io } from '../../app';

export const suppliers = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await inventoryService.listSuppliers(req.query as Record<string, string>)); } catch (e) { next(e); } };
export const purchaseOrders = async (req: Request, res: Response, next: NextFunction) => { try { res.json(await svc.listPurchaseOrders(req.query as Record<string, string>)); } catch (e) { next(e); } };
export const createPO = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const d = await svc.createPurchaseOrder(req.body);
        logActivity(prisma, req.user?.id, 'ERP', 'CREATE', d.id, { type: 'Purchase Order' }, req.ip);

        // Real-time: broadcast new purchase order and trigger stats refresh
        try {
            io.emit('erp:purchase-order:created', { id: d.id, itemId: req.body.itemId, quantity: req.body.quantity, createdAt: d.createdAt });
            io.emit('erp:stats:updated', {});
            // Also broadcast inventory impact (PO increases stock)
            io.emit('inventory:updated', [{ itemId: req.body.itemId }]);
        } catch { /* fire-and-forget */ }

        success(res, d, 'Purchase order created', 201);
    } catch (e) { next(e); }
};
export const stats = async (_req: Request, res: Response, next: NextFunction) => { try { success(res, await svc.getStats()); } catch (e) { next(e); } };
