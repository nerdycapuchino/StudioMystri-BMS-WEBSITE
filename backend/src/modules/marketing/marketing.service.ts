import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateCampaignInput } from './marketing.schema';

const SORTABLE = ['name', 'channel', 'status', 'conversionRate', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.search) where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }];
    const [data, total] = await Promise.all([prisma.campaign.findMany({ where, skip, take, orderBy }), prisma.campaign.count({ where })]);
    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => { const c = await prisma.campaign.findUnique({ where: { id } }); if (!c) throw createError(404, 'Campaign not found'); return c; };
export const create = async (data: CreateCampaignInput) => prisma.campaign.create({ data: { ...data, audience: data.audience as any } });
export const update = async (id: string, data: Partial<CreateCampaignInput>) => { await getById(id); return prisma.campaign.update({ where: { id }, data: { ...data, audience: data.audience as any } }); };
export const updateStatus = async (id: string, status: string) => { await getById(id); return prisma.campaign.update({ where: { id }, data: { status } }); };
export const remove = async (id: string) => { await getById(id); return prisma.campaign.delete({ where: { id } }); };

export const getStats = async () => {
    const [active, total] = await Promise.all([
        prisma.campaign.count({ where: { status: 'Active' } }),
        prisma.campaign.count(),
    ]);
    return { activeCampaigns: active, totalCampaigns: total };
};
