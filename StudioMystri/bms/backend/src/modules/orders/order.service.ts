import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateOrderInput, OrderItemInput } from './order.schema';
import { OrderStatus } from '@prisma/client';

const SORTABLE = ['orderNumber', 'totalAmount', 'orderStatus', 'createdAt'];

// Generate order number: ORD-YYYY-NNNN
const generateOrderNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const count = await prisma.order.count({
        where: { orderNumber: { startsWith: `ORD-${year}` } },
    });
    return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.status) where.orderStatus = query.status as OrderStatus;
    if (query.customerId) where.customerId = query.customerId;
    if (query.dateFrom || query.dateTo) {
        where.createdAt = {
            ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
            ...(query.dateTo && { lte: new Date(query.dateTo) }),
        };
    }
    if (query.search) {
        where.OR = [
            { orderNumber: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.order.findMany({ where, skip, take, orderBy, include: { customer: { select: { id: true, name: true } } } }),
        prisma.order.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            invoice: true,
            items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
    });
    if (!order) throw createError(404, 'Order not found');
    return order;
};

export const create = async (input: CreateOrderInput) => {
    const orderNumber = await generateOrderNumber();

    return prisma.$transaction(async (tx) => {
        // 1. Validate stock for each item
        const enrichedItems: Array<OrderItemInput & { name: string }> = [];
        for (const item of input.items) {
            if (item.variantId) {
                const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
                if (!variant) throw createError(404, `Variant ${item.variantId} not found`);
                if (variant.stock < item.quantity) throw createError(400, `Insufficient stock for variant ${variant.name}`);
                enrichedItems.push({ ...item, name: variant.name });
            } else {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw createError(404, `Product ${item.productId} not found`);
                if (product.stockQuantity < item.quantity) throw createError(400, `Insufficient stock for ${product.name}`);
                enrichedItems.push({ ...item, name: product.name });
            }
        }

        // 2. Deduct stock
        for (const item of input.items) {
            if (item.variantId) {
                await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
            } else {
                await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
            }
        }

        // 3. Calculate totals
        const subtotal = enrichedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity - (i.discount || 0), 0);
        const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
        const discountAmount = input.discount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        // 4. Create order
        const order = await tx.order.create({
            data: {
                orderNumber,
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                orderStatus: 'COMPLETED',
                paymentStatus: 'PAID',
                paymentMethod: input.paymentMethod,
                currency: input.currency || 'INR',
                notes: input.notes,
                customerId: input.customerId,
                items: {
                    create: enrichedItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: Math.max(0, (item.unitPrice * item.quantity) - (item.discount || 0)),
                    })),
                },
            },
            include: {
                customer: { select: { id: true, name: true } },
                items: true,
            },
        });

        // 5. Create inventory transactions
        for (const item of enrichedItems) {
            await tx.inventoryTransaction.create({
                data: {
                    type: 'OUT',
                    quantity: item.quantity,
                    reason: 'Sale',
                    reference: order.orderNumber,
                    itemId: item.productId,
                },
            }).catch(() => { }); // Silently skip if no inventory item matches
        }

        // 6. Update customer stats
        if (input.customerId) {
            const customerOrders = await tx.order.findMany({ where: { customerId: input.customerId }, select: { totalAmount: true } });
            await tx.customer.update({
                where: { id: input.customerId },
                data: {
                    totalOrders: customerOrders.length,
                    totalSpent: customerOrders.reduce((s, o) => s + o.totalAmount, 0),
                },
            });
        }

        // 7. Create Finance Transaction (Automated)
        await tx.transaction.create({
            data: {
                type: 'INCOME',
                category: 'Sales',
                amount: order.totalAmount,
                description: `Sale: Order ${order.orderNumber}`,
                reference: order.orderNumber,
                date: new Date(),
            }
        });

        return order;
    });
};

export const updateStatus = async (id: string, status: OrderStatus) => {
    const order = await getById(id);

    if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
        // Reverse stock deductions
        return prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } }).catch(() => { });
                // Record reverse inventory transaction
                await tx.inventoryTransaction.create({
                    data: { type: 'IN', quantity: item.quantity, reason: 'Order Cancelled', reference: order.orderNumber, itemId: item.productId },
                }).catch(() => { });
                }
            return tx.order.update({ where: { id }, data: { orderStatus: status } });
        });
    }

    return prisma.order.update({ where: { id }, data: { orderStatus: status } });
};
