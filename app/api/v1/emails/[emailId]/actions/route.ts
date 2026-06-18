// app/api/v1/emails/[emailId]/actions/route.ts
// PATCH: Execute an action on an email (mark_done, mark_important, etc.)

import { NextResponse } from 'next/server';
import { executeEmailAction, type ActionType } from '@/lib/v1/email-actions/actions';

const VALID_ACTIONS: ActionType[] = ['mark_done', 'unmark_done', 'mark_important', 'unmark_important'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ emailId: string }> },
) {
  const { emailId } = await params;

  if (!emailId || !/^[a-zA-Z0-9_-]+$/.test(emailId)) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = body.action as string;

    if (!action || !VALID_ACTIONS.includes(action as ActionType)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 },
      );
    }

    const result = await executeEmailAction(emailId, action as ActionType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[email-actions] route failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 },
    );
  }
}
