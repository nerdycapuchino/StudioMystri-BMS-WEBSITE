import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../config/rbac';
import { env } from '../config/env';
import { createError } from './errorHandler';

// Extend Express Request to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
        }
    }
}

/**
 * Middleware: Verify JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export const verifyToken = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError(401, 'Access token is required');
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
            id: string;
            email: string;
            role: Role;
        };

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            next(createError(401, 'Access token has expired'));
        } else if (error.name === 'JsonWebTokenError') {
            next(createError(401, 'Invalid access token'));
        } else {
            next(error);
        }
    }
};

/**
 * Middleware factory: Restrict access to specific roles.
 * Must be used AFTER verifyToken.
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(createError(401, 'Authentication required'));
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            next(createError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`));
            return;
        }

        next();
    };
};
