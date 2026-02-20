import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateInvoiceInput } from './invoice.schema';
import { InvoiceStatus } from '@prisma/client';

const SORTABLE = ['invoiceNumber', 'total', 'status', 'createdAt', 'dueDate'];

const generateInvoiceNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
        where: { invoiceNumber: { startsWith: `INV-${year}` } },
    });
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status as InvoiceStatus;
    if (query.search) {
        where.OR = [
            { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.invoice.findMany({ where, skip, take, orderBy, include: { customer: { select: { id: true, name: true } } } }),
        prisma.invoice.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            order: true,
            transactions: true,
        },
    });
    if (!invoice) throw createError(404, 'Invoice not found');
    return invoice;
};

export const create = async (input: CreateInvoiceInput) => {
    const invoiceNumber = await generateInvoiceNumber();

    const items = input.items.map(i => ({
        ...i,
        amount: i.quantity * i.unitPrice,
    }));

    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const taxRate = input.taxRate ?? 18;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const deliveryCost = input.deliveryCost || 0;
    const total = subtotal + taxAmount + deliveryCost;

    return prisma.invoice.create({
        data: {
            invoiceNumber,
            items: items as any,
            subtotal,
            taxAmount,
            taxRate,
            total,
            status: 'DRAFT',
            type: input.type || 'INCOME',
            currency: input.currency || 'INR',
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            notes: input.notes,
            customerId: input.customerId,
            orderId: input.orderId,
            // Seller/Buyer
            sellerName: input.sellerName,
            sellerAddress: input.sellerAddress,
            sellerGst: input.sellerGst,
            buyerAddress: input.buyerAddress,
            shippingAddress: input.shippingAddress,
            paymentMode: input.paymentMode,
            referenceNo: input.referenceNo,
            termsOfDelivery: input.termsOfDelivery,
            declaration: input.declaration,
            // Bank
            bankName: input.bankName,
            accountNo: input.accountNo,
            ifsc: input.ifsc,
            branch: input.branch,
            // Delivery
            deliveryType: input.deliveryType,
            deliveryCost,
        },
        include: { customer: { select: { id: true, name: true } } },
    });
};

export const updateStatus = async (id: string, status: InvoiceStatus) => {
    await getById(id);

    const updateData: Record<string, unknown> = { status };

    // If paid, set paidAmount = total
    if (status === 'PAID') {
        const invoice = await prisma.invoice.findUnique({ where: { id }, select: { total: true } });
        if (invoice) updateData.paidAmount = invoice.total;
    }

    return prisma.invoice.update({ where: { id }, data: updateData });
};
