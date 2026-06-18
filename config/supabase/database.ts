import 'dotenv/config';

function projectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  return new URL(url).hostname.split('.')[0]!;
}

const STATEMENT_TIMEOUT_PARAM = 'options=-c%20statement_timeout%3D120s';

function withStatementTimeout(url: string): string {
  if (url.includes('statement_timeout')) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${STATEMENT_TIMEOUT_PARAM}`;
}

/** Postgres URL for Drizzle + Corsair. Prefers session pooler, then direct Supabase, then DATABASE_URL. */
export function getDatabaseUrl(): string {
  const sessionPooler = process.env.SUPABASE_SESSION_POOLER_URL;
  if (sessionPooler) {
    return withStatementTimeout(sessionPooler);
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  if (password) {
    const ref = projectRef();
    const user = process.env.SUPABASE_DB_USER ?? 'postgres';
    const host = process.env.SUPABASE_DB_HOST ?? `db.${ref}.supabase.co`;
    const port = process.env.SUPABASE_DB_PORT ?? '5432';
    const encoded = encodeURIComponent(password);
    return `postgresql://${user}:${encoded}@${host}:${port}/postgres?uselibpqcompat=true&sslmode=require&${STATEMENT_TIMEOUT_PARAM}`;
  }

  if (process.env.DATABASE_URL) {
    return withStatementTimeout(process.env.DATABASE_URL);
  }

  throw new Error(
    'Set SUPABASE_SESSION_POOLER_URL or SUPABASE_DB_PASSWORD (Supabase → Connect → Session pooler)',
  );
}
