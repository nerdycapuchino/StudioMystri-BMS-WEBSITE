import './instrument';
import { app, httpServer } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const start = async () => {
    try {
        httpServer.listen(env.PORT, () => {
            logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
            logger.info(`📡 API base: http://localhost:${env.PORT}/api/v1`);
            logger.info(`❤️  Health:   http://localhost:${env.PORT}/api/v1/health`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

start();
