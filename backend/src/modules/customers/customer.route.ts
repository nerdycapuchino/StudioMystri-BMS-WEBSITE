import { Router } from 'express';
import * as ctrl from './customer.controller';
import { validate } from '../../middleware/validate';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';
import { validateQuery } from '../../middleware/validateQuery';

export const customersRouter = Router();

customersRouter.get('/', validateQuery, ctrl.list);
customersRouter.get('/:id', ctrl.getById);
customersRouter.post('/', validate(createCustomerSchema), ctrl.create);
customersRouter.put('/:id', validate(updateCustomerSchema), ctrl.update);
customersRouter.delete('/:id', ctrl.remove);
