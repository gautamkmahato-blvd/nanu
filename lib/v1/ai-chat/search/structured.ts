// lib/v1/ai-chat/search/structured.ts
// Layer 1: Structured search on ai_analysis jsonb fields.
// The LLM outputs structured filters (field/op/value), NOT raw SQL.
// This module builds safe SQL from those filters.
// FIXED: uses parameterized sql fragments instead of sql.raw() string interpolation.

import { sql, type SQL } from 'drizzle-orm';
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

// Map whitelisted operator strings to raw SQL fragments.
// Only these six are ever emitted — isValidOp() rejects everything else.
const OP_SQL: Record<string, SQL> = {
  '=': sql.raw('='),
  '>=': sql.raw('>='),
  '<=': sql.raw('<='),
  '>': sql.raw('>'),
  '<': sql.raw('<'),
  'ilike': sql.raw('ILIKE'),
};

/**
 * Builds parameterized SQL condition fragments from validated filters.
 * Field names are whitelisted (safe for sql.raw), operators are from a fixed map,
 * and all VALUES go through parameterized placeholders — no string interpolation.
 * Returns null if no valid filters.
 */
function buildFilterConditions(filters: StructuredFilter[]): SQL | null {
  const conditions: SQL[] = [];

  for (const f of filters) {
    if (!isAllowedField(f.field) || !isValidOp(f.op)) continue;

    // Field name is whitelisted — safe as a raw identifier
    const fieldAccess = sql.raw(`ai_analysis->>'${f.field}'`);
    const opSql = OP_SQL[f.op];

    if (f.op === 'ilike') {
      // Value is parameterized with ILIKE wildcards
      const pattern = `%${String(f.value)}%`;
      conditions.push(sql`${fieldAccess} ${opSql} ${pattern}`);
    } else if (typeof f.value === 'boolean') {
      conditions.push(sql`(${fieldAccess})::boolean ${opSql} ${f.value}`);
    } else if (typeof f.value === 'number') {
      conditions.push(sql`(${fieldAccess})::numeric ${opSql} ${f.value}`);
    } else {
      conditions.push(sql`${fieldAccess} ${opSql} ${String(f.value)}`);
    }
  }

  if (conditions.length === 0) return null;

  // Join conditions with AND
  let combined = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    combined = sql`${combined} AND ${conditions[i]}`;
  }
  return combined;
}

/**
 * Structured search: execute a query with whitelisted filters on ai_analysis.
 * All user-provided values are parameterized — no injection possible.
 */
export async function structuredSearch(
  filters: StructuredFilter[],
  limit = 10,
  tenantId = 'default',
): Promise<SearchResultEmail[]> {
  const filterConditions = buildFilterConditions(filters);
  if (!filterConditions) return [];

  try {
    const result = await db.execute(sql`
      SELECT
        id, thread_id, subject, from_email, from_name,
        snippet, received_at,
        ai_analysis->>'summary' AS summary
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND is_sent = false
        AND ai_analysis IS NOT NULL
        AND ${filterConditions}
      ORDER BY received_at DESC
      LIMIT ${limit}
    `);

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