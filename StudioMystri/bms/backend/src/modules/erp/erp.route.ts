import { Router } from 'express';
import * as ctrl from './erp.controller';
import { validate } from '../../middleware/validate';
import { createPurchaseOrderSchema } from './erp.schema';

export const erpRouter = Router();
erpRouter.get('/suppliers', ctrl.suppliers);
erpRouter.get('/purchase-orders', ctrl.purchaseOrders);
erpRouter.post('/purchase-orders', validate(createPurchaseOrderSchema), ctrl.createPO);
erpRouter.get('/stats', ctrl.stats);
