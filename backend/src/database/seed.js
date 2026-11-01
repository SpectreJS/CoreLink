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
  await connection.query(`CREATE TABLE IF NOT EXISTS pricing_settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    setting_key VARCHAR(40) NOT NULL,
    source_currency VARCHAR(3) NULL,
    target_currency VARCHAR(3) NULL,
    rate DECIMAL(14,4) NULL,
    amount DECIMAL(14,2) NULL,
    currency VARCHAR(3) NULL,
    minimum_billable DECIMAL(14,3) NULL,
    delivery_days VARCHAR(40) NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    effective_date DATE NOT NULL,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pricing_settings_key (setting_key),
    CONSTRAINT fk_pricing_settings_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.query(`CREATE TABLE IF NOT EXISTS parcel_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parcel_id BIGINT UNSIGNED NOT NULL,
    previous_status ENUM('received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed') NULL,
    new_status ENUM('received', 'air_transit', 'sea_transit', 'customs_clearance', 'ready_for_pickup', 'delivered', 'delayed') NOT NULL,
    comment VARCHAR(500) NULL,
    changed_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_parcel_status_history_parcel (parcel_id, created_at),
    CONSTRAINT fk_parcel_status_history_parcel FOREIGN KEY (parcel_id) REFERENCES parcels (id) ON DELETE CASCADE,
    CONSTRAINT fk_parcel_status_history_admin FOREIGN KEY (changed_by) REFERENCES admin_users (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
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
    const trackingNumber = `CL-${sequence}`;
    const [existing] = await connection.execute(
      'SELECT id FROM parcels WHERE tax_id = ? LIMIT 1',
      [`${seedMarker}-${sequence}`],
    );
    if (existing.length) continue;

    const [description, category] = descriptions[(index - 1) % descriptions.length];
    const dimensions = calculateDimensions(index);
    const weight = Number((0.5 + ((index * 13.7) % 199.5)).toFixed(2));
    const customer = customers[(index - 1) % customers.length];
    const transportMode = transportModes[(index - 1) % transportModes.length];
    const status = statuses[(index - 1) % statuses.length];
    const [counterRows] = await connection.execute(
      'SELECT next_value AS nextValue FROM parcel_serial_counter WHERE id = 1 FOR UPDATE',
    );
    if (!counterRows.length) throw new Error('Compteur de numéros de série non initialisé. Lancez npm run migrate.');
    const serialNumber = `CL-${String(Number(counterRows[0].nextValue)).padStart(4, '0')}`;
    await connection.execute('UPDATE parcel_serial_counter SET next_value = next_value + 1 WHERE id = 1');

    await connection.execute(
      `INSERT INTO parcels (
        tracking_number, serial_number, description, category, package_count, seal_number,
        weight, length, width, height, volume_cbm, volumetric_weight,
        customer_name, recipient_name, phone, email, tax_id, origin, destination,
        transport_mode, status, notes, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        trackingNumber,
        serialNumber,
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

async function seedPricing(connection, actorId) {
  const defaults = [
    ['exchange_cny_mga', 'CNY', 'MGA', 660, null, null, null, 'Application immédiate', 'active'],
    ['air_express', null, null, null, 75000, 'MGA', 1, '5 à 7 jours', 'active'],
    ['sea_lcl', null, null, null, 365, 'USD', 0.1, '35 à 45 jours', 'active'],
  ];
  let inserted = 0;
  for (const setting of defaults) {
    const [existing] = await connection.execute('SELECT id FROM pricing_settings WHERE setting_key = ? LIMIT 1', [setting[0]]);
    if (existing.length) continue;
    await connection.execute(
      `INSERT INTO pricing_settings
        (setting_key, source_currency, target_currency, rate, amount, currency,
         minimum_billable, delivery_days, status, effective_date, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?)`,
      [...setting, actorId],
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
    const pricingInserted = await seedPricing(connection, actorId);
    const parcelsInserted = await seedParcels(connection, actorId);
    await connection.commit();
    console.log(`Profils de test insérés : ${adminsInserted}`);
    console.log(`Colis de test insérés : ${parcelsInserted}`);
    console.log(`Lignes tarifaires initialisées : ${pricingInserted}`);
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
