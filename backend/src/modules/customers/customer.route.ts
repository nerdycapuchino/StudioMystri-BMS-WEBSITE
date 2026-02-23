import { Router } from 'express';
import * as ctrl from './customer.controller';
import { validate } from '../../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, listCustomerQuerySchema } from './customer.schema';

export const customersRouter = Router();

customersRouter.get('/', validate({ query: listCustomerQuerySchema }), ctrl.list);
customersRouter.get('/:id', ctrl.getById);
customersRouter.post('/', validate(createCustomerSchema), ctrl.create);
customersRouter.put('/:id', validate(updateCustomerSchema), ctrl.update);
customersRouter.delete('/:id', ctrl.remove);
