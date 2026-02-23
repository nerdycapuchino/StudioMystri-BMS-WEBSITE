import { validateQuery } from '../../middleware/validateQuery';
import { Router } from 'express';
import * as ctrl from './task.controller';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from './task.schema';

export const tasksRouter = Router();
tasksRouter.get('/my', ctrl.myTasks);
tasksRouter.get('/', validateQuery, ctrl.list);
tasksRouter.get('/:id', ctrl.getById);
tasksRouter.post('/', validate(createTaskSchema), ctrl.create);
tasksRouter.put('/:id', validate(updateTaskSchema), ctrl.update);
tasksRouter.put('/:id/status', validate(updateTaskStatusSchema), ctrl.updateStatus);
tasksRouter.delete('/:id', ctrl.remove);
