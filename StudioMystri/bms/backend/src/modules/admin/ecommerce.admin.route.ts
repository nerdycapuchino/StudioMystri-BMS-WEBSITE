import { Router } from 'express';
import * as ecommerceAdminController from './ecommerce.admin.controller';
import { validate } from '../../middleware/validate';
import { updateOrderStatusSchema, updateShippingSchema, createDiscountSchema } from './ecommerce.admin.schema';

export const ecommerceAdminRouter = Router();

// ─── Orders ──────────────────────────────────────────────
ecommerceAdminRouter.patch(
    '/order/:id/status',
    validate(updateOrderStatusSchema),
    ecommerceAdminController.updateOrderStatus
);

// ─── Shipping ────────────────────────────────────────────
ecommerceAdminRouter.patch(
    '/shipping/:orderId',
    validate(updateShippingSchema),
    ecommerceAdminController.updateShippingInfo
);

// ─── Discounts ───────────────────────────────────────────
ecommerceAdminRouter.get('/discounts', ecommerceAdminController.listDiscounts);

ecommerceAdminRouter.post(
    '/discount',
    validate(createDiscountSchema),
    ecommerceAdminController.createDiscount
);

ecommerceAdminRouter.patch('/discount/:id', ecommerceAdminController.updateDiscount);

ecommerceAdminRouter.delete('/discount/:id', ecommerceAdminController.deleteDiscount);

// ─── Referrals ───────────────────────────────────────────
ecommerceAdminRouter.get('/referrals', ecommerceAdminController.listReferrals);

// ─── Email Logs ──────────────────────────────────────────
ecommerceAdminRouter.get('/email-logs', ecommerceAdminController.listEmailLogs);

// ─── Analytics ───────────────────────────────────────────
ecommerceAdminRouter.get('/analytics', ecommerceAdminController.getAnalytics);
