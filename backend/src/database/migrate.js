import { database } from '../config/database.js';

async function migrateTrackingNumbers(connection) {
  await connection.query(`CREATE TABLE IF NOT EXISTS parcel_tracking_counter (
    id TINYINT UNSIGNED NOT NULL,
    next_value INT UNSIGNED NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB`);
  const [rows] = await connection.query('SELECT id, tracking_number FROM parcels ORDER BY id ASC');
  if (rows.length > 9999) {
    throw new Error('Impossible de générer des numéros CL-XXXX pour plus de 9999 colis.');
  }
  const alreadyMigrated = rows.every(({ tracking_number }) => /^CL-\d{4}$/.test(tracking_number || ''));
  if (!alreadyMigrated) {
    for (const [index, row] of rows.entries()) {
      await connection.execute('UPDATE parcels SET tracking_number = ? WHERE id = ?', [`TMP${String(index + 1).padStart(10, '0')}`, row.id]);
    }
    for (const [index, row] of rows.entries()) {
      const trackingNumber = `CL-${String(index + 1).padStart(4, '0')}`;
      await connection.execute('UPDATE parcels SET tracking_number = ? WHERE id = ?', [trackingNumber, row.id]);
    }
  }
  await connection.query('ALTER TABLE parcels MODIFY COLUMN tracking_number VARCHAR(7) NOT NULL');
  try {
    await connection.query('ALTER TABLE parcels ADD UNIQUE KEY uq_parcels_tracking_number (tracking_number)');
  } catch (error) {
    if (error.code !== 'ER_DUP_KEYNAME') throw error;
  }
  const nextValue = rows.reduce((highest, row) => {
    const match = /^CL-(\d{4})$/.exec(row.tracking_number || '');
    return match ? Math.max(highest, Number(match[1]) + 1) : highest;
  }, 1);
  await connection.execute(
    `INSERT INTO parcel_tracking_counter (id, next_value) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, ?)`,
    [nextValue, nextValue],
  );
}

async function addColumnAndIndex(connection) {
  try {
    await connection.query('ALTER TABLE parcels ADD COLUMN serial_number VARCHAR(32) NULL AFTER tracking_number');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') throw error;
  }
  try {
    await connection.query('ALTER TABLE parcels ADD UNIQUE KEY uq_parcels_serial_number (serial_number)');
  } catch (error) {
    if (error.code !== 'ER_DUP_KEYNAME') throw error;
  }
  await connection.query(`CREATE TABLE IF NOT EXISTS parcel_serial_counter (
    id TINYINT UNSIGNED NOT NULL,
    next_value INT UNSIGNED NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB`);
  await connection.query(`CREATE TABLE IF NOT EXISTS parcel_tracking_counter (
    id TINYINT UNSIGNED NOT NULL,
    next_value INT UNSIGNED NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB`);
}

async function backfillSerialNumbers(connection) {
  const [rows] = await connection.query('SELECT id, serial_number FROM parcels ORDER BY id ASC');
  const used = new Set();
  let highest = 0;
  for (const row of rows) {
    if (!row.serial_number) continue;
    used.add(row.serial_number);
    const match = /^CL-(\d+)$/.exec(row.serial_number);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  let next = highest + 1;
  for (const row of rows) {
    if (row.serial_number) continue;
    let serialNumber;
    do {
      serialNumber = `CL-${String(next).padStart(4, '0')}`;
      next += 1;
    } while (used.has(serialNumber));
    await connection.execute('UPDATE parcels SET serial_number = ? WHERE id = ?', [serialNumber, row.id]);
    used.add(serialNumber);
  }
  await connection.execute(
    `INSERT INTO parcel_serial_counter (id, next_value) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE next_value = GREATEST(next_value, ?)`,
    [next, next],
  );
  return rows.length;
}

async function main() {
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    await migrateTrackingNumbers(connection);
    await addColumnAndIndex(connection);
    const count = await backfillSerialNumbers(connection);
    await connection.commit();
    console.log(`Numéros de série prêts pour ${count} colis.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await database.end();
  }
}

main().catch((error) => {
  console.error(`Échec de la migration des identifiants colis : ${error.message}`);
  process.exitCode = 1;
});
