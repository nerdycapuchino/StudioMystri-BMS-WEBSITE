import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

// ─── SMTP Transporter ────────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (!transporter) {
        if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
            throw new Error('SMTP credentials not configured');
        }
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

// ─── Log email to DB ─────────────────────────────────────
async function logEmail(emailType: string, status: string, userId?: string, orderId?: string) {
    try {
        await prisma.emailLog.create({
            data: {
                emailType,
                status,
                userId: userId || null,
                orderId: orderId || null,
            },
        });
    } catch (err) {
        console.error('Failed to log email:', err);
    }
}

// ─── Send Email Helper ───────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, emailType: string, userId?: string, orderId?: string) {
    try {
        const transport = getTransporter();
        await transport.sendMail({
            from: `"Studio Mystri" <${env.SMTP_FROM}>`,
            to,
            subject,
            html,
        });
        await logEmail(emailType, 'SENT', userId, orderId);
        console.log(`📧 Email sent: ${emailType} to ${to}`);
    } catch (err: any) {
        console.error(`Failed to send ${emailType} email to ${to}:`, err.message);
        await logEmail(emailType, 'FAILED', userId, orderId);
    }
}

// ─── Order Confirmation ──────────────────────────────────
export async function sendOrderConfirmation(order: any) {
    const customerEmail = order.customer?.email;
    if (!customerEmail) return;

    const itemsHtml = order.items
        ?.map((item: any) => `
            <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;">${item.product?.name || 'Product'}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.totalPrice.toFixed(2)}</td>
            </tr>
        `)
        .join('') || '';

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1a1a2e;padding:30px;text-align:center;">
            <h1 style="color:#e94560;margin:0;font-size:24px;">Studio Mystri</h1>
            <p style="color:#fff;margin:8px 0 0;">Order Confirmation</p>
        </div>
        <div style="padding:30px;">
            <p>Hi ${order.customer?.name || 'there'},</p>
            <p>Thank you for your order! Here are the details:</p>

            <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;">
                <strong>Order Number:</strong> ${order.orderNumber}<br/>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br/>
                <strong>Status:</strong> ${order.orderStatus}
            </div>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <thead>
                    <tr style="background:#f0f0f0;">
                        <th style="padding:8px;text-align:left;">Item</th>
                        <th style="padding:8px;text-align:center;">Qty</th>
                        <th style="padding:8px;text-align:right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="text-align:right;margin:20px 0;">
                <p style="margin:4px 0;">Subtotal: ₹${order.subtotal?.toFixed(2) || '0.00'}</p>
                ${order.discountAmount > 0 ? `<p style="margin:4px 0;color:#27ae60;">Discount: -₹${order.discountAmount.toFixed(2)}</p>` : ''}
                ${order.shippingAmount > 0 ? `<p style="margin:4px 0;">Shipping: ₹${order.shippingAmount.toFixed(2)}</p>` : ''}
                ${order.taxAmount > 0 ? `<p style="margin:4px 0;">Tax: ₹${order.taxAmount.toFixed(2)}</p>` : ''}
                <p style="margin:4px 0;font-size:18px;font-weight:bold;">Total: ₹${order.totalAmount.toFixed(2)}</p>
            </div>

            <p style="color:#666;">We'll notify you when your order ships.</p>
        </div>
        <div style="background:#f8f9fa;padding:20px;text-align:center;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} Studio Mystri. All rights reserved.
        </div>
    </div>`;

    await sendEmail(customerEmail, `Order Confirmed - ${order.orderNumber}`, html, 'ORDER_CONFIRMATION', order.userId, order.id);
}

// ─── Shipping Confirmation ───────────────────────────────
export async function sendShippingConfirmation(order: any, shippingInfo: any) {
    const customerEmail = order.customer?.email;
    if (!customerEmail) return;

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1a1a2e;padding:30px;text-align:center;">
            <h1 style="color:#e94560;margin:0;font-size:24px;">Studio Mystri</h1>
            <p style="color:#fff;margin:8px 0 0;">Your Order Has Shipped!</p>
        </div>
        <div style="padding:30px;">
            <p>Hi ${order.customer?.name || 'there'},</p>
            <p>Great news! Your order <strong>${order.orderNumber}</strong> has been shipped.</p>

            <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;">
                <strong>Courier:</strong> ${shippingInfo.courierName || 'N/A'}<br/>
                <strong>Tracking ID:</strong> ${shippingInfo.trackingId || 'N/A'}<br/>
                ${shippingInfo.trackingUrl ? `<strong>Track here:</strong> <a href="${shippingInfo.trackingUrl}">${shippingInfo.trackingUrl}</a>` : ''}
            </div>

            <p style="color:#666;">You can track your order using the details above.</p>
        </div>
        <div style="background:#f8f9fa;padding:20px;text-align:center;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} Studio Mystri. All rights reserved.
        </div>
    </div>`;

    await sendEmail(customerEmail, `Order Shipped - ${order.orderNumber}`, html, 'SHIPPING_CONFIRMATION', order.userId, order.id);
}

// ─── Referral Reward ─────────────────────────────────────
export async function sendReferralReward(userEmail: string, userName: string, rewardType: string, rewardValue: number, userId?: string) {
    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1a1a2e;padding:30px;text-align:center;">
            <h1 style="color:#e94560;margin:0;font-size:24px;">Studio Mystri</h1>
            <p style="color:#fff;margin:8px 0 0;">Referral Reward 🎉</p>
        </div>
        <div style="padding:30px;">
            <p>Hi ${userName},</p>
            <p>Congratulations! Your referral has resulted in a completed purchase.</p>

            <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #27ae60;">
                <strong>Reward:</strong> ${rewardType === 'CASHBACK' ? `₹${rewardValue} cashback` : `${rewardValue}% discount on your next order`}
            </div>

            <p style="color:#666;">Keep sharing and earning rewards!</p>
        </div>
        <div style="background:#f8f9fa;padding:20px;text-align:center;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} Studio Mystri. All rights reserved.
        </div>
    </div>`;

    await sendEmail(userEmail, 'You earned a referral reward!', html, 'REFERRAL_REWARD', userId);
}
