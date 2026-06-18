// lib/v1/contacts/queries.ts
// Pure SQL aggregation from the emails table. No writes, no side effects.

import { sql } from 'drizzle-orm';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Raw row types from DB
// ---------------------------------------------------------------------------

type ReceivedStatsRow = {
  from_email: string;
  from_name: string | null;
  emails_received: number;
  total_threads: number;
  last_email_at: string;
  first_email_at: string;
  pending_count: number;
  relationship_type: string | null;
  latest_sentiment: string | null;
  primary_tag: string | null;
};

type SentStatsRow = {
  to_email: string;
  emails_sent: number;
};

type TopicsRow = {
  from_email: string;
  ai_analysis: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// Query 1: Received email stats per sender
// ---------------------------------------------------------------------------

export async function getReceivedStats(excludeEmail?: string): Promise<ReceivedStatsRow[]> {
  const excludeClause = excludeEmail
    ? sql`AND LOWER(from_email) != LOWER(${excludeEmail})`
    : sql``;

  const result = await db.execute(sql`
    SELECT
      LOWER(from_email) AS from_email,
      MAX(from_name) FILTER (WHERE from_name IS NOT NULL AND from_name != '') AS from_name,
      COUNT(*)::int AS emails_received,
      COUNT(DISTINCT thread_id)::int AS total_threads,
      MAX(received_at) AS last_email_at,
      MIN(received_at) AS first_email_at,
      COUNT(*) FILTER (
        WHERE (ai_analysis->>'waiting_on_me') = 'true'
          AND (action_taken = false OR action_taken IS NULL)
      )::int AS pending_count,
      MODE() WITHIN GROUP (
        ORDER BY NULLIF(ai_analysis->>'relationship_type', '')
      ) AS relationship_type,
      (ARRAY_AGG(
        NULLIF(ai_analysis->>'sentiment', '')
        ORDER BY received_at DESC
      ) FILTER (WHERE ai_analysis->>'sentiment' IS NOT NULL))[1] AS latest_sentiment,
      MODE() WITHIN GROUP (
        ORDER BY NULLIF(ai_analysis->>'primary_tag', '')
      ) AS primary_tag
    FROM emails
    WHERE is_sent = false
      ${excludeClause}
    GROUP BY LOWER(from_email)
    ORDER BY MAX(received_at) DESC
  `);

  return result.rows as ReceivedStatsRow[];
}

// ---------------------------------------------------------------------------
// Query 2: Sent email counts per recipient
// ---------------------------------------------------------------------------

export async function getSentStats(): Promise<SentStatsRow[]> {
  const result = await db.execute(sql`
    SELECT
      LOWER(recipient.value::text) AS to_email,
      COUNT(*)::int AS emails_sent
    FROM emails,
      jsonb_array_elements_text(to_emails) AS recipient(value)
    WHERE is_sent = true
    GROUP BY LOWER(recipient.value::text)
  `);

  return result.rows as SentStatsRow[];
}

// ---------------------------------------------------------------------------
// Query 3: Raw AI analysis for topics extraction (JS post-processing)
// ---------------------------------------------------------------------------

export async function getContactAIData(excludeEmail?: string): Promise<TopicsRow[]> {
  const excludeClause = excludeEmail
    ? sql`AND LOWER(from_email) != LOWER(${excludeEmail})`
    : sql``;

  const result = await db.execute(sql`
    SELECT
      LOWER(from_email) AS from_email,
      ai_analysis
    FROM emails
    WHERE is_sent = false
      AND ai_analysis IS NOT NULL
      ${excludeClause}
  `);

  return result.rows as TopicsRow[];
}
