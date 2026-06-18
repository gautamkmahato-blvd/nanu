// lib/v1/dashboard/widgets/ai-briefing.ts
// AI Briefing card: top notable items for the day.
// NEW — this function was NOT in the user's original logic.
// Added to populate the "AI Briefing" card in the dashboard design.

import type { DashboardEmail } from '../types';

export type BriefingItem = {
  emoji: string;
  text: string;
  emailId: string;
  threadId: string;
};

const LABEL_EMOJI: Record<string, string> = {
  risk: '🔴',
  opportunity: '💰',
  deadline: '⏰',
  action_required: '↩️',
  follow_up: '📋',
  information: 'ℹ️',
};

function senderName(fromName: string | null, fromEmail: string): string {
  if (fromName) return fromName;
  const at = fromEmail.indexOf('@');
  return at > 0 ? fromEmail.slice(0, at) : fromEmail;
}

export function computeBriefing(emails: DashboardEmail[]): BriefingItem[] {
  return emails
    .filter((e) => e.priorityScore >= 60 && e.aiAnalysis?.summary)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4)
    .map((e) => {
      // Pick the first non-information label for the emoji
      const topLabel = e.attentionLabels.find((l) => l !== 'information') ?? 'information';
      const emoji = LABEL_EMOJI[topLabel] ?? 'ℹ️';
      const sender = senderName(e.fromName, e.fromEmail);

      return {
        emoji,
        text: `${sender}: ${String(e.aiAnalysis?.summary ?? '')}`.slice(0, 120),
        emailId: e.id,
        threadId: e.threadId,
      };
    });
}
