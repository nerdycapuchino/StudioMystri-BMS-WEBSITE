import { Request, Response } from 'express';
import { razorpayService } from './razorpay.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;

        // Ensure raw body is available (needs express.raw() or custom middleware in app.ts)
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);

        if (!signature || !rawBody) {
            return res.status(400).json({ error: 'Missing signature or raw body' });
        }

        const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            console.error('❌ Invalid Razorpay Webhook Signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;

        switch (event.event) {
            case 'payment.authorized':
            case 'order.paid':
            case 'payment.captured': {
                const paymentEntity = event.payload.payment.entity;
                const razorpayOrderId = paymentEntity.order_id;
                const paymentId = paymentEntity.id;

                // Find the order
                const transaction = await prisma.paymentTransaction.findFirst({
                    where: { gatewayOrderId: razorpayOrderId },
                    include: { order: true }
                });

                if (!transaction) {
                    console.error(`❌ Order not found for Razorpay Order ID: ${razorpayOrderId}`);
                    return res.status(200).send('Ignored');
                }

                if (transaction.status === 'SUCCESS') {
                    // Idempotent: Already processed
                    return res.status(200).send('OK');
                }

                await prisma.$transaction(async (tx) => {
                    // Update Transaction
                    await tx.paymentTransaction.update({
                        where: { id: transaction.id },
                        data: {
                            status: 'SUCCESS',
                            gatewayPaymentId: paymentId,
                        }
                    });

                    // Update Order Status
                    await tx.order.update({
                        where: { id: transaction.orderId },
                        data: {
                            paymentStatus: 'PAID',
                            orderStatus: 'CONFIRMED',
                            paymentReferenceId: paymentId,
                            paymentMethod: paymentEntity.method
                        }
                    });

                    // Update stock (Inventory / Product)
                    const orderItems = await tx.orderItem.findMany({
                        where: { orderId: transaction.orderId },
                        include: { product: true }
                    });

                    for (const item of orderItems) {
                        if (item.productId && item.product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stockQuantity: { decrement: item.quantity } }
                            });
                        }
                    }
                });

                console.log(`✅ Order ${transaction.order.orderNumber} successfully marked as PAID`);
                break;
            }
            case 'payment.failed': {
                const paymentEntity = event.payload.payment.entity;
                console.warn(`⚠️ Payment failed for Razorpay Order: ${paymentEntity.order_id}`);
                // Could update transaction status to FAILED here
                break;
            }
            default:
                console.log(`ℹ️ Unhandled Razorpay event: ${event.event}`);
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('❌ Error processing Razorpay Webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
