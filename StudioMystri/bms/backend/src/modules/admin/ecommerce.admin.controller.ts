import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { sendShippingConfirmation } from '../../utils/email.service';

const prisma = new PrismaClient();

// ─── Order Status Update ─────────────────────────────────
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

// ─── Shipping Info ───────────────────────────────────────
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

        // If tracking ID provided, update order status and send email
        if (updateData.trackingId) {
            const order = await prisma.order.update({
                where: { id: orderId },
                data: { orderStatus: OrderStatus.SHIPPED },
                include: { customer: true },
            });

            try {
                await sendShippingConfirmation(order, shippingInfo);
            } catch (emailErr) {
                console.error('Shipping email failed (non-blocking):', emailErr);
            }
        }

        res.status(200).json({ success: true, data: shippingInfo });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── Discount CRUD ───────────────────────────────────────
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

export const listDiscounts = async (req: Request, res: Response) => {
    try {
        const discounts = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, count: discounts.length, data: discounts });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDiscount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const discount = await prisma.discountCode.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json({ success: true, data: discount });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteDiscount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete — just deactivate
        const discount = await prisma.discountCode.update({
            where: { id },
            data: { isActive: false },
        });
        res.status(200).json({ success: true, data: discount });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── Referral Tracking ───────────────────────────────────
export const listReferrals = async (req: Request, res: Response) => {
    try {
        const referrals = await prisma.referral.findMany({
            include: {
                referrer: { select: { id: true, name: true, email: true } },
                referred: { select: { id: true, name: true, email: true } },
                order: { select: { id: true, orderNumber: true, totalAmount: true, paymentStatus: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, count: referrals.length, data: referrals });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Email Logs ──────────────────────────────────────────
export const listEmailLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.emailLog.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                order: { select: { id: true, orderNumber: true } },
            },
            orderBy: { sentAt: 'desc' },
            take: 100,
        });
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Enhanced Analytics ──────────────────────────────────
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const [
            totalOrders,
            totalRevenueResult,
            ordersByStatus,
            recentOrders,
            discountUsage,
            referralCount,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({
                where: { paymentStatus: 'PAID' },
                _sum: { totalAmount: true },
            }),
            prisma.order.groupBy({
                by: ['orderStatus'],
                _count: true,
            }),
            prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { customer: { select: { name: true, email: true } } },
            }),
            prisma.discountCode.aggregate({
                _sum: { usedCount: true },
            }),
            prisma.referral.count({ where: { rewardIssued: true } }),
        ]);

        const analytics = {
            totalOrders,
            totalRevenue: totalRevenueResult._sum.totalAmount || 0,
            ordersByStatus: ordersByStatus.reduce((acc: any, item) => {
                acc[item.orderStatus] = item._count;
                return acc;
            }, {}),
            recentOrders,
            discountCodesUsed: discountUsage._sum.usedCount || 0,
            referralsRewarded: referralCount,
        };

        res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
