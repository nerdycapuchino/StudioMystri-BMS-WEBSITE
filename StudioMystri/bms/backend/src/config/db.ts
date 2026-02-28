import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ]
        : [{ emit: 'event', level: 'error' }],
});

// Log queries in development
if (env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query} — Duration: ${e.duration}ms`);
    });
}

prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
});

export default prisma;
