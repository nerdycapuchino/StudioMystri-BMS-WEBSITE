import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { env } from '../../config/env';

// Cookie config for refresh token
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/v1/auth',
};

/**
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await authService.login(req.body);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const result = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed',
            data: {
                accessToken: result.accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.user?.id) {
            await authService.logout(req.user.id);
        }

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
            path: '/api/v1/auth',
        });

        res.json({
            success: true,
            message: 'Logged out successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/auth/me
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await authService.getCurrentUser(req.user!.id);

        res.json({
            success: true,
            message: 'User profile retrieved',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
