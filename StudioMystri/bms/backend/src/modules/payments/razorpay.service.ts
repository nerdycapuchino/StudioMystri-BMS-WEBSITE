import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env';

class RazorpayService {
    private instance: Razorpay | null = null;
    private isConfigured = false;

    constructor() {
        if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
            this.instance = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET,
            });
            this.isConfigured = true;
        } else {
            console.warn('⚠️ Razorpay keys missing in environment. Payment features will be disabled.');
        }
    }

    /**
     * Create a Razorpay Order
     */
    async createOrder(amountInPaise: number, currency: string = 'INR', receipt: string) {
        if (!this.isConfigured || !this.instance) {
            throw new Error('Razorpay is not configured');
        }

        const options = {
            amount: amountInPaise,
            currency,
            receipt,
            payment_capture: 1, // Auto capture
        };

        const order = await this.instance.orders.create(options);
        return order;
    }

    /**
     * Verify Webhook Signature
     */
    verifyWebhookSignature(rawBody: string, signature: string): boolean {
        if (!env.RAZORPAY_WEBHOOK_SECRET) {
            console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET missing, bypassing signature verification (NOT RECOMMENDED for production)');
            return true;
        }

        const expectedSignature = crypto
            .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        return expectedSignature === signature;
    }
}

export const razorpayService = new RazorpayService();
