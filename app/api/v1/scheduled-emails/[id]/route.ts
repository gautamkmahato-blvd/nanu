// app/api/v1/scheduled-emails/[id]/route.ts
// GET: get single scheduled email
// PUT: update pending email (subject, body, time, recipients)
// DELETE: cancel a pending email

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getScheduledEmail, updateScheduledEmail, cancelScheduledEmail } from '@/lib/v1/scheduled-emails/queries';
import { updateScheduledEmailSchema } from '@/lib/v1/scheduled-emails/validation';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId);
  if (rl) return rl;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const email = await getScheduledEmail(tenantId, id);
    if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(email);
  } catch (error) {
    console.error('[scheduled-emails] get failed:', error);
    return NextResponse.json({ error: 'Failed to load scheduled email' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId);
  if (rl) return rl;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await request.json();
    const parsed = updateScheduledEmailSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Check it exists and is still pending
    const existing = await getScheduledEmail(tenantId, id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.status !== 'pending') {
      return NextResponse.json({ error: `Cannot edit email with status "${existing.status}". Only pending emails can be edited.` }, { status: 409 });
    }

    const updated = await updateScheduledEmail(tenantId, id, {
      subject: parsed.data.subject,
      body: parsed.data.body,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt).toISOString() : undefined,
      toEmails: parsed.data.toEmails,
      ccEmails: parsed.data.ccEmails,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Update failed — email may no longer be pending' }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'Scheduled email updated' });
  } catch (error) {
    console.error('[scheduled-emails] update failed:', error);
    return NextResponse.json({ error: 'Failed to update scheduled email' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId);
  if (rl) return rl;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const cancelled = await cancelScheduledEmail(tenantId, id);
    if (!cancelled) {
      const existing = await getScheduledEmail(tenantId, id);
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ error: `Cannot cancel email with status "${existing.status}"` }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'Scheduled email cancelled' });
  } catch (error) {
    console.error('[scheduled-emails] cancel failed:', error);
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
  }
}
