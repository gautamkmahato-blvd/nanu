// lib/v1/ai-chat/search/structured.ts
// Layer 1: Structured search on ai_analysis jsonb fields.
// The LLM outputs structured filters (field/op/value), NOT raw SQL.
// This module builds safe SQL from those filters — no injection possible.

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import type {
  StructuredFilter,
  SearchResultEmail,
} from '../types';
import {
  ALL_ALLOWED_FIELDS,
} from '../types';

type AllowedField = (typeof ALL_ALLOWED_FIELDS)[number];

function isAllowedField(field: string): field is AllowedField {
  return (ALL_ALLOWED_FIELDS as readonly string[]).includes(field);
}

function isValidOp(op: string): op is StructuredFilter['op'] {
  return ['=', '>=', '<=', '>', '<', 'ilike'].includes(op);
}

/**
 * Builds a WHERE clause fragment from validated filters.
 * Only allows whitelisted fields and operators.
 * Returns null if no valid filters.
 */
function buildWhereClause(filters: StructuredFilter[]): string | null {
  const conditions: string[] = [];

  for (const f of filters) {
    if (!isAllowedField(f.field) || !isValidOp(f.op)) continue;

    // Sanitize value — escape single quotes
    const val = String(f.value).replace(/'/g, "''");

    if (f.op === 'ilike') {
      conditions.push(`ai_analysis->>'${f.field}' ILIKE '%${val}%'`);
    } else if (typeof f.value === 'boolean') {
      conditions.push(`(ai_analysis->>'${f.field}')::boolean ${f.op} ${f.value}`);
    } else if (typeof f.value === 'number') {
      conditions.push(`(ai_analysis->>'${f.field}')::numeric ${f.op} ${f.value}`);
    } else {
      conditions.push(`ai_analysis->>'${f.field}' ${f.op} '${val}'`);
    }
  }

  return conditions.length > 0 ? conditions.join(' AND ') : null;
}

/**
 * Structured search: execute a query with whitelisted filters on ai_analysis.
 */
export async function structuredSearch(
  filters: StructuredFilter[],
  limit = 10,
): Promise<SearchResultEmail[]> {
  const whereClause = buildWhereClause(filters);
  if (!whereClause) return [];

  const query = `
    SELECT
      id, thread_id, subject, from_email, from_name,
      snippet, received_at,
      ai_analysis->>'summary' AS summary
    FROM emails
    WHERE is_sent = false
      AND ai_analysis IS NOT NULL
      AND ${whereClause}
    ORDER BY received_at DESC
    LIMIT ${limit}
  `;

  try {
    const result = await db.execute(sql.raw(query));

    return (result.rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      thread_id: String(row.thread_id),
      subject: (row.subject as string) ?? null,
      from_email: String(row.from_email),
      from_name: (row.from_name as string) ?? null,
      snippet: (row.snippet as string) ?? null,
      received_at: new Date(row.received_at as string).toISOString(),
      summary: (row.summary as string) ?? null,
      relevance_score: 1.0,
      match_sources: ['structured' as const],
    }));
  } catch (err) {
    console.error('[structured-search] query failed:', err);
    return [];
  }
}
