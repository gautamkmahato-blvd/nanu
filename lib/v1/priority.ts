// lib/v1/priority.ts
// Priority scoring derived from the AI analysis response.
//
// FIXES APPLIED (requested by user):
// 1. derivePriority: null guard added — returns default for emails without AI data
// 2. derivePriority: num() wrapper on score fields — prevents NaN from LLM string values
//
// ALL OTHER LOGIC IS THE USER'S ORIGINAL CODE, UNCHANGED.

export type PriorityLevel =
  | 'urgent'
  | 'important'
  | 'normal'
  | 'low';

export type AttentionType =
  | 'risk'
  | 'opportunity'
  | 'deadline'
  | 'action_required'
  | 'follow_up'
  | 'information';

export function actionTimeframeScore(timeframe?: string): number {
  const scores: Record<string, number> = {
    immediately: 100,
    next_1_hour: 90,
    next_6_hours: 80,
    next_12_hours: 70,
    next_24_hours: 60,
    next_3_days: 40,
    next_1_week: 20,
    next_1_month: 10,
    no_action_needed: 0,
  };
  return scores[timeframe || 'no_action_needed'] ?? 0;
}

export function relationshipScore(type?: string): number {
  const scores: Record<string, number> = {
    investor: 100,
    manager: 95,
    founder: 95,
    client: 90,
    partner: 85,
    lead: 75,
    vendor: 60,
    coworker: 60,
    friend: 40,
    personal_contact: 30,
    other: 20,
  };
  return scores[type || 'other'] ?? 20;
}

export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 85) return 'urgent';
  if (score >= 70) return 'important';
  if (score >= 50) return 'normal';
  return 'low';
}

export function getAttentionType(
  aiResponse: Record<string, any>,
): AttentionType {
  if (aiResponse.risk_score >= 75) {
    return 'risk';
  }
  if (aiResponse.opportunity_score >= 75) {
    return 'opportunity';
  }
  if (aiResponse.deadline_detected) {
    return 'deadline';
  }
  if (
    aiResponse.waiting_on_me ||
    aiResponse.requires_response
  ) {
    return 'action_required';
  }
  if (aiResponse.requires_followup) {
    return 'follow_up';
  }
  return 'information';
}

// --- FIX 2: safe number extraction (prevents NaN from LLM string values) ---
function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function derivePriority(
  aiResponse: Record<string, any> | null | undefined,
) {
  // --- FIX 1: null guard ---
  if (!aiResponse) {
    return {
      score: 0,
      level: 'low' as PriorityLevel,
      attentionType: 'information' as AttentionType,
    };
  }

  let score =
      num(aiResponse.urgency_score) * 0.25
    + num(aiResponse.estimated_business_value) * 0.10
    + num(aiResponse.opportunity_score) * 0.15
    + num(aiResponse.risk_score) * 0.15
    + relationshipScore(aiResponse.relationship_type) * 0.10
    + actionTimeframeScore(aiResponse.action_timeframe) * 0.25;

  if (aiResponse.requires_response) {
    score += 8;
  }
  if (aiResponse.waiting_on_me) {
    score += 10;
  }
  if (aiResponse.deadline_detected) {
    score += 10;
  }

  score = Math.max(
    0,
    Math.min(100, Math.round(score)),
  );

  return {
    score,
    level: getPriorityLevel(score),
    attentionType: getAttentionType(aiResponse),
  };
}
