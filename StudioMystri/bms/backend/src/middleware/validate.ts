import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationSchema {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}

/**
 * Enhanced Zod validation middleware factory.
 * Validates req.body, req.query, and req.params against provided schemas.
 */
export const validate = (schema: ValidationSchema | AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if ('parse' in schema) {
                // Legacy support for single schema (body)
                schema.parse(req.body);
            } else {
                if (schema.body) schema.body.parse(req.body);
                if (schema.query) schema.query.parse(req.query);
                if (schema.params) schema.params.parse(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                    location: e.path[0] ? undefined : 'root', // Simple heuristic
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};
