// lib/v1/meeting-prep/pipeline.ts
// Orchestrator: runs Steps 1 → 7 in sequence.
// Now includes debug info for tracing accuracy issues.
// Updated: threads relatedEmails from step 5 dedup into MeetingPrepOutput for the UI.

import type { PipelineResult, MeetingPrepOutput, CacheCheckResult, DeduplicatedEmail } from './types';
import type { MeetingSearchDebug } from './step4-hybrid-search';

import { getMeetings } from './step1-get-meetings';
import { checkCache } from './step2-cache-check';
import { generateQueries } from './step3-generate-queries';
import { hybridSearch } from './step4-hybrid-search';
import { deduplicateAndCap } from './step5-deduplicate';
import { synthesize } from './step6-synthesis';
import { cacheAndRespond } from './step7-cache-respond';

// ---------------------------------------------------------------------------
// Debug type for the full pipeline
// ---------------------------------------------------------------------------

export type PipelineDebug = {
  meetingId: string;
  meetingSummary: string;
  step2_cacheStatus: string;
  step3_queries: Record<string, string[]>;
  step4_searchDebug: MeetingSearchDebug | null;
  step5_emailsAfterDedup: number;
  step6_emailsUsed: number;
};

export type PipelineResultWithDebug = PipelineResult & {
  debug: PipelineDebug[];
};

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function runMeetingPrepPipeline(hours: number = 24, tenantId = 'default'): Promise<PipelineResultWithDebug> {
  const events: MeetingPrepOutput[] = [];
  const errors: PipelineResult['errors'] = [];
  const debug: PipelineDebug[] = [];

  // ── Step 1: Get meetings ──
  console.log('[Pipeline] Step 1: Fetching meetings...');
  const meetingsResult = await getMeetings(hours, tenantId);

  if (!meetingsResult.ok) {
    return { success: false, events: [], errors: [{ meetingId: '', meetingSummary: '', error: meetingsResult.error }], debug: [] };
  }

  const meetings = meetingsResult.data;

  if (meetings.length === 0) {
    return { success: true, events: [], errors: [], debug: [] };
  }

  console.log(`[Pipeline] Found ${meetings.length} meetings with attendees`);

  // ── Step 2: Check cache ──
  console.log('[Pipeline] Step 2: Checking cache...');
  const cacheResult = await checkCache(meetings, tenantId);

  if (!cacheResult.ok) {
    return { success: false, events: [], errors: [{ meetingId: '', meetingSummary: '', error: cacheResult.error }], debug: [] };
  }

  const cacheChecks = cacheResult.data;

  const cached: CacheCheckResult[] = [];
  const needsRefresh: CacheCheckResult[] = [];

  for (const check of cacheChecks) {
    if (!check.needsRefresh && check.cachedPrep) {
      cached.push(check);
      debug.push({
        meetingId: check.meeting.id,
        meetingSummary: check.meeting.summary,
        step2_cacheStatus: 'fresh_cache',
        step3_queries: {},
        step4_searchDebug: null,
        step5_emailsAfterDedup: 0,
        step6_emailsUsed: check.cachedPrep.emailsUsed ?? 0,
      });
    } else {
      needsRefresh.push(check);
    }
  }

  // Cached events don't have relatedEmails (emails aren't cached) — pass empty array
  for (const c of cached) {
    events.push({ meeting: c.meeting, prep: c.cachedPrep!, fromCache: true, relatedEmails: [] });
  }

  console.log(`[Pipeline] ${cached.length} from cache, ${needsRefresh.length} need refresh`);

  if (needsRefresh.length === 0) {
    return { success: true, events: sortByStartTime(events), errors, debug };
  }

  // ── Step 3: Generate queries ──
  console.log('[Pipeline] Step 3: Generating search queries...');
  const meetingsToProcess = needsRefresh.map((c) => c.meeting);
  const queriesResult = await generateQueries(meetingsToProcess, tenantId);

  if (!queriesResult.ok) {
    for (const m of meetingsToProcess) {
      errors.push({ meetingId: m.id, meetingSummary: m.summary, error: queriesResult.error });
    }
    return { success: events.length > 0, events: sortByStartTime(events), errors, debug };
  }

  // Collect query debug
  const queryDebugMap: Record<string, Record<string, string[]>> = {};
  for (const mq of queriesResult.data) {
    const map: Record<string, string[]> = {};
    for (const aq of mq.attendeeQueries) {
      map[aq.attendeeEmail] = aq.queries;
    }
    queryDebugMap[mq.meeting.id] = map;
  }

  console.log(`[Pipeline] Generated queries for ${queriesResult.data.length} meetings`);

  // ── Step 4: Hybrid search ──
  console.log('[Pipeline] Step 4: Running hybrid search...');
  const searchResult = await hybridSearch(queriesResult.data, tenantId);

  if (!searchResult.ok) {
    for (const m of meetingsToProcess) {
      errors.push({ meetingId: m.id, meetingSummary: m.summary, error: searchResult.error });
    }
    return { success: events.length > 0, events: sortByStartTime(events), errors, debug };
  }

  const { results: searchResults, debug: searchDebugList } = searchResult.data;
  const searchDebugMap: Record<string, MeetingSearchDebug> = {};
  for (const sd of searchDebugList) {
    searchDebugMap[sd.meetingId] = sd;
  }

  console.log(`[Pipeline] Search completed for ${searchResults.length} meetings`);

  // ── Step 5: Deduplicate ──
  console.log('[Pipeline] Step 5: Deduplicating results...');
  const dedupeResult = deduplicateAndCap(searchResults);

  if (!dedupeResult.ok) {
    for (const m of meetingsToProcess) {
      errors.push({ meetingId: m.id, meetingSummary: m.summary, error: dedupeResult.error });
    }
    return { success: events.length > 0, events: sortByStartTime(events), errors, debug };
  }

  const dedupDebugMap: Record<string, number> = {};
  for (const bundle of dedupeResult.data) {
    dedupDebugMap[bundle.meeting.id] = bundle.totalRetrieved;
  }

  // Build meetingId → deduplicated emails lookup for threading into output
  const emailsByMeetingId: Record<string, DeduplicatedEmail[]> = {};
  for (const bundle of dedupeResult.data) {
    emailsByMeetingId[bundle.meeting.id] = bundle.allEmails;
  }

  const totalEmails = dedupeResult.data.reduce((s, b) => s + b.totalRetrieved, 0);
  console.log(`[Pipeline] ${totalEmails} total emails across ${dedupeResult.data.length} meetings`);

  // ── Step 6: Synthesis ──
  console.log('[Pipeline] Step 6: Running AI synthesis...');
  const synthesisResult = await synthesize(dedupeResult.data, tenantId);

  if (!synthesisResult.ok) {
    for (const m of meetingsToProcess) {
      errors.push({ meetingId: m.id, meetingSummary: m.summary, error: synthesisResult.error });
    }
    return { success: events.length > 0, events: sortByStartTime(events), errors, debug };
  }

  for (const prep of synthesisResult.data) {
    const meeting = meetingsToProcess.find((m) => m.id === prep.meetingId);
    if (meeting) {
      // Attach the deduplicated emails from step 5 so the UI can render them
      events.push({
        meeting,
        prep,
        fromCache: false,
        relatedEmails: emailsByMeetingId[meeting.id] ?? [],
      });

      // Build debug for this meeting
      debug.push({
        meetingId: meeting.id,
        meetingSummary: meeting.summary,
        step2_cacheStatus: needsRefresh.find((c) => c.meeting.id === meeting.id)?.reason ?? 'unknown',
        step3_queries: queryDebugMap[meeting.id] ?? {},
        step4_searchDebug: searchDebugMap[meeting.id] ?? null,
        step5_emailsAfterDedup: dedupDebugMap[meeting.id] ?? 0,
        step6_emailsUsed: prep.emailsUsed,
      });
    }
  }

  console.log(`[Pipeline] Synthesis complete for ${synthesisResult.data.length} meetings`);

  // ── Step 7: Cache ──
  console.log('[Pipeline] Step 7: Caching results...');
  await cacheAndRespond(meetingsToProcess, synthesisResult.data, tenantId);

  console.log(`[Pipeline] Done. ${events.length} total events prepared.`);

  return { success: true, events: sortByStartTime(events), errors, debug };
}

function sortByStartTime(events: MeetingPrepOutput[]): MeetingPrepOutput[] {
  return events.sort((a, b) => new Date(a.meeting.startTime).getTime() - new Date(b.meeting.startTime).getTime());
}