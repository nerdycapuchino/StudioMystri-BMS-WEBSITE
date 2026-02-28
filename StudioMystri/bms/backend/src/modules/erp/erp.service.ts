import prisma from '../../config/db';
import { paginate, paginatedResponse } from '../../utils/pagination';
import { CreatePOInput } from './erp.schema';

export const listPurchaseOrders = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const where: Record<string, unknown> = { type: 'IN' };
    if (query.supplierId) {
        const items = await prisma.inventoryItem.findMany({ where: { supplierId: query.supplierId }, select: { id: true } });
        where.itemId = { in: items.map(i => i.id) };
    }
    const [data, total] = await Promise.all([
        prisma.inventoryTransaction.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { item: { include: { supplier: { select: { id: true, name: true } } } } } }),
        prisma.inventoryTransaction.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const createPurchaseOrder = async (input: CreatePOInput) => {
    return prisma.$transaction(async (tx) => {
        const item = await tx.inventoryItem.findUnique({ where: { id: input.itemId } });
        if (!item) throw new Error('Inventory item not found');

        await tx.inventoryItem.update({ where: { id: input.itemId }, data: { quantity: { increment: input.quantity }, cost: input.unitCost, supplierId: input.supplierId } });

        const reference = `PO-${Date.now()}`;

        // Create Finance Transaction (Automated)
        await tx.transaction.create({
            data: {
                type: 'EXPENSE',
                category: 'Inventory',
                amount: input.quantity * input.unitCost,
                description: `Purchase Order for ${item.name}`,
                reference: reference,
                date: new Date(),
            }
        });

        return tx.inventoryTransaction.create({
            data: { type: 'IN', quantity: input.quantity, reason: `Purchase Order`, reference, itemId: input.itemId },
            include: { item: { select: { id: true, name: true } } },
        });
    });
};

export const getStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [purchasesThisMonth, lowStock] = await Promise.all([
        prisma.inventoryTransaction.findMany({ where: { type: 'IN', createdAt: { gte: startOfMonth } }, include: { item: true } }),
        prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*)::int as count FROM inventory_items WHERE quantity <= "reorderPoint"`.then(r => Number(r[0]?.count || 0)).catch(() => 0),
    ]);

    const totalSpend = purchasesThisMonth.reduce((s, t) => s + (t.quantity * (t.item?.cost || 0)), 0);

    // Top suppliers by spend
    const supplierSpend: Record<string, { name: string; spend: number }> = {};
    for (const t of purchasesThisMonth) {
        const sid = t.item?.supplierId;
        if (sid) {
            if (!supplierSpend[sid]) supplierSpend[sid] = { name: '', spend: 0 };
            supplierSpend[sid].spend += t.quantity * (t.item?.cost || 0);
        }
    }

    return { totalSpendThisMonth: totalSpend, lowStockCount: lowStock, topSuppliers: Object.values(supplierSpend).sort((a, b) => b.spend - a.spend).slice(0, 5) };
};
