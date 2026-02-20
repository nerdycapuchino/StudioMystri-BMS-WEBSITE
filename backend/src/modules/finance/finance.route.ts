import { Router } from 'express';
import * as ctrl from './finance.controller';
import { validate } from '../../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from './finance.schema';

export const financeRouter = Router();

financeRouter.get('/summary', ctrl.summary);
financeRouter.get('/cashflow', ctrl.cashflow);
financeRouter.get('/transactions', ctrl.listTransactions);
financeRouter.get('/transactions/:id', ctrl.getById);
financeRouter.post('/transactions', validate(createTransactionSchema), ctrl.create);
financeRouter.put('/transactions/:id', validate(updateTransactionSchema), ctrl.update);
financeRouter.delete('/transactions/:id', ctrl.remove);
