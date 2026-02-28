import { Request, Response, NextFunction } from 'express';
import { paginationSchema } from '../utils/commonValidation';

/**
 * Middleware to validate and sanitize query parameters for list endpoints.
 * Prevents non-string or nested object injections that could crash Prisma.
 */
export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = paginationSchema.parse(req.query);
        // Replace req.query with the sanitized version
        req.query = parsed as any;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }
};
