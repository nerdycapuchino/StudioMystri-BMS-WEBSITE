import { Router } from 'express';
import * as ctrl from './lead.controller';
import { validate } from '../../middleware/validate';
import { createLeadSchema, updateLeadSchema, updateStageSchema } from './lead.schema';

export const leadsRouter = Router();

leadsRouter.get('/pipeline', ctrl.pipeline);
leadsRouter.get('/', ctrl.list);
leadsRouter.get('/:id', ctrl.getById);
leadsRouter.post('/', validate(createLeadSchema), ctrl.create);
leadsRouter.put('/:id', validate(updateLeadSchema), ctrl.update);
leadsRouter.put('/:id/stage', validate(updateStageSchema), ctrl.updateStage);
leadsRouter.post('/:id/convert', ctrl.convertToProject);
leadsRouter.delete('/:id', ctrl.remove);
