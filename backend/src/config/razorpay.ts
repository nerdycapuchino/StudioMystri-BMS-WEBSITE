import Razorpay from 'razorpay';
import { env } from './env';

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = (): Razorpay => {
    if (!razorpayInstance) {
        if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
        }
        razorpayInstance = new Razorpay({
            key_id: env.RAZORPAY_KEY_ID,
            key_secret: env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};
