import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.schema';
import { verifyToken } from '../../middleware/auth';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
authRouter.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout
authRouter.post('/logout', authController.logout);

// GET /api/v1/auth/me (requires auth)
authRouter.get('/me', verifyToken, authController.me);
