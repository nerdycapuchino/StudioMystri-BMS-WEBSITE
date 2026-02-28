import { Request, Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';
import { io } from '../../app';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await inventoryService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await inventoryService.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await inventoryService.create(req.body);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'CREATE', data.id, { name: data.name }, req.ip);
        success(res, data, 'Item created', 201);
    } catch (e) { next(e); }
};
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await inventoryService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'UPDATE', data.id, req.body, req.ip);

        // Real-time: broadcast inventory item update
        try { io.emit('inventory:updated', [{ itemId: data.id, newQuantity: data.quantity, isLowStock: data.quantity <= data.reorderPoint }]); } catch { /* fire-and-forget */ }

        success(res, data, 'Item updated');
    } catch (e) { next(e); }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await inventoryService.remove(req.params.id);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Item deleted');
    } catch (e) { next(e); }
};
export const recordTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await inventoryService.recordTransaction(req.params.id, req.body, req.user?.id);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'CREATE', data.id, { type: data.type, quantity: data.quantity }, req.ip);

        // Real-time: broadcast transaction and updated item
        try {
            io.emit('inventory:transaction:created', { id: data.id, itemId: req.params.id, type: data.type, quantity: data.quantity });
            const item = (data as any).item;
            if (item) {
                io.emit('inventory:updated', [{ itemId: item.id, newQuantity: item.quantity, isLowStock: item.quantity <= item.reorderPoint }]);
            }
        } catch { /* fire-and-forget */ }

        success(res, data, 'Stock transaction recorded', 201);
    } catch (e) { next(e); }
};
export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await inventoryService.listTransactions(req.query as Record<string, string>)); } catch (e) { next(e); }
};

// Suppliers
export const listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await inventoryService.listSuppliers(req.query as Record<string, string>)); } catch (e) { next(e); }
};
export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await inventoryService.createSupplier(req.body);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'CREATE', data.id, { supplier: data.name }, req.ip);
        success(res, data, 'Supplier created', 201);
    } catch (e) { next(e); }
};
export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await inventoryService.updateSupplier(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Supplier updated');
    } catch (e) { next(e); }
};
export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await inventoryService.deleteSupplier(req.params.id);
        logActivity(prisma, req.user?.id, 'INVENTORY', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Supplier deleted');
    } catch (e) { next(e); }
};
