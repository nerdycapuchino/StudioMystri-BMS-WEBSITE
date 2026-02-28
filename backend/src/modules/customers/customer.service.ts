import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';

const SORTABLE = ['name', 'email', 'totalSpent', 'totalOrders', 'createdAt', 'status', 'tier', 'primarySource', 'outstandingBalance'];

// Fields Prisma knows about
const ALLOWED_FIELDS = [
    'name', 'contactName', 'email', 'phone', 'company',
    'gstNumber', 'primarySource', 'secondarySource',
    'firstTouchSource', 'lastTouchSource', 'conversionSource',
    'createdFromLeadId', 'tier',
    'address', 'shippingAddress', 'gstin',
    'totalOrders', 'totalSpent', 'outstandingBalance',
    'creditLimit', 'paymentTerms',
    'tags', 'notes', 'status',
];

const toPrismaData = (input: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
        if (key in input && input[key] !== undefined) {
            result[key] = input[key];
        }
    }
    return result;
};

// Generate client code like CLI-0001, CLI-0002, ...
const generateClientCode = async (): Promise<string> => {
    const last = await prisma.customer.findFirst({
        where: { clientCode: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { clientCode: true },
    });
    let seq = 1;
    if (last?.clientCode) {
        const match = last.clientCode.match(/CLI-(\d+)/);
        if (match) seq = parseInt(match[1], 10) + 1;
    }
    return `CLI-${String(seq).padStart(4, '0')}`;
};

// ── LIST ─────────────────────────────────────────────────
export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = { isDeleted: false };

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { contactName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
            { gstNumber: { contains: query.search, mode: 'insensitive' } },
            { clientCode: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    if (query.status && query.status !== 'All') where.status = query.status;
    if (query.tier) where.tier = query.tier;
    if (query.primarySource) where.primarySource = query.primarySource;

    const [data, total] = await Promise.all([
        prisma.customer.findMany({ where, skip, take, orderBy }),
        prisma.customer.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

// ── GET BY ID ────────────────────────────────────────────
export const getById = async (id: string) => {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            orders: { take: 10, orderBy: { createdAt: 'desc' } },
            invoices: { take: 10, orderBy: { createdAt: 'desc' } },
            projects: { take: 10, orderBy: { createdAt: 'desc' } },
            channelHistory: { take: 20, orderBy: { timestamp: 'desc' } },
        },
    });
    if (!customer) throw createError(404, 'Customer not found');
    if (customer.isDeleted) throw createError(404, 'Customer not found');
    return customer;
};

// ── CREATE ───────────────────────────────────────────────
export const create = async (data: CreateCustomerInput) => {
    const prismaData = toPrismaData(data as Record<string, unknown>);
    if (!prismaData.name) throw createError(400, 'Company name is required');

    const clientCode = await generateClientCode();

    return prisma.customer.create({
        data: { ...prismaData, clientCode } as any,
    });
};

// ── UPDATE ───────────────────────────────────────────────
export const update = async (id: string, data: UpdateCustomerInput, userRole?: string) => {
    const existing = await getById(id);

    // RBAC: SALES cannot change primarySource
    if (userRole === 'SALES' && data && 'primarySource' in (data as any)) {
        throw createError(403, 'Sales role cannot modify primary source');
    }

    const prismaData = toPrismaData(data as Record<string, unknown>);
    return prisma.customer.update({ where: { id }, data: prismaData as any });
};

// ── SOFT DELETE ──────────────────────────────────────────
export const softDelete = async (id: string, userId?: string) => {
    await getById(id);
    return prisma.customer.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId || null, status: 'Inactive' },
    });
};

