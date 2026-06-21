// app/api/v1/scheduled-emails/process/route.ts
// POST: cron endpoint — processes all due scheduled emails.
// Called by PM2 every 60 seconds:
//   curl -X POST http://localhost:3000/api/v1/scheduled-emails/process
//
// Security: only accepts requests from localhost or with a cron secret.

import { NextResponse } from 'next/server';
import { processDueEmails } from '@/lib/v1/scheduled-emails/processor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  // Security: verify request is from internal cron, not public
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await processDueEmails();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[scheduled-emails:cron] process failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 },
    );
  }
}

// Also support GET for simpler cron setups
export async function GET(request: Request) {
  return POST(request);
}

// ---------------------------------------------------------------------------
// Cron auth — accept localhost or matching secret
// ---------------------------------------------------------------------------

function isAuthorizedCron(request: Request): boolean {
  // Option 1: Check for cron secret header
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get('x-cron-secret') ?? request.headers.get('authorization')?.replace('Bearer ', '');
    if (provided === secret) return true;
  }

  // Option 2: Allow localhost / loopback
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? '';
  const isLocal = ['127.0.0.1', '::1', 'localhost', ''].includes(ip);

  // In dev mode, always allow
  if (process.env.NODE_ENV === 'development') return true;

  return isLocal;
}
