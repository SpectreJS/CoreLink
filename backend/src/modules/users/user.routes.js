import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { database } from '../../config/database.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../../middlewares/authenticate.js';
import { HttpError } from '../../middlewares/httpError.js';

const router = Router();
const roles = ['admin', 'manager', 'operator', 'viewer'];
const accountStatuses = ['active', 'inactive', 'suspended'];
const passwordSchema = z.string().min(6).max(128);
const baseSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  role: z.enum(roles),
  status: z.enum(accountStatuses),
}).strict();
const createSchema = baseSchema.extend({ password: passwordSchema });
const updateSchema = baseSchema.partial().extend({ password: passwordSchema.optional() })
  .refine((value) => Object.keys(value).length > 0, 'Au moins un champ doit être fourni.');
const deleteManySchema = z.object({
  ids: z.array(z.string().regex(/^[1-9]\d*$/).max(20)).min(1).max(100),
}).strict();

const selectUserSql = `
  SELECT id, name, email, phone, role, account_status AS status,
    is_active AS isActive, last_login_at AS lastLoginAt, created_at AS createdAt
  FROM admin_users
`;

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || value.length > 20) throw new HttpError(400, 'Identifiant administrateur invalide.');
  return value;
}

function publicUser(row) {
  return row ? { ...row, id: String(row.id), isActive: Boolean(row.isActive) } : null;
}

async function findUser(id) {
  const [rows] = await database.execute(`${selectUserSql} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function countActiveAdmins() {
  const [rows] = await database.execute(
    "SELECT COUNT(*) AS total FROM admin_users WHERE role = 'admin' AND account_status = 'active' AND is_active = TRUE",
  );
  return Number(rows[0].total);
}

function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) throw new HttpError(400, result.error.issues.map((issue) => issue.message).join(' '));
  return result.data;
}

router.use(authenticate, requireRole('admin'));

router.get('/', asyncHandler(async (request, response) => {
  const [rows] = await database.execute(`${selectUserSql} ORDER BY created_at DESC, id DESC`);
  response.json({ data: rows.map(publicUser), meta: { total: rows.length } });
}));

router.get('/:id', asyncHandler(async (request, response) => {
  const id = parseId(request.params.id);
  const user = await findUser(id);
  if (!user) throw new HttpError(404, 'Administrateur introuvable.');
  response.json({ data: publicUser(user) });
}));

router.post('/', asyncHandler(async (request, response) => {
  const fields = validateBody(createSchema, request.body);
  const passwordHash = await bcrypt.hash(fields.password, 12);
  try {
    const [result] = await database.execute(
      `INSERT INTO admin_users (name, email, phone, password_hash, role, is_active, account_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fields.name, fields.email.toLowerCase(), fields.phone || null, passwordHash, fields.role, fields.status === 'active', fields.status],
    );
    response.status(201).json({ data: publicUser(await findUser(String(result.insertId))) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Cette adresse e-mail est déjà utilisée.');
    throw error;
  }
}));

router.patch('/:id', asyncHandler(async (request, response) => {
  const id = parseId(request.params.id);
  const current = await findUser(id);
  if (!current) throw new HttpError(404, 'Administrateur introuvable.');
  const fields = validateBody(updateSchema, request.body);
  const nextStatus = fields.status ?? current.status;
  const nextRole = fields.role ?? current.role;
  if (String(id) === String(request.admin.id) && nextStatus !== 'active') {
    throw new HttpError(400, 'Vous ne pouvez pas désactiver votre propre compte.');
  }
  if (current.role === 'admin' && current.status === 'active' && (nextRole !== 'admin' || nextStatus !== 'active')) {
    if (await countActiveAdmins() <= 1) throw new HttpError(400, 'Le dernier Super Administrateur ne peut pas être désactivé ou rétrogradé.');
  }
  const updates = {
    name: fields.name ?? current.name,
    email: fields.email ? fields.email.toLowerCase() : current.email,
    phone: fields.phone === undefined ? current.phone : fields.phone,
    role: nextRole,
    status: nextStatus,
    isActive: nextStatus === 'active',
  };
  const values = [updates.name, updates.email, updates.phone || null, updates.role, updates.isActive, updates.status];
  let sql = 'UPDATE admin_users SET name = ?, email = ?, phone = ?, role = ?, is_active = ?, account_status = ?';
  if (fields.password) {
    sql += ', password_hash = ?';
    values.push(await bcrypt.hash(fields.password, 12));
  }
  values.push(id);
  try {
    await database.execute(`${sql} WHERE id = ?`, values);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Cette adresse e-mail est déjà utilisée.');
    throw error;
  }
  response.json({ data: publicUser(await findUser(id)) });
}));

router.delete('/:id', asyncHandler(async (request, response) => {
  const id = parseId(request.params.id);
  const current = await findUser(id);
  if (!current) throw new HttpError(404, 'Administrateur introuvable.');
  if (String(id) === String(request.admin.id)) throw new HttpError(400, 'Vous ne pouvez pas supprimer votre propre compte.');
  if (current.role === 'admin' && current.status === 'active' && await countActiveAdmins() <= 1) {
    throw new HttpError(400, 'Le dernier Super Administrateur ne peut pas être supprimé.');
  }
  await database.execute('DELETE FROM admin_users WHERE id = ?', [id]);
  response.status(204).end();
}));

router.delete('/', asyncHandler(async (request, response) => {
  const parsed = deleteManySchema.safeParse(request.body);
  if (!parsed.success) throw new HttpError(400, 'La liste des identifiants est invalide.');
  const ids = [...new Set(parsed.data.ids)];
  if (ids.some((id) => String(id) === String(request.admin.id))) {
    throw new HttpError(400, 'Vous ne pouvez pas supprimer votre propre compte.');
  }
  const placeholders = ids.map(() => '?').join(', ');
  const [admins] = await database.execute(
    `SELECT id FROM admin_users
     WHERE id IN (${placeholders}) AND role = 'admin' AND account_status = 'active' AND is_active = TRUE`,
    ids,
  );
  if (admins.length && await countActiveAdmins() - admins.length < 1) {
    throw new HttpError(400, 'Le dernier Super Administrateur ne peut pas être supprimé.');
  }
  const [result] = await database.execute(`DELETE FROM admin_users WHERE id IN (${placeholders})`, ids);
  response.json({ deletedCount: result.affectedRows, ids });
}));

export default router;
