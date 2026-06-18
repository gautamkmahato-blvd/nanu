// app/api/v1/messages/send/route.ts
import { NextResponse } from 'next/server';

import { SendEmailError, sendEmail } from '@/app/service/v1/sendEmail';
import { sendEmailSchema } from '@/lib/schemas/v1/send-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    // First field error, human-readable — the modal shows this directly.
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      Object.values(fieldErrors).flat()[0] ?? 'Invalid request';
    return NextResponse.json(
      { error: firstError, fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await sendEmail(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof SendEmailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error('[send] unexpected failure:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
