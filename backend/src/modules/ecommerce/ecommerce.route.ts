import { Router } from 'express';
import * as ecommerceController from './ecommerce.controller';
import { validate } from '../../middleware/validate';
import { createOrderSchema, validateDiscountSchema } from './ecommerce.schema';

const router = Router();

router.get('/products', ecommerceController.getProducts);
router.get('/products/:slug', ecommerceController.getProductBySlug);

router.post(
    '/orders',
    validate(createOrderSchema),
    ecommerceController.createOrder
);

router.post(
    '/discounts/validate',
    validate(validateDiscountSchema),
    ecommerceController.validateDiscount
);

router.get('/orders/:orderNumber', ecommerceController.getOrder);

export default router;
