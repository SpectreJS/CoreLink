import { Router } from 'express';
import { database } from '../../config/database.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../../middlewares/authenticate.js';
import { HttpError } from '../../middlewares/httpError.js';
import { parcelStatuses, parcelTransportModes } from './parcel.constants.js';
import {
  createParcelSchema,
  deleteParcelsSchema,
  updateParcelSchema,
} from './parcel.validation.js';

const router = Router();
const editableRoles = ['admin', 'manager', 'operator'];
const selectParcelSql = `
  SELECT
    id,
    tracking_number AS trackingNumber,
    serial_number AS serialNumber,
    description,
    category,
    package_count AS packageCount,
    seal_number AS sealNumber,
    weight,
    length,
    width,
    height,
    volume_cbm AS volume,
    volumetric_weight AS volumetricWeight,
    customer_name AS customerName,
    recipient_name AS recipientName,
    phone,
    email,
    tax_id AS taxId,
    origin,
    destination,
    transport_mode AS transportMode,
    status,
    notes,
    created_at AS registeredAt,
    updated_at AS updatedAt
  FROM parcels
`;

function requireParcelId(value) {
  if (!/^[1-9]\d*$/.test(value) || value.length > 20) {
    throw new HttpError(400, 'Identifiant colis invalide.');
  }
  return value;
}

function parcelResponse(row) {
  if (!row) return null;
  const status = parcelStatuses.find(({ value }) => value === row.status);
  return {
    ...row,
    id: String(row.id),
    packageCount: Number(row.packageCount),
    weight: Number(row.weight),
    length: Number(row.length),
    width: Number(row.width),
    height: Number(row.height),
    volume: Number(row.volume),
    volumetricWeight: Number(row.volumetricWeight),
    statusKey: row.status,
    statusLabel: status?.label || row.status,
  };
}

