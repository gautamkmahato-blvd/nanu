// app/api/v1/ai-inbox/route.ts
//
// CHANGES FROM ORIGINAL:
// - Added `timePeriod` query param (today, 3days, week, 15days, month, all)
// - Added status-based grouping (Option C: two-layer sort)
// - Added `groups` array in response for UI sections
// - Added `snoozed` to recognized statuses
// - Priority scoring is UNCHANGED — same derivePriority() function
// - Attention labels are UNCHANGED — same deriveAttentionLabels() function

import { NextResponse } from 'next/server';
import { getAIInboxThreads, type AIInboxThread, type TimePeriod } from '@/lib/v1/queries/ai-inbox';
import { derivePriority, type AttentionType, type PriorityLevel } from '@/lib/v1/priority';
import { deriveAttentionLabels } from '@/lib/v1/dashboard/attention-labels';
import { getTenantId } from '@/lib/auth/session';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EnrichedThread = AIInboxThread & {
  priority: {
    score: number;
    level: PriorityLevel;
    attentionType: AttentionType;
  };
  attentionLabels: AttentionType[];
  displaySummary: string;
  statusGroup: StatusGroup;
};

type StatusGroup = 'needs_attention' | 'in_progress' | 'waiting' | 'snoozed' | 'done' | 'everything_else';

type ThreadGroup = {
  key: StatusGroup;
  label: string;
  threads: EnrichedThread[];
  count: number;
};

type AIInboxResponse = {
  threads: EnrichedThread[];
  groups: ThreadGroup[];
  counts: {
    total: number;
    urgent: number;
    important: number;
    byAttention: Record<AttentionType, number>;
    byGroup: Record<StatusGroup, number>;
  };
  activeTimeFilter: TimePeriod;
};

// ---------------------------------------------------------------------------
// Status → Group mapping
// ---------------------------------------------------------------------------

const STATUS_TO_GROUP: Record<string, StatusGroup> = {
  new: 'needs_attention',
  in_progress: 'in_progress',
  waiting: 'waiting',
  snoozed: 'snoozed',
  done: 'done',
  archived: 'done', // shouldn't appear (filtered in query), but just in case
};

const GROUP_CONFIG: { key: StatusGroup; label: string; sortOrder: number }[] = [
  { key: 'needs_attention', label: 'Needs Attention', sortOrder: 0 },
  { key: 'in_progress', label: 'In Progress', sortOrder: 1 },
  { key: 'waiting', label: 'Waiting On Others', sortOrder: 2 },
  { key: 'everything_else', label: 'Everything Else', sortOrder: 3 },
  { key: 'snoozed', label: 'Snoozed', sortOrder: 4 },
  { key: 'done', label: 'Done', sortOrder: 5 },
];

// ---------------------------------------------------------------------------
// Enrich a single thread (priority scoring UNCHANGED)
// ---------------------------------------------------------------------------

function enrichThread(thread: AIInboxThread): EnrichedThread {
  const priority = derivePriority(thread.aiAnalysis);
  const attentionLabels = deriveAttentionLabels(thread.aiAnalysis);

  // Status-based group, BUT information emails go to their own group
  // even if status is 'new' — they don't need attention
  let statusGroup: StatusGroup;
  if (priority.attentionType === 'information') {
    statusGroup = thread.status === 'done' ? 'done' : 'everything_else';
  } else {
    statusGroup = STATUS_TO_GROUP[thread.status] ?? 'needs_attention';
  }

  return {
    ...thread,
    priority,
    attentionLabels,
    displaySummary: (thread.aiAnalysis?.summary as string) || thread.snippet || '',
    statusGroup,
  };
}

// ---------------------------------------------------------------------------
// Sort: status group first, then priority score within each group
// ---------------------------------------------------------------------------

function sortThreads(threads: EnrichedThread[]): EnrichedThread[] {
  const groupOrder: Record<StatusGroup, number> = {
    needs_attention: 0,
    in_progress: 0,
    waiting: 0,
    snoozed: 0,
    done: 0,
    everything_else: 0
  };
  for (const g of GROUP_CONFIG) groupOrder[g.key] = g.sortOrder;

  return threads.sort((a, b) => {
    // Layer 1: status group (needs_attention first, done last)
    const groupDiff = (groupOrder[a.statusGroup] ?? 99) - (groupOrder[b.statusGroup] ?? 99);
    if (groupDiff !== 0) return groupDiff;

    // Layer 2: priority score descending within same group
    if (a.priority.score !== b.priority.score) return b.priority.score - a.priority.score;

    // Layer 3: most recent first within same score
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
}

// ---------------------------------------------------------------------------
// Build groups for UI sections
// ---------------------------------------------------------------------------

function buildGroups(threads: EnrichedThread[]): ThreadGroup[] {
  return GROUP_CONFIG.map((cfg) => {
    const groupThreads = threads.filter((t) => t.statusGroup === cfg.key);
    return {
      key: cfg.key,
      label: cfg.label,
      threads: groupThreads,
      count: groupThreads.length,
    };
  }).filter((g) => g.count > 0); // only return non-empty groups
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const VALID_TIME_PERIODS: TimePeriod[] = ['today', '3days', 'week', '15days', 'month', 'all'];

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
  const offset = Number(searchParams.get('offset')) || 0;
  const filter = searchParams.get('filter') as AttentionType | 'all' | null;
  const timePeriod = VALID_TIME_PERIODS.includes(searchParams.get('time') as TimePeriod)
    ? (searchParams.get('time') as TimePeriod)
    : 'all';

  try {
    const rawThreads = await getAIInboxThreads(limit, offset, timePeriod, tenantId);
    let threads = rawThreads.map(enrichThread);

    // Sort: status group → priority score → time
    threads = sortThreads(threads);

    // Counts (computed BEFORE attention filter so totals are accurate)
    const byGroup: Record<StatusGroup, number> = {
      needs_attention: 0, in_progress: 0, waiting: 0,
      everything_else: 0, snoozed: 0, done: 0,
    };
    
    const byAttention: Record<AttentionType, number> = {
      risk: 0, opportunity: 0, deadline: 0,
      action_required: 0, follow_up: 0, information: 0,
    };
    
    for (const t of threads) {
      for (const label of t.attentionLabels) byAttention[label]++;
      byGroup[t.statusGroup]++;
    }
    
    const counts = {
      total: threads.length,
      urgent: threads.filter((t) => t.priority.level === 'urgent').length,
      important: threads.filter((t) => t.priority.level === 'important').length,
      byAttention,
      byGroup,
    };

    // Apply attention type filter (if set)
    if (filter && filter !== 'all') {
      threads = threads.filter((t) => t.attentionLabels.includes(filter));
    }

    // Build groups from filtered threads
    const groups = buildGroups(threads);

    const response: AIInboxResponse = {
      threads,
      groups,
      counts,
      activeTimeFilter: timePeriod,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[ai-inbox] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load AI inbox' },
      { status: 500 }
    );
  }
}
