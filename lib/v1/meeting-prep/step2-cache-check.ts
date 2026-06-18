// lib/v1/meeting-prep/step2-cache-check.ts
// Step 2: For each meeting, check if we have a cached prep
//         that is still fresh (< 6 hours AND no new emails from attendees).


import { sql } from 'drizzle-orm';
import type { Meeting, CacheCheckResult, PrepResult, StepResult } from './types';
import { db } from '@/db';

const CACHE_TTL_HOURS = 6;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function checkCache(meetings: Meeting[]): Promise<StepResult<CacheCheckResult[]>> {
  try {
    const results: CacheCheckResult[] = [];

    for (const meeting of meetings) {
      const result = await checkSingleMeetingCache(meeting);
      results.push(result);
    }

    return { ok: true, data: results };
  } catch (err) {
    return { ok: false, error: `Step 2 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 2a: Check cache for a single meeting
// ---------------------------------------------------------------------------

async function checkSingleMeetingCache(meeting: Meeting): Promise<CacheCheckResult> {
  try {
    const cached = await fetchCachedPrep(meeting.id);

    // No cache exists
    if (!cached) {
      return { meeting, cachedPrep: null, needsRefresh: true, reason: 'no_cache' };
    }

    // Cache is too old
    const cacheAge = Date.now() - new Date(cached.createdAt).getTime();
    const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000;

    if (cacheAge > maxAge) {
      return { meeting, cachedPrep: null, needsRefresh: true, reason: 'stale_cache' };
    }

    // Cache exists and is fresh — but check if new emails arrived from attendees
    const attendeeEmails = meeting.attendees.filter((a) => !a.self).map((a) => a.email);
    const hasNewEmails = await checkNewEmailsSince(attendeeEmails, cached.createdAt);

    if (hasNewEmails) {
      return { meeting, cachedPrep: null, needsRefresh: true, reason: 'new_emails' };
    }

    // Cache is valid
    return { meeting, cachedPrep: cached.prepData, needsRefresh: false, reason: 'fresh_cache' };
  } catch {
    // If cache check fails, just regenerate — don't block the pipeline
    return { meeting, cachedPrep: null, needsRefresh: true, reason: 'no_cache' };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 2b: Fetch cached prep from DB
// ---------------------------------------------------------------------------

type CachedRow = {
  prepData: PrepResult;
  createdAt: string;
};

async function fetchCachedPrep(eventId: string): Promise<CachedRow | null> {
  try {
    const rows = await db.execute(sql`
      SELECT prep_data, created_at
      FROM meeting_prep_cache
      WHERE event_id = ${eventId}
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (rows.rows.length === 0) return null;

    const row = rows.rows[0];
    return {
      prepData: row.prep_data as unknown as PrepResult,
      createdAt: row.created_at as string,
    };
  } catch {
    return null; // table might not exist yet — that's ok
  }
}

// ---------------------------------------------------------------------------
// Sub-step 2c: Check if new emails arrived from attendees since cache time
// ---------------------------------------------------------------------------

async function checkNewEmailsSince(attendeeEmails: string[], since: string): Promise<boolean> {
  if (attendeeEmails.length === 0) return false;

  try {
    const rows = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM emails
      WHERE from_email = ANY(${attendeeEmails})
        AND received_at > ${since}
      LIMIT 1
    `);

    const count = Number(rows.rows[0]?.count ?? 0);
    return count > 0;
  } catch {
    return false; // if check fails, assume no new emails
  }
}
