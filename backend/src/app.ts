import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { httpLogger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

const app = express();

// ─── Security ───────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── HTTP Request Logging ───────────────────────────────
app.use(httpLogger);

// ─── Static Files (uploads) ────────────────────────────
app.use('/uploads', express.static(env.UPLOAD_DIR));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── Global Error Handler ───────────────────────────────
app.use(errorHandler);

export default app;
