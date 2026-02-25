import { Router } from 'express';
import * as ecommerceController from './ecommerce.controller';
import * as paymentController from './payment.controller';
import { validate } from '../../middleware/validate';
import { createOrderSchema, validateDiscountSchema, verifyPaymentSchema } from './ecommerce.schema';

const router = Router();

// ─── Product Endpoints ──────────────────────────────────
router.get('/products', ecommerceController.getProducts);
router.get('/products/:slug', ecommerceController.getProductBySlug);

// ─── Order Endpoints ────────────────────────────────────
router.post(
    '/orders',
    validate(createOrderSchema),
    ecommerceController.createOrder
);

router.get('/orders/:orderNumber', ecommerceController.getOrder);

// ─── Payment Verification (client-side callback) ────────
router.post(
    '/orders/:orderNumber/verify-payment',
    validate(verifyPaymentSchema),
    paymentController.verifyPayment
);

// ─── Discount Validation ────────────────────────────────
router.post(
    '/discounts/validate',
    validate(validateDiscountSchema),
    ecommerceController.validateDiscount
);

// ─── Razorpay Webhook ───────────────────────────────────
router.post('/payments/razorpay/webhook', paymentController.razorpayWebhook);

// ─── Referral Endpoints ─────────────────────────────────
router.post('/referral/generate', ecommerceController.generateReferral);
router.post('/referral/apply', ecommerceController.applyReferralCode);

// ─── Customer Auth (public registration) ────────────────
router.post('/auth/register', ecommerceController.registerCustomer);
router.post('/auth/login', ecommerceController.loginCustomer);

export default router;
