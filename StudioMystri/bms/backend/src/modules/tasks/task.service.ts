import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateTaskInput } from './task.schema';
import { TaskStatus, TaskPriority } from '@prisma/client';

const SORTABLE = ['title', 'priority', 'status', 'dueDate', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);
    const where: Record<string, unknown> = {};
    if (query.assignedTo) where.assignedToId = query.assignedTo;
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status as TaskStatus;
    if (query.priority) where.priority = query.priority as TaskPriority;
    if (query.search) where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];

    const [data, total] = await Promise.all([
        prisma.task.findMany({ where, skip, take, orderBy, include: { assignedTo: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } } }),
        prisma.task.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const t = await prisma.task.findUnique({ where: { id }, include: { assignedTo: { select: { id: true, name: true, avatar: true } }, project: { select: { id: true, name: true } } } });
    if (!t) throw createError(404, 'Task not found');
    return t;
};

export const create = async (data: CreateTaskInput) => prisma.task.create({ data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } });
export const update = async (id: string, data: Partial<CreateTaskInput>) => { await getById(id); return prisma.task.update({ where: { id }, data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } }); };
export const updateStatus = async (id: string, status: TaskStatus) => { await getById(id); return prisma.task.update({ where: { id }, data: { status } }); };
export const remove = async (id: string) => { await getById(id); return prisma.task.delete({ where: { id } }); };
export const myTasks = async (userId: string, query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const where = { assignedToId: userId };
    const [data, total] = await Promise.all([
        prisma.task.findMany({ where, skip, take, orderBy: { dueDate: 'asc' }, include: { project: { select: { id: true, name: true } } } }),
        prisma.task.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};
