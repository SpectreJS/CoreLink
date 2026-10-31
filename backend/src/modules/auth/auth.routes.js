import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { env, isProduction } from '../../config/env.js';
import { database } from '../../config/database.js';
import { authenticate, cookieName } from '../../middlewares/authenticate.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { HttpError } from '../../middlewares/httpError.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'TOO_MANY_ATTEMPTS', message: 'Trop de tentatives. Réessayez plus tard.' },
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post('/login', loginLimiter, asyncHandler(async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) throw new HttpError(400, 'Identifiants invalides.');

  const [users] = await database.execute(
    'SELECT id, name, email, password_hash, role, is_active FROM admin_users WHERE email = ? LIMIT 1',
    [parsed.data.email.toLowerCase()],
  );
  const user = users[0];
  const validPassword = user ? await bcrypt.compare(parsed.data.password, user.password_hash) : false;
  if (!user || !validPassword || !user.is_active) {
    throw new HttpError(401, 'E-mail ou mot de passe incorrect.');
  }

  const token = jwt.sign(
    { role: user.role },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: String(user.id),
      issuer: 'corelink-api',
      audience: 'corelink-admin',
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
  response.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api',
    maxAge: 15 * 60 * 1000,
  });
  response.json({ user: publicUser(user) });
}));

router.get('/me', authenticate, asyncHandler(async (request, response) => {
  const [users] = await database.execute(
    'SELECT id, name, email, role, is_active FROM admin_users WHERE id = ? LIMIT 1',
    [request.admin.id],
  );
  const user = users[0];
  if (!user || !user.is_active) throw new HttpError(401, 'Compte désactivé.');
  response.json({ user: publicUser(user) });
}));

router.post('/logout', authenticate, (request, response) => {
  response.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api',
  });
  response.status(204).end();
});

export default router;
