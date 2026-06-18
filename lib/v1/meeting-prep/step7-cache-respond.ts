// lib/v1/meeting-prep/step7-cache-respond.ts
// Step 7: Save the prep results to DB cache and return final output.

import { sql } from 'drizzle-orm';
import type { Meeting, PrepResult, StepResult } from './types';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function cacheAndRespond(
  meetings: Meeting[],
  preps: PrepResult[],
  tenantId = 'default',
): Promise<StepResult<void>> {
  try {
    for (const prep of preps) {
      const meeting = meetings.find((m) => m.id === prep.meetingId);
      await cacheSinglePrep(prep, meeting, tenantId);
    }
    return { ok: true, data: undefined };
  } catch (err) {
    console.warn(`[Step 7] Cache write failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    return { ok: true, data: undefined };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 7a: Upsert a single prep into the cache table
// ---------------------------------------------------------------------------

async function cacheSinglePrep(prep: PrepResult, meeting: Meeting | undefined, tenantId: string): Promise<void> {
  try {
    const prepJson = JSON.stringify(prep);
    const summary = prep.meetingSummary ?? '';
    const startTime = meeting?.startTime ?? new Date().toISOString();

    await db.execute(sql`
      INSERT INTO meeting_prep_cache (tenant_id, event_id, event_summary, event_start, prep_data, created_at)
      VALUES (${tenantId}, ${prep.meetingId}, ${summary}, ${startTime}, ${prepJson}::jsonb, NOW())
      ON CONFLICT (tenant_id, event_id)
      DO UPDATE SET event_summary = ${summary}, event_start = ${startTime}, prep_data = ${prepJson}::jsonb, created_at = NOW()
    `);
  } catch (err) {
    console.warn(`[Step 7a] Failed to cache prep for ${prep.meetingId}: ${err}`);
  }
}