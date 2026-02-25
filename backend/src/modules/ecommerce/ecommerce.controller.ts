import { Request, Response } from 'express';
import * as ecommerceService from './ecommerce.service';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await ecommerceService.getEcommerceProducts();
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const product = await ecommerceService.getEcommerceProductBySlug(req.params.slug);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const order = await ecommerceService.createEcommerceOrder(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const validateDiscount = async (req: Request, res: Response) => {
    try {
        const { code, orderAmount, userId } = req.body;
        const result = await ecommerceService.validateDiscountCode(code, orderAmount, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const order = await ecommerceService.getEcommerceOrder(req.params.orderNumber);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
