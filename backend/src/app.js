import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { requireTrustedBrowserOrigin } from './middlewares/browserOrigin.js';
import { errorHandler, HttpError } from './middlewares/httpError.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === env.WEB_ORIGIN) return callback(null, true);
    return callback(new HttpError(403, 'Origine non autorisée.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(requireTrustedBrowserOrigin);

app.get('/api/health', (request, response) => response.json({ status: 'ok' }));
app.use('/api', apiRoutes);
app.use((request, response, next) => next(new HttpError(404, 'Route API introuvable.')));
app.use(errorHandler);

export default app;
