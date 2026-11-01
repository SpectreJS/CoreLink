import { env } from '../config/env.js';
import { HttpError } from './httpError.js';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function requireTrustedBrowserOrigin(request, response, next) {
  if (!unsafeMethods.has(request.method)) return next();
  if (request.get('origin') !== env.WEB_ORIGIN) {
    return next(new HttpError(403, 'Origine de requête non autorisée.'));
  }
  return next();
}
