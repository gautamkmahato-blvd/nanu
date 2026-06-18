// lib/v1/dashboard/attention-labels.ts
// Derives attention labels from AI analysis.
// An email can have MULTIPLE labels (e.g. both "deadline" and "opportunity").
//
// CHANGES FROM USER'S ORIGINAL:
// - Renamed `ai` parameter type from AIResponse to AIAnalysis (matches DB column name)
// - Added null guard: if ai_analysis is null, returns ['information']
// - Logic inside is UNCHANGED

import type { AIAnalysis, AttentionLabel } from './types';

export function deriveAttentionLabels(
  ai: AIAnalysis | null,
): AttentionLabel[] {
  // Null guard: emails without AI analysis default to 'information'
  if (!ai) {
    return ['information'];
  }

  const labels: AttentionLabel[] = [];

  if ((ai.opportunity_score ?? 0) >= 75) {
    labels.push('opportunity');
  }

  if ((ai.risk_score ?? 0) >= 75) {
    labels.push('risk');
  }

  if (ai.waiting_on_me || ai.requires_response) {
    labels.push('action_required');
  }

  if (ai.deadline_detected) {
    labels.push('deadline');
  }

  if (ai.requires_followup) {
    labels.push('follow_up');
  }

  if (labels.length === 0) {
    labels.push('information');
  }

  return labels;
}