async function findParcel(id, executor = database) {
  const [rows] = await executor.execute(`${selectParcelSql} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function allocateSerialNumber(connection) {
  const [rows] = await connection.execute(
    'SELECT next_value AS nextValue FROM parcel_serial_counter WHERE id = 1 FOR UPDATE',
  );
  if (!rows.length) throw new HttpError(500, 'Compteur de numéros de série non initialisé.');
  const nextValue = Number(rows[0].nextValue);
  const serialNumber = `CL-${String(nextValue).padStart(4, '0')}`;
  await connection.execute('UPDATE parcel_serial_counter SET next_value = ? WHERE id = 1', [nextValue + 1]);
  return serialNumber;
}

function calculateDimensions(fields) {
  const volume = (fields.length * fields.width * fields.height) / 1000000;
  const volumetricWeight = (fields.length * fields.width * fields.height) / 5000;
  return {
    volume: Number(volume.toFixed(3)),
    volumetricWeight: Number(volumetricWeight.toFixed(2)),
  };
}

function validatedFields(schema, body) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(' ');
    throw new HttpError(400, message || 'Données colis invalides.');
  }
  return parsed.data;
}

router.use(authenticate, requireRole('admin', 'manager', 'operator', 'viewer'));

router.get('/statuses', (request, response) => {
  response.json({ data: parcelStatuses });
});

router.get('/transport-modes', (request, response) => {
  response.json({ data: parcelTransportModes });
});

router.get('/', asyncHandler(async (request, response) => {
  const [rows] = await database.execute(`${selectParcelSql} ORDER BY created_at DESC, id DESC`);
  response.json({ data: rows.map(parcelResponse), meta: { total: rows.length } });
}));

router.get('/:id/status-history', asyncHandler(async (request, response) => {
  const id = requireParcelId(request.params.id);
  const [rows] = await database.execute(
    `SELECT h.id, h.previous_status AS previousStatus, h.new_status AS newStatus,
      h.comment, h.created_at AS createdAt, u.name AS changedBy
     FROM parcel_status_history h
     JOIN admin_users u ON u.id = h.changed_by
     WHERE h.parcel_id = ? ORDER BY h.created_at ASC, h.id ASC`,
    [id],
  );
  response.json({
    data: rows.map((row) => ({
      ...row,
      previousLabel: parcelStatuses.find((status) => status.value === row.previousStatus)?.label || row.previousStatus,
      newLabel: parcelStatuses.find((status) => status.value === row.newStatus)?.label || row.newStatus,
    })),
  });
}));

router.get('/:id', asyncHandler(async (request, response) => {
  const id = requireParcelId(request.params.id);
  const parcel = await findParcel(id);
  if (!parcel) throw new HttpError(404, 'Colis introuvable.');
  response.json({ data: parcelResponse(parcel) });
}));

router.post('/', requireRole(...editableRoles), asyncHandler(async (request, response) => {
  const fields = validatedFields(createParcelSchema, request.body);
  const dimensions = calculateDimensions(fields);
  const connection = await database.getConnection();
  let newId;
  let serialNumber;
  try {
    await connection.beginTransaction();
    serialNumber = await allocateSerialNumber(connection);
    const [result] = await connection.execute(
      `INSERT INTO parcels (
        tracking_number, serial_number, description, category, package_count, seal_number,
        weight, length, width, height, volume_cbm, volumetric_weight,
        customer_name, recipient_name, phone, email, tax_id, origin, destination,
        transport_mode, status, notes, created_by, updated_by
      ) VALUES (
        NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?
      )`,
      [
        serialNumber,
        fields.description,
        fields.category,
        fields.packageCount,
        fields.sealNumber || null,
        fields.weight,
        fields.length,
        fields.width,
        fields.height,
        dimensions.volume,
        dimensions.volumetricWeight,
        fields.customerName,
        fields.recipientName || null,
        fields.phone,
        fields.email || null,
        fields.taxId || null,
        fields.origin,
        fields.destination,
        fields.transportMode,
        fields.notes || null,
        request.admin.id,
        request.admin.id,
      ],
    );
    newId = String(result.insertId);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const created = await findParcel(newId);
  response.status(201).json({ data: parcelResponse(created) });
}));

router.patch('/:id', requireRole(...editableRoles), asyncHandler(async (request, response) => {
  const id = requireParcelId(request.params.id);
  const fields = validatedFields(updateParcelSchema, request.body);
  const current = await findParcel(id);
  if (!current) throw new HttpError(404, 'Colis introuvable.');

  const merged = {
    description: fields.description ?? current.description,
    category: fields.category ?? current.category,
    packageCount: fields.packageCount ?? current.packageCount,
    sealNumber: fields.sealNumber === undefined ? current.sealNumber : fields.sealNumber,
    weight: fields.weight ?? current.weight,
    length: fields.length ?? current.length,
    width: fields.width ?? current.width,
    height: fields.height ?? current.height,
    customerName: fields.customerName ?? current.customerName,
    recipientName: fields.recipientName === undefined ? current.recipientName : fields.recipientName,
    phone: fields.phone ?? current.phone,
    email: fields.email === undefined ? current.email : fields.email,
    taxId: fields.taxId === undefined ? current.taxId : fields.taxId,
    origin: fields.origin ?? current.origin,
    destination: fields.destination ?? current.destination,
    transportMode: fields.transportMode ?? current.transportMode,
    status: fields.status ?? current.status,
    notes: fields.notes === undefined ? current.notes : fields.notes,
  };
  const dimensions = calculateDimensions(merged);

  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
    `UPDATE parcels SET
      description = ?, category = ?, package_count = ?, seal_number = ?,
      weight = ?, length = ?, width = ?, height = ?, volume_cbm = ?,
      volumetric_weight = ?, customer_name = ?, recipient_name = ?, phone = ?,
      email = ?, tax_id = ?, origin = ?, destination = ?, transport_mode = ?,
      status = ?, notes = ?, updated_by = ?
    WHERE id = ?`,
    [
      merged.description,
      merged.category,
      merged.packageCount,
      merged.sealNumber,
      merged.weight,
      merged.length,
      merged.width,
      merged.height,
      dimensions.volume,
      dimensions.volumetricWeight,
      merged.customerName,
      merged.recipientName,
      merged.phone,
      merged.email,
      merged.taxId,
      merged.origin,
      merged.destination,
      merged.transportMode,
      merged.status,
      merged.notes,
      request.admin.id,
      id,
      ],
    );
    if (merged.status !== current.status) {
      await connection.execute(
        `INSERT INTO parcel_status_history (parcel_id, previous_status, new_status, changed_by)
         VALUES (?, ?, ?, ?)`,
        [id, current.status, merged.status, request.admin.id],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const updated = await findParcel(id);
  response.json({ data: parcelResponse(updated) });
}));

router.delete('/bulk', requireRole(...editableRoles), asyncHandler(async (request, response) => {
  const parsed = deleteParcelsSchema.safeParse(request.body);
  if (!parsed.success) throw new HttpError(400, 'La liste des identifiants colis est invalide.');
  const ids = [...new Set(parsed.data.ids)];
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await database.execute(`DELETE FROM parcels WHERE id IN (${placeholders})`, ids);
  response.json({ deletedCount: result.affectedRows, ids });
}));

router.delete('/:id', requireRole(...editableRoles), asyncHandler(async (request, response) => {
  const id = requireParcelId(request.params.id);
  const [result] = await database.execute('DELETE FROM parcels WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new HttpError(404, 'Colis introuvable.');
  response.status(204).end();
}));

export default router;
