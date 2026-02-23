import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateLeadInput, UpdateLeadInput } from './lead.schema';
import { LeadStage } from '@prisma/client';

const SORTABLE = ['companyName', 'value', 'stage', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.stage) where.stage = query.stage as LeadStage;
    if (query.assignedTo) where.assignedToId = query.assignedTo;
    if (query.search) {
        where.OR = [
            { companyName: { contains: query.search, mode: 'insensitive' } },
            { pocName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.lead.findMany({ where, skip, take, orderBy, include: { assignedTo: { select: { id: true, name: true } } } }),
        prisma.lead.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const lead = await prisma.lead.findUnique({
        where: { id },
        include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
    });
    if (!lead) throw createError(404, 'Lead not found');
    return lead;
};

export const create = async (data: CreateLeadInput) => {
    return prisma.lead.create({
        data: {
            ...data,
            expectedClose: data.expectedClose ? new Date(data.expectedClose) : undefined,
        },
    });
};

export const update = async (id: string, data: UpdateLeadInput) => {
    await getById(id);
    return prisma.lead.update({
        where: { id },
        data: {
            ...data,
            expectedClose: data.expectedClose ? new Date(data.expectedClose) : undefined,
        },
    });
};

export const updateStage = async (id: string, stage: LeadStage) => {
    await getById(id);
    return prisma.lead.update({ where: { id }, data: { stage } });
};

export const remove = async (id: string) => {
    await getById(id);
    return prisma.lead.delete({ where: { id } });
};

export const convertToProject = async (id: string) => {
    return prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({ where: { id } });
        if (!lead) throw createError(404, 'Lead not found');

        // 1. Ensure Customer exists
        let customer = await tx.customer.findFirst({
            where: {
                OR: [
                    { email: lead.email || undefined },
                    { phone: lead.phone || undefined }
                ]
            }
        });

        if (!customer) {
            customer = await tx.customer.create({
                data: {
                    name: lead.companyName,
                    email: lead.email,
                    phone: lead.phone,
                    gstin: lead.gstin,
                }
            });
        }

        // 2. Create Project
        const project = await tx.project.create({
            data: {
                name: `${lead.companyName} - New Project`,
                description: lead.requirements || lead.brief,
                budget: lead.value || 0,
                customerId: customer.id,
                stage: 'CONCEPT',
                currentStage: 'CONCEPT',
                stages: ['CONCEPT', 'DESIGN', 'PROCUREMENT', 'EXECUTION', 'HANDOVER'],
            }
        });

        // 3. Update Lead
        await tx.lead.update({
            where: { id },
            data: { stage: 'WON' }
        });

        return project;
    });
};

export const getPipeline = async () => {
    const stages = await prisma.lead.groupBy({
        by: ['stage'],
        _count: { id: true },
        _sum: { value: true },
    });

    return stages.map(s => ({
        stage: s.stage,
        count: s._count.id,
        totalValue: s._sum.value || 0,
    }));
};
