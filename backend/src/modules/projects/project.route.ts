import { Router } from 'express';
import * as ctrl from './project.controller';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema, updateStageSchema, addPaymentSchema } from './project.schema';

export const projectsRouter = Router();

projectsRouter.get('/stats', ctrl.stats);
projectsRouter.get('/', ctrl.list);
projectsRouter.get('/:id', ctrl.getById);
projectsRouter.post('/', validate(createProjectSchema), ctrl.create);
projectsRouter.put('/:id', validate(updateProjectSchema), ctrl.update);
projectsRouter.put('/:id/stage', validate(updateStageSchema), ctrl.updateStage);
projectsRouter.delete('/:id', ctrl.remove);

// Payments
projectsRouter.post('/:id/payments', validate(addPaymentSchema), ctrl.addPayment);
projectsRouter.put('/:id/payments/:paymentId', ctrl.updatePayment);
