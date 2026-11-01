import bcrypt from 'bcryptjs';
import { database } from '../config/database.js';

const seedMarker = 'SEED-CORELINK-2026';
const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'CoreLinkSeed2026!';

const descriptions = [
  ['Accessoires électroniques', 'Électronique'],
  ['Pièces automobiles', 'Automobile'],
  ['Vêtements', 'Mode'],
  ['Matériel informatique', 'Informatique'],
  ['Articles ménagers', 'Maison'],
  ['Équipements industriels', 'Divers'],
  ['Accessoires téléphoniques', 'Électronique'],
  ['Produits cosmétiques', 'Divers'],
];
const origins = ['Guangzhou, Chine', 'Shenzhen, Chine', 'Yiwu, Chine', 'Shanghai, Chine'];
const destinations = ['Antananarivo, Madagascar', 'Toamasina, Madagascar', 'Mahajanga, Madagascar', 'Antsirabe, Madagascar'];
const transportModes = ['air_regular', 'air_express', 'sea_lcl'];
const statuses = ['received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed'];
const customers = Array.from({ length: 18 }, (_, index) => ({
  name: `Client test ${String(index + 1).padStart(2, '0')}`,
  email: `seed-client-${String(index + 1).padStart(2, '0')}@corelink.test`,
  phone: `+261 34 00 ${String(index + 1).padStart(2, '2')} 00`,
}));
const adminProfiles = [
  { name: 'Super Admin Seed', email: 'seed-super-admin@corelink.test', role: 'admin' },
  { name: 'Administrateur Seed 01', email: 'seed-admin-01@corelink.test', role: 'manager' },
  { name: 'Administrateur Seed 02', email: 'seed-admin-02@corelink.test', role: 'manager' },
  { name: 'Éditeur Seed 01', email: 'seed-editor-01@corelink.test', role: 'operator' },
  { name: 'Éditeur Seed 02', email: 'seed-editor-02@corelink.test', role: 'operator' },
];

function calculateDimensions(index) {
  const length = 20 + ((index * 7) % 80);
  const width = 15 + ((index * 5) % 55);
  const height = 10 + ((index * 3) % 40);
  const volume = Number(((length * width * height) / 1000000).toFixed(3));
  const volumetricWeight = Number(((length * width * height) / 5000).toFixed(2));
  return { length, width, height, volume, volumetricWeight };
}

async function assertTables(connection) {
  const [tables] = await connection.query("SHOW TABLES LIKE 'admin_users'");
  if (!tables.length) throw new Error("La table 'admin_users' est absente.");
  const [parcelTables] = await connection.query("SHOW TABLES LIKE 'parcels'");
  if (!parcelTables.length) throw new Error("La table 'parcels' est absente.");
}

async function seedAdmins(connection) {
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  let inserted = 0;
  for (const profile of adminProfiles) {
    const [existing] = await connection.execute('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [profile.email]);
    if (existing.length) continue;
    await connection.execute(
      `INSERT INTO admin_users
        (name, email, phone, password_hash, role, is_active, account_status)
       VALUES (?, ?, ?, ?, ?, TRUE, 'active')`,
      [profile.name, profile.email, '+261 34 00 00 00', passwordHash, profile.role],
    );
    inserted += 1;
  }
  return inserted;
}

async function findSeederActor(connection) {
  const [rows] = await connection.execute(
    "SELECT id FROM admin_users WHERE account_status = 'active' AND is_active = TRUE ORDER BY id LIMIT 1",
  );
  if (!rows.length) throw new Error('Aucun administrateur actif disponible pour created_by/updated_by.');
  return rows[0].id;
}

async function seedParcels(connection, actorId) {
  let inserted = 0;
  for (let index = 1; index <= 50; index += 1) {
    const sequence = String(index).padStart(4, '0');
    const trackingNumber = `${seedMarker}-${sequence}`;
    const [existing] = await connection.execute(
      'SELECT id FROM parcels WHERE tracking_number = ? LIMIT 1',
      [trackingNumber],
    );
    if (existing.length) continue;

    const [description, category] = descriptions[(index - 1) % descriptions.length];
    const dimensions = calculateDimensions(index);
    const weight = Number((0.5 + ((index * 13.7) % 199.5)).toFixed(2));
    const customer = customers[(index - 1) % customers.length];
    const transportMode = transportModes[(index - 1) % transportModes.length];
    const status = statuses[(index - 1) % statuses.length];

    await connection.execute(
      `INSERT INTO parcels (
        tracking_number, description, category, package_count, seal_number,
        weight, length, width, height, volume_cbm, volumetric_weight,
        customer_name, recipient_name, phone, email, tax_id, origin, destination,
        transport_mode, status, notes, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingNumber,
        description,
        category,
        1 + ((index * 3) % 20),
        `${seedMarker}-SEAL-${sequence}`,
        weight,
        dimensions.length,
        dimensions.width,
        dimensions.height,
        dimensions.volume,
        dimensions.volumetricWeight,
        customer.name,
        `Destinataire ${sequence}`,
        customer.phone,
        customer.email,
        `${seedMarker}-${sequence}`,
        origins[(index - 1) % origins.length],
        destinations[(index - 1) % destinations.length],
        transportMode,
        status,
        `${seedMarker} - données de test uniquement`,
        actorId,
        actorId,
      ],
    );
    inserted += 1;
  }
  return inserted;
}

async function main() {
  const connection = await database.getConnection();
  try {
    await assertTables(connection);
    await connection.beginTransaction();
    const adminsInserted = await seedAdmins(connection);
    const actorId = await findSeederActor(connection);
    const parcelsInserted = await seedParcels(connection, actorId);
    await connection.commit();
    console.log(`Profils de test insérés : ${adminsInserted}`);
    console.log(`Colis de test insérés : ${parcelsInserted}`);
    console.log('Clients de test : intégrés dans les champs client des colis; aucune table customers n’existe dans ce schéma.');
    console.log('Réexécution sûre : les profils et colis portant les marqueurs seed sont ignorés s’ils existent déjà.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await database.end();
  }
}

main().catch((error) => {
  console.error(`Échec du seeding : ${error.message}`);
  process.exitCode = 1;
});
