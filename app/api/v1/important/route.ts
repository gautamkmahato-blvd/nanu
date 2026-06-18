// app/api/v1/important/route.ts

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        id,
        thread_id,
        subject,
        from_email,
        from_name,
        snippet,
        received_at,
        is_read,
        is_starred,
        action_taken,
        action_taken_at,
        ai_analysis->>'summary' AS summary,
        ai_analysis->>'sentiment' AS sentiment,
        ai_analysis->>'relationship_type' AS relationship_type,
        ai_analysis->>'primary_tag' AS primary_tag,
        ai_analysis->>'recommended_action' AS recommended_action,
        (ai_analysis->>'urgency_score')::int AS urgency_score,
        (ai_analysis->>'opportunity_score')::int AS opportunity_score,
        (ai_analysis->>'risk_score')::int AS risk_score
      FROM emails
      WHERE is_starred = true
      ORDER BY received_at DESC
      LIMIT 50
    `);

    const emails = (result.rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      threadId: String(row.thread_id),
      subject: (row.subject as string) ?? null,
      fromEmail: String(row.from_email),
      fromName: (row.from_name as string) ?? null,
      snippet: (row.snippet as string) ?? null,
      receivedAt: new Date(row.received_at as string).toISOString(),
      isRead: Boolean(row.is_read),
      isStarred: Boolean(row.is_starred),
      actionTaken: Boolean(row.action_taken),
      actionTakenAt: row.action_taken_at ? new Date(row.action_taken_at as string).toISOString() : null,
      summary: (row.summary as string) ?? null,
      sentiment: (row.sentiment as string) ?? null,
      relationshipType: (row.relationship_type as string) ?? null,
      primaryTag: (row.primary_tag as string) ?? null,
      recommendedAction: (row.recommended_action as string) ?? null,
      urgencyScore: Number(row.urgency_score) || 0,
      opportunityScore: Number(row.opportunity_score) || 0,
      riskScore: Number(row.risk_score) || 0,
    }));

    return NextResponse.json({
      emails,
      total: emails.length,
    });
  } catch (error) {
    console.error('[important] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load important emails' },
      { status: 500 },
    );
  }
}
