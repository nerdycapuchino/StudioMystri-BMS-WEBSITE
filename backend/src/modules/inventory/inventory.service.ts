import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateInventoryInput, StockTransactionInput, CreateSupplierInput } from './inventory.schema';
import { InventoryType } from '@prisma/client';

const SORTABLE = ['name', 'quantity', 'cost', 'type', 'createdAt'];

// ─── Inventory Items ────────────────────────────────────
export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.type) where.type = query.type as InventoryType;
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { sku: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    // Low stock filter — items where quantity <= reorderPoint
    // Prisma can't compare columns, so we apply it post-query or use raw SQL
    let data: any[];
    let total: number;

    if (query.lowStock === 'true') {
        const allLow = await prisma.$queryRaw<any[]>`
      SELECT * FROM inventory_items WHERE quantity <= "reorderPoint" ORDER BY quantity ASC LIMIT ${take} OFFSET ${skip}
    `;
        const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count FROM inventory_items WHERE quantity <= "reorderPoint"
    `;
        data = allLow;
        total = Number(countResult[0]?.count || 0);
    } else {
        [data, total] = await Promise.all([
            prisma.inventoryItem.findMany({ where, skip, take, orderBy, include: { supplier: { select: { id: true, name: true } } } }),
            prisma.inventoryItem.count({ where }),
        ]);
    }

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
            supplier: true,
            stockMovements: { take: 20, orderBy: { createdAt: 'desc' } },
        },
    });
    if (!item) throw createError(404, 'Inventory item not found');
    return item;
};

export const create = async (data: CreateInventoryInput) => {
    const { supplierId, expiryDate, bom, ...rest } = data;
    return prisma.inventoryItem.create({
        data: {
            ...rest,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            bom: bom as any,
            ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
        },
        include: { supplier: { select: { id: true, name: true } } },
    });
};

export const update = async (id: string, data: Partial<CreateInventoryInput>) => {
    await getById(id);
    const { supplierId, expiryDate, bom, ...rest } = data;
    return prisma.inventoryItem.update({
        where: { id },
        data: {
            ...rest,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            bom: bom as any,
            ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
        },
    });
};

export const remove = async (id: string) => {
    await getById(id);
    return prisma.inventoryItem.delete({ where: { id } });
};

export const recordTransaction = async (itemId: string, input: StockTransactionInput, userId?: string) => {
    const item = await getById(itemId);

    return prisma.$transaction(async (tx) => {
        let newQuantity = item.quantity;
        if (input.type === 'IN') newQuantity += input.quantity;
        else if (input.type === 'OUT') {
            if (item.quantity < input.quantity) throw createError(400, 'Insufficient stock');
            newQuantity -= input.quantity;
        } else {
            // ADJUSTMENT: set to exact value
            newQuantity = input.quantity;
        }

        await tx.inventoryItem.update({ where: { id: itemId }, data: { quantity: newQuantity } });

        return tx.inventoryTransaction.create({
            data: {
                type: input.type,
                quantity: input.quantity,
                reason: input.reason,
                reference: input.reference,
                itemId,
                userId,
            },
        });
    });
};

export const listTransactions = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);

    const where: Record<string, unknown> = {};
    if (query.itemId) where.itemId = query.itemId;
    if (query.type) where.type = query.type;
    if (query.dateFrom || query.dateTo) {
        where.createdAt = {
            ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
            ...(query.dateTo && { lte: new Date(query.dateTo) }),
        };
    }

    const [data, total] = await Promise.all([
        prisma.inventoryTransaction.findMany({
            where, skip, take, orderBy: { createdAt: 'desc' },
            include: { item: { select: { id: true, name: true, sku: true } } },
        }),
        prisma.inventoryTransaction.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

// ─── Suppliers ──────────────────────────────────────────
export const listSuppliers = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);

    const where: Record<string, unknown> = {};
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.supplier.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
        prisma.supplier.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const createSupplier = async (data: CreateSupplierInput) => {
    return prisma.supplier.create({ data });
};

export const updateSupplier = async (id: string, data: Partial<CreateSupplierInput>) => {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw createError(404, 'Supplier not found');
    return prisma.supplier.update({ where: { id }, data });
};

export const deleteSupplier = async (id: string) => {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw createError(404, 'Supplier not found');
    return prisma.supplier.delete({ where: { id } });
};
