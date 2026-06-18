// app/api/v1/calendar/generate-description/route.ts
// POST: Generate a meeting description from email context using LLM.
// Body: { emailId }

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import openRouterClient from '@/config/openrouter/config';
import { getTenantId } from '@/lib/auth/session';

const MODEL = 'inception/mercury-2';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { emailId } = await request.json();

    if (!emailId) {
      return NextResponse.json({ error: 'emailId is required' }, { status: 400 });
    }

    // Fetch email data
    const result = await db.execute(sql`
      SELECT subject, from_email, from_name, to_emails, body_text, ai_analysis
      FROM emails WHERE tenant_id = ${tenantId} AND id = ${emailId} LIMIT 1
    `);

    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    const subject = (row.subject as string) ?? '';
    const fromName = (row.from_name as string) ?? '';
    const fromEmail = String(row.from_email);
    const bodyText = ((row.body_text as string) ?? '').slice(0, 1500);
    const ai = (row.ai_analysis as Record<string, unknown>) ?? {};

    const context = [
      `Subject: ${subject}`,
      `From: ${fromName} <${fromEmail}>`,
      `Email body: ${bodyText}`,
      '',
      '--- AI Analysis ---',
      `Summary: ${ai.summary ?? 'N/A'}`,
      `Category: ${ai.category ?? 'N/A'}`,
      `Topics: ${JSON.stringify(ai.topics ?? [])}`,
      `Action items: ${JSON.stringify(ai.action_items ?? [])}`,
      `Recommended action: ${ai.recommended_action ?? 'N/A'}`,
      `Relationship: ${ai.relationship_type ?? 'N/A'}`,
      `Urgency: ${ai.urgency_score ?? 'N/A'}/100`,
    ].join('\n');

    const response = await openRouterClient.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant helping schedule a meeting based on an email conversation. Generate a brief, professional meeting description/agenda.

Include:
1. A one-line purpose of the meeting
2. 3-5 key discussion points based on the email content
3. Any deadlines or action items to address

Keep it concise (under 150 words). Write it as a meeting description that would be sent in a calendar invite.

EMAIL CONTEXT:
${context}

Generate the meeting description:`,
        },
      ],
    });

    const description = response.choices[0]?.message?.content?.trim() ?? '';

    if (!description) {
      return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error('[generate-description] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate description' },
      { status: 500 },
    );
  }
}
