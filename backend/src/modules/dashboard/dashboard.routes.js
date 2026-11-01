import { Router } from 'express';
import { database } from '../../config/database.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../../middlewares/authenticate.js';
import { parcelStatuses, parcelTransportModes } from '../parcels/parcel.constants.js';

const router = Router();
const allowedPeriods = new Map([
  ['7d', 7],
  ['30d', 30],
  ['3m', 90],
  ['12m', 365],
]);

router.use(authenticate, requireRole('admin', 'manager', 'operator', 'viewer'));

router.get('/', asyncHandler(async (request, response) => {
  const days = allowedPeriods.get(String(request.query.period || '7d')) || 7;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - days * 2);
  const toSqlDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
  const startDate = toSqlDate(start);
  const previousStartDate = toSqlDate(previousStart);
  const nowDate = toSqlDate(now);
  const [statsRows] = await database.execute(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'received') AS pending,
      SUM(status IN ('air_transit', 'sea_transit')) AS inTransit,
      SUM(status = 'delivered') AS delivered,
      SUM(status = 'delayed') AS delayedCount,
      SUM(created_at >= ?) AS currentPeriod
     FROM parcels`,
    [startDate],
  );
  const [previousRows] = await database.execute(
    `SELECT COUNT(*) AS total
     FROM parcels
     WHERE created_at >= ? AND created_at < ?`,
    [previousStartDate, startDate],
  );
  const [trendRows] = await database.execute(
    `SELECT DATE(created_at) AS date, COUNT(*) AS value
     FROM parcels
    WHERE created_at >= ? AND created_at <= ?
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [startDate, nowDate],
  );
  const [statusRows] = await database.execute(
    `SELECT status AS categoryKey, COUNT(*) AS value
     FROM parcels
    WHERE created_at >= ? AND created_at <= ?
     GROUP BY status
     ORDER BY value DESC`,
    [startDate, nowDate],
  );
  const [modeRows] = await database.execute(
    `SELECT transport_mode AS categoryKey, COUNT(*) AS value
     FROM parcels
    WHERE created_at >= ? AND created_at <= ?
     GROUP BY transport_mode
     ORDER BY value DESC`,
    [startDate, nowDate],
  );
  const [latestRows] = await database.execute(
    `SELECT id, serial_number AS serialNumber, tracking_number AS trackingNumber,
      description, customer_name AS customerName, origin, destination,
      transport_mode AS transportMode, status, created_at AS registeredAt
     FROM parcels ORDER BY created_at DESC, id DESC LIMIT 10`,
  );
  const stats = statsRows[0];
  const previousTotal = Number(previousRows[0]?.total || 0);
  const currentTotal = Number(stats.currentPeriod || 0);
  const changePercent = previousTotal === 0
    ? null
    : Number((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1));

  response.json({
    data: {
      period: days,
      stats: {
        total: Number(stats.total || 0),
        pending: Number(stats.pending || 0),
        inTransit: Number(stats.inTransit || 0),
        delivered: Number(stats.delivered || 0),
        delayed: Number(stats.delayedCount || 0),
        changePercent,
      },
      trend: trendRows.map((row) => ({ date: row.date, value: Number(row.value) })),
      byStatus: statusRows.map((row) => ({ key: row.categoryKey, value: Number(row.value) })),
      byTransport: modeRows.map((row) => ({ key: row.categoryKey, value: Number(row.value) })),
      latest: latestRows,
      statusLabels: Object.fromEntries(parcelStatuses.map(({ value, label }) => [value, label])),
      transportLabels: Object.fromEntries(parcelTransportModes.map(({ value, label }) => [value, label])),
    },
  });
}));

export default router;
