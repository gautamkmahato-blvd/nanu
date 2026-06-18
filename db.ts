// db.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './db/schema';

const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool(): Pool {
  if (!process.env.POSTGRES_DATABASE_URL) {
    throw new Error('POSTGRES_DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', (err) => {
    console.error('[db] pool error:', err.message);
  });

  return pool;
}

export const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });