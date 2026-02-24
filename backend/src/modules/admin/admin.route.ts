import { Router } from 'express';
import * as ctrl from './admin.controller';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, updateSettingsSchema } from './admin.schema';
import { verifyToken, requireRole } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

export const adminRouter = Router();

// Public: login page needs this for branding
adminRouter.get('/settings', ctrl.getSettings);

// All other admin routes require valid token & ADMIN role
adminRouter.use(verifyToken);
adminRouter.use(requireRole('ADMIN'));

// Users
adminRouter.get('/users', ctrl.listUsers);
adminRouter.get('/users/:id', ctrl.getUser);
adminRouter.post('/users', validate(createUserSchema), ctrl.createUser);
adminRouter.put('/users/:id', validate(updateUserSchema), ctrl.updateUser);
adminRouter.delete('/users/:id', ctrl.deleteUser);
adminRouter.post('/users/:id/reset-link', ctrl.generateResetLink);

// Settings (updates)
adminRouter.put('/settings', validate(updateSettingsSchema), ctrl.updateSettings);
adminRouter.post('/settings/logo', upload.single('logo'), ctrl.uploadLogo);
