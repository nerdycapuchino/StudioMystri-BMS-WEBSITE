import prisma from '../../config/db';

export const getStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
        revenueAgg, expenseAgg,
        ordersToday, ordersMonth,
        activeProjects, lowStock,
        pendingInvoices, activeLeads, totalCustomers
    ] = await Promise.all([
        prisma.transaction.aggregate({ where: { type: 'INCOME', date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { type: 'EXPENSE', date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.project.count({ where: { stage: { notIn: ['COMPLETED'] } } }),
        prisma.inventoryItem.count({ where: { quantity: { lte: prisma.inventoryItem.fields.reorderPoint as any } } })
            .catch(() => 0), // Fallback: raw query below
        prisma.invoice.count({ where: { status: { in: ['SENT', 'OVERDUE'] } } }),
        prisma.lead.count({ where: { stage: { notIn: ['WON', 'LOST'] } } }),
        prisma.customer.count(),
    ]);

    // Separate low stock query since Prisma can't compare two columns directly
    const lowStockCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM inventory_items WHERE quantity <= "reorderPoint"
  `.then(r => Number(r[0]?.count || 0)).catch(() => 0);

    const totalRevenue = revenueAgg._sum.amount || 0;
    const totalExpenses = expenseAgg._sum.amount || 0;

    return {
        totalRevenueThisMonth: totalRevenue,
        totalExpensesThisMonth: totalExpenses,
        netProfitThisMonth: totalRevenue - totalExpenses,
        totalOrdersToday: ordersToday,
        totalOrdersThisMonth: ordersMonth,
        activeProjects,
        lowStockItems: lowStockCount,
        pendingInvoices,
        activeLeads,
        totalCustomers,
    };
};

export const getRevenueChart = async (period: string) => {
    const now = new Date();
    let startDate: Date;
    let groupByMonth = false;

    switch (period) {
        case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break;
        case '90d': startDate = new Date(now.getTime() - 90 * 86400000); break;
        case '12m': startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); groupByMonth = true; break;
        default: startDate = new Date(now.getTime() - 30 * 86400000); break;
    }

    const transactions = await prisma.transaction.findMany({
        where: { date: { gte: startDate } },
        select: { type: true, amount: true, date: true },
        orderBy: { date: 'asc' },
    });

    const grouped: Record<string, { revenue: number; expenses: number }> = {};
    for (const t of transactions) {
        const key = groupByMonth
            ? `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`
            : t.date.toISOString().split('T')[0];
        if (!grouped[key]) grouped[key] = { revenue: 0, expenses: 0 };
        if (t.type === 'INCOME') grouped[key].revenue += t.amount;
        else grouped[key].expenses += t.amount;
    }

    return Object.entries(grouped).map(([date, vals]) => ({ date, ...vals }));
};

export const getRecentActivity = async () => {
    return prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
    });
};

export const getTopProducts = async () => {
    const orderItems = await prisma.orderItem.findMany({
        where: { order: { orderStatus: 'COMPLETED' } },
        select: {
            productId: true,
            quantity: true,
            product: { select: { name: true } },
        },
    });

    const productSales: Record<string, { name: string; quantity: number }> = {};
    for (const item of orderItems) {
        const id = item.productId;
        if (!productSales[id]) productSales[id] = { name: item.product?.name || 'Unknown', quantity: 0 };
        productSales[id].quantity += item.quantity || 1;
    }

    return Object.entries(productSales)
        .map(([id, data]) => ({ productId: id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
};
