import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'STATUS_CHANGE' | 'CONVERT_TO_PROJECT';

/**
 * Log an activity to the ActivityLog table.
 * Fire-and-forget: errors are logged but do not propagate.
 */
export async function logActivity(
    prisma: PrismaClient,
    userId: string | null | undefined,
    module: string,
    action: ActionType,
    entityId?: string | null,
    details?: Record<string, unknown>,
    ip?: string | string[]
): Promise<void> {
    try {
        await prisma.activityLog.create({
            data: {
                userId: userId || undefined,
                module,
                action,
                entityId: entityId || undefined,
                entityType: module,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                details: (details || undefined) as any,
                ipAddress: Array.isArray(ip) ? ip[0] : ip || undefined,
            },
        });
    } catch (error) {
        logger.error('Failed to log activity:', error);
    }
}
