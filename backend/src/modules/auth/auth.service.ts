import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { createError } from '../../middleware/errorHandler';
import { LoginInput } from './auth.schema';

// Token payload shape
interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

/**
 * Generate a JWT access token (short-lived: 15 min)
 */
const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a JWT refresh token (long-lived: 7 days)
 */
const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Login: Validate credentials and return tokens
 */
export const login = async (input: LoginInput) => {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Timing attack mitigation: always perform a password compare
    const dummyHash = '$2a$10$0G6s0Pz60G6s0Pz60G6s0Ou1o0S0v0I0v0I0v0I0v0I0v0I0v0I'; // Validly formatted Bcrypt hash
    const passwordToCompare = user ? user.passwordHash : dummyHash;
    const isPasswordValid = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isPasswordValid) {
        throw createError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
        throw createError(403, 'Account is deactivated. Contact your administrator.');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: hashedRefreshToken,
            lastLogin: new Date(),
        },
    });

    // Return user data (without sensitive fields)
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    };

    return { accessToken, refreshToken, user: userResponse };
};

/**
 * Refresh: Verify refresh token and issue new access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw createError(401, 'Refresh token is required');
    }

    // Verify the refresh token
    let decoded: TokenPayload;
    try {
        decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
        throw createError(401, 'Invalid or expired refresh token');
    }

    // Find the user and compare stored hash
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.refreshToken) {
        throw createError(401, 'Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
        throw createError(401, 'Refresh token has been revoked');
    }

    if (!user.isActive) {
        throw createError(403, 'Account is deactivated');
    }

    // Issue new access token
    const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return { accessToken: newAccessToken };
};

/**
 * Logout: Clear refresh token from DB
 */
export const logout = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            employee: {
                select: {
                    id: true,
                    department: true,
                    role: true,
                    phone: true,
                },
            },
        },
    });

    if (!user) {
        throw createError(404, 'User not found');
    }

    return user;
};
