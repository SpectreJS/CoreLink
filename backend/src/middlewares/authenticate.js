import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './httpError.js';

const cookieName = 'corelink_admin_session';

export function authenticate(request, response, next) {
  const token = request.cookies?.[cookieName];
  if (!token) return next(new HttpError(401, 'Authentification requise.'));

  try {
    const claims = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'corelink-api',
      audience: 'corelink-admin',
    });
    if (typeof claims.sub !== 'string' || typeof claims.role !== 'string') {
      throw new Error('Claims de session invalides.');
    }
    request.admin = { id: claims.sub, role: claims.role };
    return next();
  } catch {
    return next(new HttpError(401, 'Session invalide ou expirée.'));
  }
}

export function requireRole(...roles) {
  return function roleGuard(request, response, next) {
    if (!request.admin || !roles.includes(request.admin.role)) {
      return next(new HttpError(403, 'Permission insuffisante.'));
    }
    return next();
  };
}

export { cookieName };
