// app/api/v1/scheduled-emails/route.ts
// GET: list scheduled emails for the tenant
// POST: create a new scheduled email

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { listScheduledEmails, createScheduledEmail, countPending } from '@/lib/v1/scheduled-emails/queries';
import { createScheduledEmailSchema } from '@/lib/v1/scheduled-emails/validation';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId);
  if (rl) return rl;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;

    const [emails, pendingCount] = await Promise.all([
      listScheduledEmails(tenantId, status || undefined),
      countPending(tenantId),
    ]);

    return NextResponse.json({ emails, pendingCount });
  } catch (error) {
    console.error('[scheduled-emails] list failed:', error);
    return NextResponse.json({ error: 'Failed to load scheduled emails' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await rateLimit(request, apiLimiter, tenantId);
  if (rl) return rl;

  try {
    const body = await request.json();
    const parsed = createScheduledEmailSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const data = parsed.data;

    const id = await createScheduledEmail(tenantId, {
      type: data.type,
      threadId: data.threadId,
      toEmails: data.toEmails,
      ccEmails: data.ccEmails,
      subject: data.subject,
      body: data.body,
      isReply: data.isReply,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      watchEmail: data.watchEmail,
      followUpHours: data.followUpHours,
    });

    return NextResponse.json({
      id,
      message: `Email scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
    }, { status: 201 });
  } catch (error) {
    console.error('[scheduled-emails] create failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule email' },
      { status: 500 },
    );
  }
}
