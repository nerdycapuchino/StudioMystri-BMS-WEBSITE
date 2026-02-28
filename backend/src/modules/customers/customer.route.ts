import { Router } from 'express';
import * as ctrl from './customer.controller';
import { validate } from '../../middleware/validate';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';
import { validateQuery } from '../../middleware/validateQuery';

export const customersRouter = Router();

// List / Stats
customersRouter.get('/', validateQuery, ctrl.list);
customersRouter.get('/stats', ctrl.stats);

// Single customer
customersRouter.get('/:id', ctrl.getById);
customersRouter.get('/:id/channel-history', ctrl.channelHistory);

// Create / Update / Delete
customersRouter.post('/', validate(createCustomerSchema), ctrl.create);
customersRouter.put('/:id', validate(updateCustomerSchema), ctrl.update);
customersRouter.delete('/:id', ctrl.remove);

// Duplicate detection & Merge
customersRouter.post('/check-duplicates', ctrl.checkDuplicates);
customersRouter.post('/:id/merge', ctrl.merge);
