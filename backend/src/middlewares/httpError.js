export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error('Erreur API non gérée.', error);
  response.status(status).json({
    error: status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
    message: status >= 500 ? 'Une erreur serveur est survenue.' : error.message,
  });
}
