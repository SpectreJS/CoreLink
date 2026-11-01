import mysql from 'mysql2/promise';
import { env } from './env.js';

export const database = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  charset: 'utf8mb4',
  timezone: 'Z',
});

export async function verifyDatabaseConnection() {
  const connection = await database.getConnection();
  connection.release();
}
