import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';

const SORTABLE = ['name', 'email', 'totalSpent', 'totalOrders', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.customer.findMany({ where, skip, take, orderBy }),
        prisma.customer.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            orders: { take: 10, orderBy: { createdAt: 'desc' } },
            invoices: { take: 10, orderBy: { createdAt: 'desc' } },
            projects: { take: 10, orderBy: { createdAt: 'desc' } },
        },
    });
    if (!customer) throw createError(404, 'Customer not found');
    return customer;
};

export const create = async (data: CreateCustomerInput) => {
    return prisma.customer.create({ data });
};

export const update = async (id: string, data: UpdateCustomerInput) => {
    await getById(id);
    return prisma.customer.update({ where: { id }, data });
};

export const softDelete = async (id: string) => {
    await getById(id);
    return prisma.customer.update({ where: { id }, data: { status: 'Inactive' } });
};

export const recalculateStats = async (customerId: string) => {
    const orders = await prisma.order.findMany({
        where: { customerId },
        select: { total: true },
    });
    await prisma.customer.update({
        where: { id: customerId },
        data: {
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
        },
    });
};
