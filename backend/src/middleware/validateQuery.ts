// Auto-generated shared validation middleware for all list endpoints
import { Request, Response, NextFunction } from 'express';
import { paginationSchema } from '../utils/commonValidation';

export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = paginationSchema.parse(req.query);
        // Replace req.query with the sanitized version (numbers parsed, nested objects removed)
        // We cast back to any/Record<string, string> because existing services expect string inputs for pagination
        // but at least now we know it's flat and safe.
        req.query = parsed as any;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }
};
