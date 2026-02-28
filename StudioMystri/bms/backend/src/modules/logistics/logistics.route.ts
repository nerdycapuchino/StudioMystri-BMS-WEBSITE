import { Router } from 'express';
import * as ctrl from './logistics.controller';
import { validate } from '../../middleware/validate';
import { createShipmentSchema, updateShipmentSchema, updateShipmentStatusSchema } from './logistics.schema';

export const logisticsRouter = Router();
logisticsRouter.get('/', ctrl.list);
logisticsRouter.get('/:id', ctrl.getById);
logisticsRouter.post('/', validate(createShipmentSchema), ctrl.create);
logisticsRouter.put('/:id', validate(updateShipmentSchema), ctrl.update);
logisticsRouter.put('/:id/status', validate(updateShipmentStatusSchema), ctrl.updateStatus);
logisticsRouter.delete('/:id', ctrl.remove);
