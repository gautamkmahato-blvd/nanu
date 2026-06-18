import { NextResponse } from 'next/server';

import { SendEmailError, replyToThread } from '@/app/service/v1/sendEmail';
import { replyEmailSchema } from '@/lib/schemas/v1/send-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;

  if (!threadId || !/^[a-zA-Z0-9_-]+$/.test(threadId)) {
    return NextResponse.json({ error: 'Invalid thread id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = replyEmailSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? 'Invalid request';
    return NextResponse.json({ error: firstError, fieldErrors }, { status: 400 });
  }

  try {
    const result = await replyToThread(threadId, parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof SendEmailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error('[reply] unexpected failure:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
