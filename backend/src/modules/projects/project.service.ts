import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateProjectInput, AddPaymentInput } from './project.schema';
import { ProjectStage } from '@prisma/client';

const SORTABLE = ['name', 'budget', 'spent', 'progress', 'stage', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.stage) where.stage = query.stage as ProjectStage;
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.project.findMany({ where, skip, take, orderBy, include: { customer: { select: { id: true, name: true } } } }),
        prisma.project.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        include: { customer: true, payments: { orderBy: { date: 'desc' } }, tasks: true },
    });
    if (!project) throw createError(404, 'Project not found');
    return project;
};

export const create = async (data: CreateProjectInput) => {
    return prisma.project.create({
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
};

export const update = async (id: string, data: Partial<CreateProjectInput>) => {
    await getById(id);
    return prisma.project.update({
        where: { id },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
};

export const updateStage = async (id: string, stage: ProjectStage) => {
    await getById(id);
    return prisma.project.update({ where: { id }, data: { stage, currentStage: stage } });
};

export const remove = async (id: string) => {
    await getById(id);
    return prisma.project.delete({ where: { id } });
};

export const addPayment = async (projectId: string, input: AddPaymentInput) => {
    await getById(projectId);
    const payment = await prisma.payment.create({
        data: {
            ...input,
            projectId,
            date: input.date ? new Date(input.date) : new Date(),
        },
    });

    // Recalculate spent
    const payments = await prisma.payment.findMany({ where: { projectId, status: 'COMPLETED' }, select: { amount: true } });
    await prisma.project.update({
        where: { id: projectId },
        data: { spent: payments.reduce((s, p) => s + p.amount, 0) },
    });

    return payment;
};

export const updatePayment = async (projectId: string, paymentId: string, data: Partial<AddPaymentInput>) => {
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, projectId } });
    if (!payment) throw createError(404, 'Payment not found');

    const updated = await prisma.payment.update({
        where: { id: paymentId },
        data: { ...data, date: data.date ? new Date(data.date) : undefined },
    });

    // Recalculate spent
    const payments = await prisma.payment.findMany({ where: { projectId, status: 'COMPLETED' }, select: { amount: true } });
    await prisma.project.update({
        where: { id: projectId },
        data: { spent: payments.reduce((s, p) => s + p.amount, 0) },
    });

    return updated;
};

export const getStats = async () => {
    const stages = await prisma.project.groupBy({
        by: ['stage'],
        _count: { id: true },
        _sum: { budget: true, spent: true },
    });
    const totalBudget = stages.reduce((s, st) => s + (st._sum.budget || 0), 0);
    const totalSpent = stages.reduce((s, st) => s + (st._sum.spent || 0), 0);

    return {
        byStage: stages.map(s => ({ stage: s.stage, count: s._count.id, budget: s._sum.budget || 0, spent: s._sum.spent || 0 })),
        totalBudget,
        totalSpent,
    };
};
