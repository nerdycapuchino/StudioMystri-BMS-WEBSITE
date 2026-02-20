import winston from 'winston';
import morgan from 'morgan';
import { env } from './env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Winston Logger
export const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    defaultMeta: { service: 'studio-mystri-api' },
    transports: [
        // Console transport (always)
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                logFormat
            ),
        }),
    ],
});

// File transports for production
if (env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        })
    );
}

// Morgan stream piped to Winston
export const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Morgan middleware
export const httpLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream: morganStream }
);
