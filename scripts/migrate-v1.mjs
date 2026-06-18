import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = fs.readFileSync(
  path.join(__dirname, '../drizzle/migrate-v1.sql'),
  'utf8',
);

try {
  await pool.query(sql);
  console.log('V1 migration applied: emails + contacts');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await pool.end();
}
