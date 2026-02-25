import { Router } from 'express';
import * as ecommerceAdminController from './ecommerce.admin.controller';
import { validate } from '../../middleware/validate';
import { updateOrderStatusSchema, updateShippingSchema, createDiscountSchema } from './ecommerce.admin.schema';

export const ecommerceAdminRouter = Router();

ecommerceAdminRouter.patch(
    '/order/:id/status',
    validate(updateOrderStatusSchema),
    ecommerceAdminController.updateOrderStatus
);

ecommerceAdminRouter.patch(
    '/shipping/:orderId',
    validate(updateShippingSchema),
    ecommerceAdminController.updateShippingInfo
);

ecommerceAdminRouter.post(
    '/discount',
    validate(createDiscountSchema),
    ecommerceAdminController.createDiscount
);

ecommerceAdminRouter.get(
    '/analytics',
    ecommerceAdminController.getAnalytics
);