// ── DUPLICATE CHECK ──────────────────────────────────────
export const checkDuplicates = async (data: { email?: string; phone?: string; gstNumber?: string; name?: string }) => {
    const matches: Array<{ customer: any; confidence: number; matchField: string }> = [];

    // Exact email match
    if (data.email) {
        const emailMatch = await prisma.customer.findFirst({
            where: { email: { equals: data.email, mode: 'insensitive' }, isDeleted: false },
        });
        if (emailMatch) matches.push({ customer: emailMatch, confidence: 95, matchField: 'email' });
    }

    // Exact phone match
    if (data.phone) {
        const normalized = data.phone.replace(/[\s\-()]/g, '');
        const phoneMatch = await prisma.customer.findFirst({
            where: { phone: { contains: normalized.slice(-10) }, isDeleted: false },
        });
        if (phoneMatch) matches.push({ customer: phoneMatch, confidence: 90, matchField: 'phone' });
    }

    // Exact GST match
    if (data.gstNumber) {
        const gstMatch = await prisma.customer.findFirst({
            where: {
                OR: [
                    { gstNumber: { equals: data.gstNumber, mode: 'insensitive' } },
                    { gstin: { equals: data.gstNumber, mode: 'insensitive' } },
                ],
                isDeleted: false,
            },
        });
        if (gstMatch) matches.push({ customer: gstMatch, confidence: 95, matchField: 'gstNumber' });
    }

    // Fuzzy company name (simple contains for now, Levenshtein in Phase 2)
    if (data.name && data.name.length >= 3) {
        const nameMatches = await prisma.customer.findMany({
            where: { name: { contains: data.name, mode: 'insensitive' }, isDeleted: false },
            take: 5,
        });
        for (const nm of nameMatches) {
            // Don't double-count if already matched by other fields
            if (!matches.some(m => m.customer.id === nm.id)) {
                matches.push({ customer: nm, confidence: 70, matchField: 'name' });
            }
        }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches;
};

// ── MERGE ────────────────────────────────────────────────
export const mergeClients = async (primaryId: string, mergedId: string, mergedById: string) => {
    if (primaryId === mergedId) throw createError(400, 'Cannot merge a client with itself');

    const primary = await getById(primaryId);
    const merged = await getById(mergedId);

    // Transfer orders, invoices, projects, shipments to primary
    await prisma.$transaction([
        prisma.order.updateMany({ where: { customerId: mergedId }, data: { customerId: primaryId } }),
        prisma.invoice.updateMany({ where: { customerId: mergedId }, data: { customerId: primaryId } }),
        prisma.project.updateMany({ where: { customerId: mergedId }, data: { customerId: primaryId } }),
        prisma.shipment.updateMany({ where: { customerId: mergedId }, data: { customerId: primaryId } }),
        // Mark merged as merged
        prisma.customer.update({
            where: { id: mergedId },
            data: { isMerged: true, isDeleted: true, deletedAt: new Date(), deletedBy: mergedById },
        }),
        // Log the merge
        prisma.clientMergeLog.create({
            data: { primaryClientId: primaryId, mergedClientId: mergedId, mergedById },
        }),
    ]);

    // Recalculate primary's stats
    await recalculateStats(primaryId);

    return getById(primaryId);
};

// ── STATS ────────────────────────────────────────────────
export const getStats = async () => {
    const [totalClients, activeClients, totals] = await Promise.all([
        prisma.customer.count({ where: { isDeleted: false } }),
        prisma.customer.count({ where: { isDeleted: false, status: 'Active' } }),
        prisma.customer.aggregate({
            where: { isDeleted: false },
            _sum: { totalSpent: true, outstandingBalance: true },
        }),
    ]);

    return {
        totalClients,
        activeClients,
        totalLTV: totals._sum?.totalSpent || 0,
        totalOutstanding: totals._sum?.outstandingBalance || 0,
    };
};

// ── RECALCULATE STATS ────────────────────────────────────
export const recalculateStats = async (customerId: string) => {
    const [orderCount, spentAgg] = await Promise.all([
        prisma.order.count({ where: { customerId } }),
        prisma.order.aggregate({
            where: { customerId },
            _sum: { totalAmount: true },
        }),
    ]);
    await prisma.customer.update({
        where: { id: customerId },
        data: {
            totalOrders: orderCount,
            totalSpent: spentAgg._sum.totalAmount || 0,
        },
    });
};

// ── CHANNEL HISTORY ──────────────────────────────────────
export const getChannelHistory = async (clientId: string) => {
    return prisma.clientChannelHistory.findMany({
        where: { clientId },
        orderBy: { timestamp: 'desc' },
    });
};
