import { trackingRecords } from '../data/trackingRecords.js';

export function normalizeTrackingCode(value) {
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code) && code.length <= 64
    ? code
    : null;
}

export async function findTrackingRecord(code, signal) {
  if (signal?.aborted) {
    const error = new Error('Recherche annulée.');
    error.name = 'AbortError';
    throw error;
  }

  const normalizedCode = normalizeTrackingCode(code);
  if (!normalizedCode) return null;

  const record = trackingRecords.find(
    (item) => normalizeTrackingCode(item.trackingNumber) === normalizedCode,
  );
  if (!record) return null;
  if (record.publicTracking !== true) {
    throw new Error("Vous n'êtes pas autorisé à consulter ce colis.");
  }

  const publicRecord = { ...record };
  delete publicRecord.publicTracking;
  return publicRecord;
}
