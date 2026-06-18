// lib/v1/dashboard/index.ts
// Ties all dashboard widgets together.
// Scores each email, then feeds scored data into each widget's function.

import { derivePriority } from '@/lib/v1/priority';
import { deriveAttentionLabels } from './attention-labels';
import { computeStatCards, type StatCards } from './widgets/stat-cards';
import { calculateTodaysFocus, type TodaysFocus } from './widgets/todays-focus';
import { getActionRequiredWidget, type ActionRequiredWidget } from './widgets/action-required';
import { computeBriefing, type BriefingItem } from './widgets/ai-briefing';
import type { AIAnalysis, DashboardEmail } from './types';

// ---------------------------------------------------------------------------
// Input type (raw from DB query, before scoring)
// ---------------------------------------------------------------------------

export type RawDashboardEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  actionTaken: boolean;
  aiAnalysis: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// Score + enrich one email
// ---------------------------------------------------------------------------

function scoreEmail(raw: RawDashboardEmail): DashboardEmail {
  const ai = raw.aiAnalysis as AIAnalysis | null;
  const { score, level } = derivePriority(ai);
  const labels = deriveAttentionLabels(ai);

  return {
    ...raw,
    priorityScore: score,
    priorityLevel: level,
    attentionLabels: labels,
    aiAnalysis: ai,
  };
}

// ---------------------------------------------------------------------------
// Full dashboard output
// ---------------------------------------------------------------------------

export type DashboardData = {
  stats: StatCards;
  todaysFocus: TodaysFocus;
  actionRequired: ActionRequiredWidget;
  briefing: BriefingItem[];
  totalEmails: number;
};

export function computeDashboard(rawEmails: RawDashboardEmail[]): DashboardData {
  const emails = rawEmails.map(scoreEmail);

  return {
    stats: computeStatCards(emails),
    todaysFocus: calculateTodaysFocus(emails),
    actionRequired: getActionRequiredWidget(emails),
    briefing: computeBriefing(emails),
    totalEmails: emails.length,
  };
}
