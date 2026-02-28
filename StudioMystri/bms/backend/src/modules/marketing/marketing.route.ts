import { Router } from 'express';
import * as ctrl from './marketing.controller';
import { validate } from '../../middleware/validate';
import { createCampaignSchema, updateCampaignSchema, updateCampaignStatusSchema } from './marketing.schema';

export const marketingRouter = Router();
marketingRouter.get('/stats', ctrl.stats);
marketingRouter.get('/campaigns', ctrl.list);
marketingRouter.get('/campaigns/:id', ctrl.getById);
marketingRouter.post('/campaigns', validate(createCampaignSchema), ctrl.create);
marketingRouter.put('/campaigns/:id', validate(updateCampaignSchema), ctrl.update);
marketingRouter.put('/campaigns/:id/status', validate(updateCampaignStatusSchema), ctrl.updateStatus);
marketingRouter.delete('/campaigns/:id', ctrl.remove);
