// app/api/v1/emails/[emailId]/status/route.ts
// PATCH: Update the status of an email.
// Body: { status: 'new' | 'in_progress' | 'waiting' | 'done' | 'archived' }

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

const VALID_STATUSES = ['new', 'in_progress', 'waiting', 'done', 'archived'] as const;
type EmailStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is EmailStatus {
  return typeof value === 'string' && (VALID_STATUSES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ emailId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  const { emailId } = await params;

  if (!emailId || !/^[a-zA-Z0-9_-]+$/.test(emailId)) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    // If marking as done via status, also set action_taken for consistency
    if (status === 'done') {
      await db.execute(sql`
        UPDATE emails
        SET status = ${status},
            action_taken = true,
            action_taken_at = COALESCE(action_taken_at, now()),
            updated_at = now()
        WHERE tenant_id = ${tenantId} AND id = ${emailId}
      `);
    } else if (status === 'new' || status === 'in_progress') {
      // Moving back to active clears the done flag
      await db.execute(sql`
        UPDATE emails
        SET status = ${status},
            action_taken = false,
            action_taken_at = NULL,
            updated_at = now()
        WHERE tenant_id = ${tenantId} AND id = ${emailId}
      `);
    } else {
      await db.execute(sql`
        UPDATE emails
        SET status = ${status},
            updated_at = now()
        WHERE tenant_id = ${tenantId} AND id = ${emailId}
      `);
    }

    return NextResponse.json({ success: true, emailId, status });
  } catch (error) {
    console.error('[status] update failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status update failed' },
      { status: 500 },
    );
  }
}
