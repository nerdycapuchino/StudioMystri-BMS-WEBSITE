import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { httpLogger } from './config/logger';
import { apiRouter } from './routes';
import rateLimit from 'express-rate-limit';
import { socketAuthMiddleware } from './socket/socketAuth';
import { registerSocketHandlers } from './socket/socketHandlers';

import * as Sentry from '@sentry/node';

const app = express();
const httpServer = createServer(app);

export const io = new SocketIOServer(httpServer, {
    cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

io.use(socketAuthMiddleware);
registerSocketHandlers(io);

app.set('trust proxy', 1);

// ─── Security ───────────────────────────────────────────
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
    }
}));

// ─── CORS ───────────────────────────────────────────────
const allowedOrigins = [env.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            // AND dynamically allow typical local network development IPs
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                origin.startsWith('http://192.168.') ||
                origin.startsWith('http://10.') ||
                origin.startsWith('http://172.')
            ) {
                callback(null, true);
            } else {
                // For production, strictly enforce allowedOrigins
                callback(null, true); // TEMPORARILY allow all for smooth development
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ─── HTTP Request Logging ───────────────────────────────
app.use(httpLogger);

// ─── Static Files (uploads) ────────────────────────────
app.use('/uploads', express.static(env.UPLOAD_DIR));

// ─── API Routes ─────────────────────────────────────────

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/v1', apiLimiter);

// Health endpoint is now standardized at /api/v1/health via apiRouter

app.use('/api/v1', apiRouter);

// ─── Global Error Handler ───────────────────────────────
Sentry.setupExpressErrorHandler(app);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Something went wrong'
            : message,
    });
});

export { app, httpServer };
