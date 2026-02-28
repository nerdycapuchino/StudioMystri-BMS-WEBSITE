import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateLeadInput, UpdateLeadInput } from './lead.schema';
import { LeadStage } from '@prisma/client';
import * as customerService from '../customers/customer.service';
import { logger } from '../../config/logger';

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
        } as any,
    });
};

export const update = async (id: string, data: UpdateLeadInput) => {
    await getById(id);
    return prisma.lead.update({
        where: { id },
        data: {
            ...data,
            expectedClose: data.expectedClose ? new Date(data.expectedClose) : undefined,
        } as any,
    });
};

// ── STAGE UPDATE WITH CLOSED_WON HOOK (Phase 3) ─────────
export const updateStage = async (id: string, stage: LeadStage, changedById?: string) => {
    const lead = await getById(id);
    const previousStage = lead.stage;

    // Update lead stage
    const updatedLead = await prisma.lead.update({ where: { id }, data: { stage } });

    // Log stage change in history
    if (changedById) {
        try {
            await prisma.leadStageHistory.create({
                data: {
                    leadId: id,
                    fromStage: previousStage,
                    toStage: stage,
                    changedById,
                },
            });
        } catch (e) {
            logger.warn('Failed to log stage history', e);
        }
    }

    // ── CLOSED_WON HOOK: Lead → Client Sync ──
    if (stage === 'CLOSED_WON' && previousStage !== 'CLOSED_WON') {
        try {
            const result = await customerService.createFromLead({
                id: lead.id,
                companyName: lead.companyName,
                pocName: lead.pocName,
                email: lead.email,
                phone: lead.phone,
                gstin: lead.gstin,
                source: lead.source,
                type: lead.type,
                value: lead.value,
            });
            logger.info(`Lead ${id} → Client sync: ${result.event} (clientId: ${result.client.id})`);
            return { ...updatedLead, _clientSync: result };
        } catch (e) {
            // Lead stage change succeeds even if client creation fails
            logger.error(`Lead ${id} → Client sync FAILED`, e);
            return { ...updatedLead, _clientSyncError: (e as Error).message };
        }
    }

    return updatedLead;
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
                    ...(lead.email ? [{ email: lead.email }] : []),
                    ...(lead.phone ? [{ phone: lead.phone }] : []),
                ].filter(Boolean),
            }
        });

        if (!customer) {
            customer = await tx.customer.create({
                data: {
                    name: lead.companyName,
                    contactName: lead.pocName || undefined,
                    email: lead.email,
                    phone: lead.phone,
                    gstin: lead.gstin,
                    gstNumber: lead.gstin,
                    createdFromLeadId: lead.id,
                    firstTouchSource: lead.source || lead.type,
                    conversionSource: `Lead:${lead.type}`,
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

        // 3. Update Lead to CLOSED_WON (fixed from legacy 'WON')
        await tx.lead.update({
            where: { id },
            data: { stage: 'CLOSED_WON' }
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
