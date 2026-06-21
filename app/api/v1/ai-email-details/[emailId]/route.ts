// app/api/v1/ai-email-details/[emailId]/route.ts

import { NextResponse } from 'next/server';
import { getEmailById, getThreadEmails } from '@/lib/v1/queries/ai-email-detail';
import { extractEmailIntelligence } from '@/lib/v1/ai-email-details';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';  

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ emailId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(_request, apiLimiter, tenantId); if (rl) return rl;

  const { emailId } = await params;

  if (!emailId || !/^[a-zA-Z0-9_-]+$/.test(emailId)) {
    return NextResponse.json({ error: 'Invalid email id' }, { status: 400 });
  }

  try {
    const email = await getEmailById(emailId, tenantId);
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const threadEmails = await getThreadEmails(email.threadId, tenantId);
    const intelligence = extractEmailIntelligence(email.aiAnalysis);

    return NextResponse.json({
      email,
      threadEmails,
      intelligence,
    });
  } catch (error) {
    console.error('[ai-email-details] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load email' },
      { status: 500 },
    );
  }
}
