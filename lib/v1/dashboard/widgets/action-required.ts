// lib/v1/dashboard/widgets/action-required.ts
// Action Required section: emails needing user's action.
//
// CHANGES FROM USER'S ORIGINAL:
// - Renamed `ai_response` to `aiAnalysis` (matches DB column name)
// - Logic is UNCHANGED: filters waiting_on_me || requires_response, excludes actionTaken,
//   sorts by priority_score desc, returns total count + top 5

import type { AttentionLabel, DashboardEmail } from '../types';

export type ActionItem = {
  id: string;
  threadId: string;
  subject: string | null;
  fromName: string | null;
  fromEmail: string;
  primaryTag: string | null;                // ADDED
  attentionLabels: AttentionLabel[];         // ADDED
  priorityScore: number;
  priorityLevel: DashboardEmail['priorityLevel'];
  actionTimeframe: string;
  recommendedAction: string;                 // fallback chain FIXED
};

export type ActionRequiredWidget = {
  count: number;
  items: ActionItem[];
};

export function getActionRequiredWidget(
  emails: DashboardEmail[],
): ActionRequiredWidget {
  const actionRequiredEmails = emails
    .filter((email) => {
      const ai = email.aiAnalysis;

      const needsAction =
        ai?.waiting_on_me ||
        ai?.requires_response;

      return needsAction && !email.actionTaken;
    })
    .sort(
      (a, b) => b.priorityScore - a.priorityScore,
    );

  return {
    count: actionRequiredEmails.length,
    items: actionRequiredEmails.slice(0, 5).map((email) => ({
      id: email.id,
      threadId: email.threadId,
      subject: email.subject,
      fromName: email.fromName,
      fromEmail: email.fromEmail,
      primaryTag: String(email.aiAnalysis?.primary_tag ?? '') || null,
      attentionLabels: email.attentionLabels,
      priorityScore: email.priorityScore,
      priorityLevel: email.priorityLevel,
      actionTimeframe: String(email.aiAnalysis?.action_timeframe ?? 'no_action_needed'),
      recommendedAction:
        String(email.aiAnalysis?.recommended_action ?? '') ||
        String(email.aiAnalysis?.summary ?? '') ||
        email.snippet ||
        '',
    })),
  };
}
