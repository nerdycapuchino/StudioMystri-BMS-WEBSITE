import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import * as ecommerceService from './ecommerce.service';
import * as referralService from './referral.service';
import { env } from '../../config/env';

const prisma = new PrismaClient();

// ─── Products ────────────────────────────────────────────
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

// ─── Orders ──────────────────────────────────────────────
export const createOrder = async (req: Request, res: Response) => {
    try {
        const order = await ecommerceService.createEcommerceOrder(req.body);
        res.status(201).json({ success: true, data: order });
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

// ─── Discounts ───────────────────────────────────────────
export const validateDiscount = async (req: Request, res: Response) => {
    try {
        const { code, orderAmount, userId } = req.body;
        const result = await ecommerceService.validateDiscountCode(code, orderAmount, userId);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── Referrals ───────────────────────────────────────────
export const generateReferral = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }
        const code = await referralService.generateReferralCode(userId);
        res.status(200).json({ success: true, data: { referralCode: code } });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const applyReferralCode = async (req: Request, res: Response) => {
    try {
        const { referralCode, userId, orderId } = req.body;
        if (!referralCode || !userId || !orderId) {
            return res.status(400).json({ success: false, message: 'referralCode, userId, and orderId are required' });
        }
        const referral = await referralService.applyReferral(referralCode, userId, orderId);
        res.status(200).json({ success: true, data: referral });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── Customer Auth ───────────────────────────────────────
export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'name, email, and password are required' });
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'CUSTOMER',
            },
        });

        // Also create a customer record for order management
        await prisma.customer.create({
            data: {
                name,
                email,
                phone: phone || null,
            },
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_ACCESS_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.JWT_ACCESS_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        res.status(200).json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
