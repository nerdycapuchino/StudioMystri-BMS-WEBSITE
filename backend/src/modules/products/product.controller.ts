import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { success } from '../../utils/apiResponse';
import { logActivity } from '../../utils/activityLogger';
import prisma from '../../config/db';

export const list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await productService.list(req.query as Record<string, string>)); } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await productService.getById(req.params.id)); } catch (e) { next(e); }
};

export const getByBarcode = async (req: Request, res: Response, next: NextFunction) => {
    try { success(res, await productService.getByBarcode(req.params.code)); } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.create(req.body);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'CREATE', data.id, { name: data.name }, req.ip);
        success(res, data, 'Product created', 201);
    } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.update(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Product updated');
    } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productService.softDelete(req.params.id);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'DELETE', req.params.id, {}, req.ip);
        success(res, null, 'Product deleted');
    } catch (e) { next(e); }
};

export const addVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.addVariant(req.params.id, req.body);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'CREATE', data.id, { variant: data.name }, req.ip);
        success(res, data, 'Variant added', 201);
    } catch (e) { next(e); }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.updateVariant(req.params.id, req.params.variantId, req.body);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'UPDATE', data.id, req.body, req.ip);
        success(res, data, 'Variant updated');
    } catch (e) { next(e); }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productService.deleteVariant(req.params.id, req.params.variantId);
        logActivity(prisma, req.user?.id, 'PRODUCTS', 'DELETE', req.params.variantId, {}, req.ip);
        success(res, null, 'Variant deleted');
    } catch (e) { next(e); }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw new Error('No image file uploaded');
        const imageUrl = `/uploads/${req.file.filename}`;
        const data = await productService.addImage(req.params.id, imageUrl);
        success(res, data, 'Image uploaded');
    } catch (e) { next(e); }
};
