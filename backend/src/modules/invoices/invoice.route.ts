import { Router } from 'express';
import * as ctrl from './invoice.controller';
import { validate } from '../../middleware/validate';
import { createInvoiceSchema, updateStatusSchema } from './invoice.schema';

export const invoicesRouter = Router();

invoicesRouter.get('/', ctrl.list);
invoicesRouter.get('/:id', ctrl.getById);
invoicesRouter.get('/:id/pdf', ctrl.getPdf);
invoicesRouter.post('/', validate(createInvoiceSchema), ctrl.create);
invoicesRouter.put('/:id/status', validate(updateStatusSchema), ctrl.updateStatus);
