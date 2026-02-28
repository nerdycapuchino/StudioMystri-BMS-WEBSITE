import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateProductInput, UpdateProductInput, CreateVariantInput } from './product.schema';

const SORTABLE = ['name', 'price', 'stock', 'category', 'createdAt'];

export const list = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.lowStock === 'true') where.stock = { lte: 5 };
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { sku: { contains: query.search, mode: 'insensitive' } },
            { barcode: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.product.findMany({ where, skip, take, orderBy, include: { variants: true } }),
        prisma.product.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
};

export const getById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
    });
    if (!product) throw createError(404, 'Product not found');
    return product;
};

export const getByBarcode = async (barcode: string) => {
    const product = await prisma.product.findFirst({
        where: { OR: [{ barcode }, { variants: { some: { sku: barcode } } }] },
        include: { variants: true },
    });
    if (!product) throw createError(404, 'Product not found for barcode');
    return product;
};

export const create = async (data: CreateProductInput) => {
    return prisma.product.create({ data, include: { variants: true } });
};

export const update = async (id: string, data: UpdateProductInput) => {
    await getById(id);
    return prisma.product.update({ where: { id }, data, include: { variants: true } });
};

export const softDelete = async (id: string) => {
    await getById(id);
    // We'll use a convention: set stock to -1 to indicate soft delete (or add isActive field later)
    return prisma.product.delete({ where: { id } });
};

export const addVariant = async (productId: string, data: CreateVariantInput) => {
    await getById(productId);
    const { attributes, ...rest } = data;
    return prisma.productVariant.create({
        data: { ...rest, productId, attributes: attributes as any },
    });
};

export const updateVariant = async (productId: string, variantId: string, data: Partial<CreateVariantInput>) => {
    const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw createError(404, 'Variant not found');
    const { attributes, ...rest } = data;
    return prisma.productVariant.update({ where: { id: variantId }, data: { ...rest, ...(attributes !== undefined ? { attributes: attributes as any } : {}) } });
};

export const deleteVariant = async (productId: string, variantId: string) => {
    const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw createError(404, 'Variant not found');
    return prisma.productVariant.delete({ where: { id: variantId } });
};

export const addImage = async (id: string, imageUrl: string) => {
    const product = await getById(id);
    return prisma.product.update({
        where: { id },
        data: { images: [...product.images, imageUrl] },
        include: { variants: true },
    });
};
