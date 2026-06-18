// scripts/run-multi-tenant.mjs
// Runs the multi-tenant migration SQL against the database.
//
// Usage: node scripts/run-multi-tenant.mjs
//
// Uses POSTGRES_DATABASE_URL from .env (loaded via dotenv).

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.POSTGRES_DATABASE_URL,
});

const sqlPath = path.join(__dirname, 'migrate-multi-tenant.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('[migrate] Running multi-tenant migration...');

try {
  await pool.query(sql);
  console.log('[migrate] ✓ Multi-tenant migration complete.');
  console.log('[migrate]   - emails: tenant_id added');
  console.log('[migrate]   - contacts: tenant_id added, PK updated');
  console.log('[migrate]   - ai_conversations: tenant_id added');
  console.log('[migrate]   - ai_chat_messages: tenant_id added');
  console.log('[migrate]   - priority_contacts: tenant_id added');
  console.log('[migrate]   - notification_settings: tenant_id added');
  console.log('[migrate]   - meeting_prep_cache: tenant_id added');
} catch (error) {
  console.error('[migrate] ✗ Migration failed:', error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await pool.end();
}
