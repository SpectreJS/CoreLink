import { Router } from 'express';
import { database } from '../../config/database.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { HttpError } from '../../middlewares/httpError.js';
import { parcelStatuses, parcelTransportModes } from './parcel.constants.js';

const router = Router();

function normalizeTrackingNumber(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!/^CL-\d{4}$/.test(normalized)) {
    throw new HttpError(400, 'Le numéro de suivi doit respecter le format CL-0001.');
  }
  return normalized;
}

function progressForStatus(status) {
  const progressByStatus = {
    received: 10,
    air_transit: 45,
    sea_transit: 45,
    customs_clearance: 70,
    ready_for_pickup: 90,
    delivered: 100,
    delayed: 45,
  };
  return progressByStatus[status] || 0;
}

router.get('/:trackingNumber', asyncHandler(async (request, response) => {
  const trackingNumber = normalizeTrackingNumber(request.params.trackingNumber);
  const [rows] = await database.execute(
    `SELECT id, tracking_number AS trackingNumber, serial_number AS serialNumber,
      customer_name AS customerName, origin, destination, transport_mode AS transportMode,
      status, created_at AS registeredAt, updated_at AS updatedAt
     FROM parcels WHERE tracking_number = ? LIMIT 1`,
    [trackingNumber],
  );
  const parcel = rows[0];
  if (!parcel) throw new HttpError(404, 'Aucun colis trouvé avec ce numéro de suivi. Vérifiez votre saisie.');

  const [historyRows] = await database.execute(
    `SELECT h.id, h.previous_status AS previousStatus, h.new_status AS newStatus,
      h.created_at AS createdAt
     FROM parcel_status_history h
     WHERE h.parcel_id = ? ORDER BY h.created_at ASC, h.id ASC`,
    [parcel.id],
  );
  const statusLabel = parcelStatuses.find((item) => item.value === parcel.status)?.label || parcel.status;
  const transportLabel = parcelTransportModes.find((item) => item.value === parcel.transportMode)?.label || parcel.transportMode;
  const events = historyRows.map((event) => ({
    id: String(event.id),
    title: parcelStatuses.find((item) => item.value === event.newStatus)?.label || event.newStatus,
    status: event.newStatus,
    date: event.createdAt,
    description: 'Mise à jour du statut de livraison.',
  }));

  response.json({
    data: {
      trackingNumber: parcel.trackingNumber,
      serialNumber: parcel.serialNumber,
      customerName: parcel.customerName,
      origin: parcel.origin,
      destination: parcel.destination,
      transportMode: parcel.transportMode,
      freightType: transportLabel,
      status: statusLabel,
      statusKey: parcel.status,
      registeredAt: parcel.registeredAt,
      updatedAt: parcel.updatedAt,
      events,
      progress: progressForStatus(parcel.status),
    },
  });
}));

export default router;
