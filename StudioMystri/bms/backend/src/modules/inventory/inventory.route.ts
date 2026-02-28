import { Router } from 'express';
import * as ctrl from './inventory.controller';
import { validate } from '../../middleware/validate';
import { createInventorySchema, updateInventorySchema, stockTransactionSchema, createSupplierSchema, updateSupplierSchema } from './inventory.schema';

export const inventoryRouter = Router();

// Items
inventoryRouter.get('/transactions', ctrl.listTransactions);
inventoryRouter.get('/suppliers', ctrl.listSuppliers);
inventoryRouter.get('/', ctrl.list);
inventoryRouter.get('/:id', ctrl.getById);
inventoryRouter.post('/', validate(createInventorySchema), ctrl.create);
inventoryRouter.put('/:id', validate(updateInventorySchema), ctrl.update);
inventoryRouter.delete('/:id', ctrl.remove);

// Stock transactions
inventoryRouter.post('/:id/transaction', validate(stockTransactionSchema), ctrl.recordTransaction);

// Suppliers
inventoryRouter.post('/suppliers', validate(createSupplierSchema), ctrl.createSupplier);
inventoryRouter.put('/suppliers/:id', validate(updateSupplierSchema), ctrl.updateSupplier);
inventoryRouter.delete('/suppliers/:id', ctrl.deleteSupplier);
