import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET must be at least 10 characters'),
    JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters'),
    PORT: z.string().default('5000').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    UPLOAD_DIR: z.string().default('./uploads'),
    SENTRY_DSN: z.string().optional(),

    // Razorpay
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

    // SMTP (Hostinger)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default('465').transform(Number),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('noreply@studiomystri.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
