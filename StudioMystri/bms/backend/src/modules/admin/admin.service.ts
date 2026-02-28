import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateUserInput, UpdateUserInput } from './admin.schema';
import { sendResetPasswordEmail } from '../../utils/mailer';

// Omit passwordHash and refreshToken from all user responses
const userSelect = {
    id: true, name: true, email: true, role: true, isActive: true,
    avatar: true, lastLogin: true, createdAt: true, updatedAt: true,
};

export const listUsers = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const where: Record<string, unknown> = {};
    if (query.search) where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }];
    const [data, total] = await Promise.all([
        prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, select: userSelect }),
        prisma.user.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id }, select: { ...userSelect, employee: { select: { id: true, department: true, role: true } } } });
    if (!user) throw createError(404, 'User not found');
    return user;
};

export const createUser = async (input: CreateUserInput) => {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw createError(409, 'Email already in use');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate a secure random fallback password initially
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
            resetToken,
            resetTokenExpiry
        },
        select: userSelect,
    });

    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch the welcome/setup email in the background
    sendResetPasswordEmail(user.email, setupLink, user.name).catch(console.error);

    return { ...user, setupLink };
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
    await getUserById(id);
    return prisma.user.update({ where: { id }, data: input, select: userSelect });
};

export const deactivateUser = async (id: string, currentUserId: string) => {
    if (id === currentUserId) throw createError(400, 'Cannot deactivate your own account');
    await getUserById(id);
    return prisma.user.update({ where: { id }, data: { isActive: false }, select: userSelect });
};

export const generateResetLink = async (id: string, currentUserId: string) => {
    const user = await getUserById(id);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
        where: { id },
        data: { resetToken, resetTokenExpiry }
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch the password reset email in the background
    sendResetPasswordEmail(user.email, resetLink, user.name).catch(console.error);

    return { resetLink };
};

export const getSettings = async () => {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
        settings = await prisma.companySettings.create({ data: { name: 'Studio Mystri' } });
    }
    return settings;
};

export const updateSettings = async (data: Record<string, unknown>) => {
    const existing = await prisma.companySettings.findFirst();
    if (existing) {
        return prisma.companySettings.update({ where: { id: existing.id }, data });
    }
    return prisma.companySettings.create({ data: { ...data, name: (data.name as string) || 'Studio Mystri' } });
};

export const updateLogo = async (logoUrl: string) => {
    const existing = await prisma.companySettings.findFirst();
    if (existing) {
        return prisma.companySettings.update({ where: { id: existing.id }, data: { logoUrl } });
    }
    return prisma.companySettings.create({ data: { name: 'Studio Mystri', logoUrl } });
};
