/**
 * Parse pagination query params into Prisma skip/take values.
 */
export function paginate(query: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;
    return { skip, take: limit, page, limit };
}

/**
 * Build a standard paginated response.
 */
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
    return {
        success: true as const,
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Parse sort query params into Prisma orderBy.
 */
export function parseSort(
    sortBy?: string,
    order?: string,
    allowedFields: string[] = ['createdAt']
): Record<string, 'asc' | 'desc'> {
    const field = sortBy && allowedFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = order === 'asc' ? 'asc' : 'desc';
    return { [field]: direction };
}
