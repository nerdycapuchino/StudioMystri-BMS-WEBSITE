import { Router } from 'express';
import * as ctrl from './hr.controller';
import { validate } from '../../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema, markAttendanceSchema } from './hr.schema';
import { upload } from '../../middleware/upload';

export const hrRouter = Router();

hrRouter.get('/summary', ctrl.summary);
hrRouter.get('/employees', ctrl.listEmployees);
hrRouter.get('/employees/:id', ctrl.getEmployee);
hrRouter.post('/employees', validate(createEmployeeSchema), ctrl.createEmployee);
hrRouter.put('/employees/:id', validate(updateEmployeeSchema), ctrl.updateEmployee);
hrRouter.delete('/employees/:id', ctrl.deleteEmployee);

// Documents
hrRouter.post('/employees/:id/documents', upload.single('document'), ctrl.uploadDocument);

// Attendance
hrRouter.get('/attendance', ctrl.listAttendance);
hrRouter.post('/attendance', validate(markAttendanceSchema), ctrl.markAttendance);
