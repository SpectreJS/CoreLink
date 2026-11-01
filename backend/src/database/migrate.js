import { database } from '../config/database.js';

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
  console.error(`Échec de la migration des numéros de série : ${error.message}`);
  process.exitCode = 1;
});
