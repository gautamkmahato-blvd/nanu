// app/api/v1/board/route.ts
// GET: Returns emails grouped by status for the Kanban board.

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

type BoardEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  receivedAt: string;
  status: string;
  isStarred: boolean;
  summary: string | null;
  primaryTag: string | null;
  sentiment: string | null;
  relationshipType: string | null;
  urgencyScore: number;
};

type BoardResponse = {
  columns: {
    key: string;
    label: string;
    emails: BoardEmail[];
    count: number;
  }[];
  total: number;
};

const COLUMN_ORDER = ['new', 'in_progress', 'waiting', 'done', 'archived'] as const;

const COLUMN_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  done: 'Done',
  archived: 'Archived',
};

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        id,
        thread_id,
        subject,
        from_email,
        from_name,
        received_at,
        COALESCE(status, 'new') AS status,
        is_starred,
        ai_analysis->>'summary' AS summary,
        ai_analysis->>'primary_tag' AS primary_tag,
        ai_analysis->>'sentiment' AS sentiment,
        ai_analysis->>'relationship_type' AS relationship_type,
        COALESCE((ai_analysis->>'urgency_score')::int, 0) AS urgency_score
      FROM emails
      WHERE is_sent = false
      ORDER BY received_at DESC
    `);

    const rows = result.rows as Record<string, unknown>[];

    // Group by status
    const grouped = new Map<string, BoardEmail[]>();
    for (const key of COLUMN_ORDER) {
      grouped.set(key, []);
    }

    for (const row of rows) {
      const status = String(row.status || 'new');
      const email: BoardEmail = {
        id: String(row.id),
        threadId: String(row.thread_id),
        subject: (row.subject as string) ?? null,
        fromEmail: String(row.from_email),
        fromName: (row.from_name as string) ?? null,
        receivedAt: new Date(row.received_at as string).toISOString(),
        status,
        isStarred: Boolean(row.is_starred),
        summary: (row.summary as string) ?? null,
        primaryTag: (row.primary_tag as string) ?? null,
        sentiment: (row.sentiment as string) ?? null,
        relationshipType: (row.relationship_type as string) ?? null,
        urgencyScore: Number(row.urgency_score) || 0,
      };

      const list = grouped.get(status);
      if (list) {
        list.push(email);
      } else {
        // Unknown status falls into 'new'
        grouped.get('new')!.push(email);
      }
    }

    const columns = COLUMN_ORDER.map((key) => ({
      key,
      label: COLUMN_LABELS[key],
      emails: grouped.get(key) ?? [],
      count: (grouped.get(key) ?? []).length,
    }));

    return NextResponse.json({
      columns,
      total: rows.length,
    } satisfies BoardResponse);
  } catch (error) {
    console.error('[board] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load board' },
      { status: 500 },
    );
  }
}
