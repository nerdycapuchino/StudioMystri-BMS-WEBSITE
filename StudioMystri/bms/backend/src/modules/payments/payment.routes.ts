import { Router } from 'express';
import { handleRazorpayWebhook } from './payment.controller';

const router = Router();

// Webhook endpoint
// NOTE: Ensure raw body middleware is applied before this route if necessary, 
// or the controller can attempt to use the parsed JSON body (less secure for signature validation).
router.post('/razorpay/webhook', handleRazorpayWebhook);

export default router;
