import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateShipmentInput } from './logistics.schema';
import { ShipmentStatus } from '@prisma/client';

const SORTABLE = ['status', 'carrier', 'estimatedDelivery', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status as ShipmentStatus;
    if (query.search) where.OR = [{ trackingNumber: { contains: query.search, mode: 'insensitive' } }, { carrier: { contains: query.search, mode: 'insensitive' } }];
    const [data, total] = await Promise.all([
        prisma.shipment.findMany({ where, skip, take, orderBy, include: { customer: { select: { id: true, name: true } } } }),
        prisma.shipment.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const s = await prisma.shipment.findUnique({ where: { id }, include: { customer: true } });
    if (!s) throw createError(404, 'Shipment not found');
    return s;
};

export const create = async (data: CreateShipmentInput) => {
    return prisma.shipment.create({
        data: {
            ...data,
            items: data.items as any,
            estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
        },
    });
};

export const update = async (id: string, data: Partial<CreateShipmentInput>) => {
    await getById(id);
    return prisma.shipment.update({
        where: { id },
        data: { ...data, items: data.items as any, estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined },
    });
};

export const updateStatus = async (id: string, status: ShipmentStatus) => {
    await getById(id);
    return prisma.shipment.update({ where: { id }, data: { status } });
};

export const remove = async (id: string) => {
    await getById(id);
    return prisma.shipment.delete({ where: { id } });
};
