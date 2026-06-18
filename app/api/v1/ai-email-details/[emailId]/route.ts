// app/api/v1/ai-email-details/[emailId]/route.ts

import { NextResponse } from 'next/server';
import { getEmailById, getThreadEmails } from '@/lib/v1/queries/ai-email-detail';
import { extractEmailIntelligence } from '@/lib/v1/ai-email-details';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ emailId: string }> },
) {
  const { emailId } = await params;

  if (!emailId || !/^[a-zA-Z0-9_-]+$/.test(emailId)) {
    return NextResponse.json({ error: 'Invalid email id' }, { status: 400 });
  }

  try {
    const email = await getEmailById(emailId);
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const threadEmails = await getThreadEmails(email.threadId);
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
