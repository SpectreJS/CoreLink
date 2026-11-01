import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url(),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit contenir au moins 32 caractères.'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  COOKIE_SECURE: z.string().default('false').transform((value) => value === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Configuration backend invalide :\n${details}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
