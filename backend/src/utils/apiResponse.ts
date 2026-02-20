import { Response } from 'express';

/**
 * Send a success response.
 */
export function success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

/**
 * Send an error response.
 */
export function error(res: Response, message: string, statusCode = 400, errors?: unknown): void {
    const body: Record<string, unknown> = {
        success: false,
        message,
    };
    if (errors) body.errors = errors;
    res.status(statusCode).json(body);
}
