import { Request, Response } from 'express';
import crypto from 'crypto';
import { Prisma, PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client';
import { env } from '../../config/env';
import { sendOrderConfirmation } from '../../utils/email.service';

const prisma = new PrismaClient();
const webhookEventModel = (prisma as any).webhookEvent;

/**
 * Razorpay Webhook Handler
 * POST /api/v1/ecommerce/payments/razorpay/webhook
 *
 * Verifies signature, updates order payment status, creates PaymentTransaction.
 * Idempotent — silently succeeds if order is already PAID.
 */
export const razorpayWebhook = async (req: Request, res: Response) => {
    let webhookEventRowId: string | null = null;
    try {
        const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET not configured');
            return res.status(500).json({ success: false, message: 'Webhook not configured' });
        }

        // Verify signature
        const signature = req.headers['x-razorpay-signature'] as string;
        if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing signature header' });
        }

        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('Razorpay webhook signature verification failed');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const event = req.body;
        const eventType = event.event;
        const headerEventId = req.headers['x-razorpay-event-id'];
        const fallbackEventId = `${eventType || 'unknown'}:${event.payload?.payment?.entity?.id || 'na'}:${event.payload?.payment?.entity?.order_id || 'na'}`;
        const eventId = typeof headerEventId === 'string' && headerEventId.trim().length > 0
            ? headerEventId
            : fallbackEventId;

        try {
            const eventRow = await webhookEventModel.create({
                data: {
                    gateway: 'razorpay',
                    eventId,
                    eventType: eventType || 'unknown',
                    payload: event,
                    processed: false,
                },
            });
            webhookEventRowId = eventRow.id;
        } catch (err: any) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                return res.status(200).json({ success: true, message: 'Duplicate webhook ignored' });
            }
            throw err;
        }

        if (eventType === 'payment.captured') {
            const payment = event.payload?.payment?.entity;
            if (!payment) {
                return res.status(400).json({ success: false, message: 'Invalid payload' });
            }

            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;
            const amount = payment.amount / 100; // Convert paise to rupees

            // Find order by Razorpay order ID (stored in paymentReferenceId)
            const order = await prisma.order.findFirst({
                where: { paymentReferenceId: razorpayOrderId },
            });

            if (!order) {
                console.warn(`No order found for Razorpay order: ${razorpayOrderId}`);
                return res.status(200).json({ success: true, message: 'Order not found, ignoring' });
            }

            // Idempotent: if already paid, skip
            if (order.paymentStatus === PaymentStatus.PAID) {
                return res.status(200).json({ success: true, message: 'Already processed' });
            }

            // Update order and create payment transaction atomically
            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: PaymentStatus.PAID,
                        orderStatus: OrderStatus.PROCESSING,
                    },
                });

                await tx.paymentTransaction.create({
                    data: {
                        orderId: order.id,
                        gateway: 'razorpay',
                        gatewayOrderId: razorpayOrderId,
                        gatewayPaymentId: razorpayPaymentId,
                        amount,
                        status: 'CAPTURED',
                        signatureVerified: true,
                    },
                });
            });

            console.log(`✅ Payment captured for order ${order.orderNumber}`);

            // Send order confirmation email
            try {
                const fullOrder = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: { items: { include: { product: true } }, customer: true },
                });
                if (fullOrder) await sendOrderConfirmation(fullOrder);
            } catch (emailErr) {
                console.error('Email send failed (non-blocking):', emailErr);
            }
        } else if (eventType === 'payment.failed') {
            const payment = event.payload?.payment?.entity;
            if (payment) {
                const razorpayOrderId = payment.order_id;
                const order = await prisma.order.findFirst({
                    where: { paymentReferenceId: razorpayOrderId },
                });

                if (order && order.paymentStatus !== PaymentStatus.PAID) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { paymentStatus: PaymentStatus.FAILED },
                    });

                    await prisma.paymentTransaction.create({
                        data: {
                            orderId: order.id,
                            gateway: 'razorpay',
                            gatewayOrderId: razorpayOrderId,
                            gatewayPaymentId: payment.id,
                            amount: payment.amount / 100,
                            status: 'FAILED',
                            signatureVerified: true,
                        },
                    });
                }
            }
        }

        if (webhookEventRowId) {
            await webhookEventModel.update({
                where: { id: webhookEventRowId },
                data: { processed: true, processedAt: new Date(), error: null },
            });
        }

        // Always return 200 to Razorpay so it doesn't retry
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Razorpay webhook error:', error);
        if (webhookEventRowId) {
            await webhookEventModel.update({
                where: { id: webhookEventRowId },
                data: { processed: false, error: error?.message || 'Unknown webhook processing error' },
            }).catch(() => undefined);
        }
        // Still return 200 to prevent retries on our side errors
        res.status(200).json({ success: true, message: 'Processed with errors' });
    }
};

/**
 * Client-side payment verification
 * POST /api/v1/ecommerce/orders/:orderNumber/verify-payment
 *
 * Called by the frontend after Razorpay checkout completes.
 * Verifies the payment signature and updates the order.
 */
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { orderNumber } = req.params;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        const keySecret = env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return res.status(500).json({ success: false, message: 'Payment not configured' });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        const order = await prisma.order.findUnique({
            where: { orderNumber },
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.paymentGateway !== 'razorpay' || order.paymentReferenceId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: 'Payment reference mismatch for order' });
        }

        // Idempotent: if already paid, just return success
        if (order.paymentStatus === PaymentStatus.PAID) {
            return res.status(200).json({ success: true, data: { orderNumber, status: 'PAID' } });
        }

        if (!isValid) {
            await prisma.paymentTransaction.create({
                data: {
                    orderId: order.id,
                    gateway: 'razorpay',
                    gatewayOrderId: razorpay_order_id,
                    gatewayPaymentId: razorpay_payment_id,
                    amount: order.totalAmount,
                    status: 'SIGNATURE_FAILED',
                    signatureVerified: false,
                },
            });
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Valid payment — update order and create transaction
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: PaymentStatus.PAID,
                    orderStatus: OrderStatus.PROCESSING,
                },
            });

            await tx.paymentTransaction.create({
                data: {
                    orderId: order.id,
                    gateway: 'razorpay',
                    gatewayOrderId: razorpay_order_id,
                    gatewayPaymentId: razorpay_payment_id,
                    amount: order.totalAmount,
                    status: 'CAPTURED',
                    signatureVerified: true,
                },
            });
        });

        // Send order confirmation email
        try {
            const fullOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: { include: { product: true } }, customer: true },
            });
            if (fullOrder) await sendOrderConfirmation(fullOrder);
        } catch (emailErr) {
            console.error('Email send failed (non-blocking):', emailErr);
        }

        res.status(200).json({
            success: true,
            data: { orderNumber: order.orderNumber, status: 'PAID' },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
