import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateTransactionInput } from './finance.schema';
import { TransactionType } from '@prisma/client';

const SORTABLE = ['amount', 'category', 'date', 'type', 'createdAt'];

export const listTransactions = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.type) where.type = query.type as TransactionType;
    if (query.category) where.category = query.category;
    if (query.dateFrom || query.dateTo) {
        where.date = {
            ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
            ...(query.dateTo && { lte: new Date(query.dateTo) }),
        };
    }

    const [data, total] = await Promise.all([
        prisma.transaction.findMany({ where, skip, take, orderBy, include: { invoice: { select: { id: true, invoiceNumber: true } } } }),
        prisma.transaction.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const txn = await prisma.transaction.findUnique({ where: { id }, include: { invoice: true } });
    if (!txn) throw createError(404, 'Transaction not found');
    return txn;
};

export const create = async (data: CreateTransactionInput) => {
    return prisma.transaction.create({
        data: {
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
        },
    });
};

export const update = async (id: string, data: Partial<CreateTransactionInput>) => {
    await getById(id);
    return prisma.transaction.update({
        where: { id },
        data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
        },
    });
};

export const remove = async (id: string) => {
    await getById(id);
    return prisma.transaction.delete({ where: { id } });
};

export const getSummary = async (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case 'lastMonth': startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); break;
        case 'thisYear': startDate = new Date(now.getFullYear(), 0, 1); break;
        case 'lastYear': startDate = new Date(now.getFullYear() - 1, 0, 1); break;
        default: startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
    }

    const endDate = period === 'lastMonth'
        ? new Date(now.getFullYear(), now.getMonth(), 0)
        : period === 'lastYear'
            ? new Date(now.getFullYear() - 1, 11, 31)
            : now;

    const transactions = await prisma.transaction.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: { type: true, category: true, amount: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const breakdown: Record<string, number> = {};

    for (const t of transactions) {
        if (t.type === 'INCOME') totalIncome += t.amount;
        else totalExpenses += t.amount;
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    }

    return {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        breakdown: Object.entries(breakdown).map(([category, amount]) => ({ category, amount })),
    };
};

export const getCashflow = async () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const transactions = await prisma.transaction.findMany({
        where: { date: { gte: startDate } },
        select: { type: true, amount: true, date: true },
        orderBy: { date: 'asc' },
    });

    const months: Record<string, { income: number; expenses: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const t of transactions) {
        const key = `${monthNames[t.date.getMonth()]} ${t.date.getFullYear()}`;
        if (!months[key]) months[key] = { income: 0, expenses: 0 };
        if (t.type === 'INCOME') months[key].income += t.amount;
        else months[key].expenses += t.amount;
    }

    return Object.entries(months).map(([month, vals]) => ({ month, ...vals }));
};
