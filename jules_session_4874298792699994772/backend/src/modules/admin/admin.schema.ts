import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN', 'SALES', 'HR', 'FINANCE', 'MANAGER']).optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['ADMIN', 'SALES', 'HR', 'FINANCE', 'MANAGER']).optional(),
    isActive: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    currency: z.enum(['INR', 'USD']).optional(),
    bankName: z.string().optional().nullable(),
    accountNo: z.string().optional().nullable(),
    ifsc: z.string().optional().nullable(),
    branch: z.string().optional().nullable(),
});

export const listUsersSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
