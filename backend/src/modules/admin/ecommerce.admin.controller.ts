import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: { orderStatus: status as OrderStatus },
        });

        res.status(200).json({ success: true, data: order });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateShippingInfo = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        const shippingInfo = await prisma.shippingInfo.upsert({
            where: { orderId },
            create: {
                orderId,
                ...updateData,
            },
            update: {
                ...updateData,
            },
        });

        res.status(200).json({ success: true, data: shippingInfo });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const createDiscount = async (req: Request, res: Response) => {
    try {
        const discount = await prisma.discountCode.create({
            data: req.body,
        });
        res.status(201).json({ success: true, data: discount });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const totalOrders = await prisma.order.count();
        const totalRevenueResult = await prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalAmount: true },
        });

        // Very simple placeholder analytics for the ecommerce module
        const analytics = {
            totalOrders,
            totalRevenue: totalRevenueResult._sum.totalAmount || 0,
        };

        res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
