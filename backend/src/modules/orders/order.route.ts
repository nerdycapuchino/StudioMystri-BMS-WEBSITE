import { Router } from 'express';
import * as ctrl from './order.controller';
import { validate } from '../../middleware/validate';
import { createOrderSchema, updateStatusSchema } from './order.schema';

export const ordersRouter = Router();

ordersRouter.get('/', ctrl.list);
ordersRouter.get('/:id', ctrl.getById);
ordersRouter.post('/', validate(createOrderSchema), ctrl.create);
ordersRouter.put('/:id/status', validate(updateStatusSchema), ctrl.updateStatus);
