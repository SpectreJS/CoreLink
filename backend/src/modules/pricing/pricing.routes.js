import { Router } from 'express';
import { z } from 'zod';
import { database } from '../../config/database.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../../middlewares/authenticate.js';
import { HttpError } from '../../middlewares/httpError.js';

const router = Router();
const keys = ['exchange_cny_mga', 'air_express', 'sea_lcl'];
const updateSchema = z.object({
  sourceCurrency: z.string().trim().length(3).optional(),
  targetCurrency: z.string().trim().length(3).optional(),
  rate: z.coerce.number().positive().optional(),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().trim().length(3).optional(),
  minimumBillable: z.coerce.number().positive().optional(),
  deliveryDays: z.string().trim().min(1).max(40),
  status: z.enum(['active', 'inactive']),
  effectiveDate: z.string().date().optional(),
}).strict();

const selectSql = `
  SELECT setting_key AS settingKey, source_currency AS sourceCurrency,
    target_currency AS targetCurrency, rate, amount, currency,
    minimum_billable AS minimumBillable, delivery_days AS deliveryDays,
    status, effective_date AS effectiveDate, updated_at AS updatedAt
  FROM pricing_settings
`;

export const publicPricingRouter = Router();

publicPricingRouter.get('/exchange-rate', asyncHandler(async (request, response) => {
  const [rows] = await database.execute(`${selectSql} WHERE setting_key = 'exchange_cny_mga' AND status = 'active' LIMIT 1`);
  response.set('Cache-Control', 'no-store');
  response.json({ data: rows[0] ? publicSetting(rows[0]) : null });
}));

function publicSetting(row) {
  return row ? {
    ...row,
    rate: row.rate == null ? null : Number(row.rate),
    amount: row.amount == null ? null : Number(row.amount),
    minimumBillable: row.minimumBillable == null ? null : Number(row.minimumBillable),
  } : null;
}

function requireKey(value) {
  if (!keys.includes(value)) throw new HttpError(400, 'Tarif invalide.');
  return value;
}

router.use(authenticate, requireRole('admin', 'manager'));

router.get('/', asyncHandler(async (request, response) => {
  const [rows] = await database.execute(`${selectSql} ORDER BY id`);
  response.json({ data: rows.map(publicSetting) });
}));

router.patch('/:key', asyncHandler(async (request, response) => {
  const key = requireKey(request.params.key);
  const parsed = updateSchema.safeParse(request.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues.map((issue) => issue.message).join(' '));
  const fields = parsed.data;
  const [existing] = await database.execute(`${selectSql} WHERE setting_key = ? LIMIT 1`, [key]);
  if (!existing.length) throw new HttpError(404, 'Tarif introuvable.');

  const current = existing[0];
  if (key !== 'exchange_cny_mga' && !fields.effectiveDate) {
    throw new HttpError(400, 'La date d’application est obligatoire pour ce tarif.');
  }
  const next = {
    sourceCurrency: fields.sourceCurrency ?? current.sourceCurrency,
    targetCurrency: fields.targetCurrency ?? current.targetCurrency,
    rate: fields.rate ?? current.rate,
    amount: fields.amount ?? current.amount,
    currency: fields.currency ?? current.currency,
    minimumBillable: fields.minimumBillable ?? current.minimumBillable,
    deliveryDays: fields.deliveryDays,
    status: fields.status,
    effectiveDate: fields.effectiveDate || current.effectiveDate,
  };
  await database.execute(
    `UPDATE pricing_settings SET source_currency = ?, target_currency = ?, rate = ?,
      amount = ?, currency = ?, minimum_billable = ?, delivery_days = ?,
      status = ?, effective_date = IF(? = 'exchange_cny_mga', CURRENT_DATE, ?), updated_by = ? WHERE setting_key = ?`,
    [
      next.sourceCurrency || null, next.targetCurrency || null, next.rate || null,
      next.amount || null, next.currency || null, next.minimumBillable || null,
      next.deliveryDays, next.status, key, next.effectiveDate, request.admin.id, key,
    ],
  );
  const [updated] = await database.execute(`${selectSql} WHERE setting_key = ? LIMIT 1`, [key]);
  response.json({ data: publicSetting(updated[0]) });
}));

export default router;
