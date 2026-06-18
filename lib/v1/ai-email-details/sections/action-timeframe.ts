// lib/v1/ai-email-details/sections/action-timeframe.ts

import type { AIAnalysis } from '../types';

const TIMEFRAME_LABELS: Record<string, string> = {
  immediately: 'Immediately',
  next_1_hour: 'Next 1 Hour',
  next_6_hours: 'Next 6 Hours',
  next_12_hours: 'Next 12 Hours',
  next_24_hours: 'Next 24 Hours',
  next_3_days: 'Next 3 Days',
  next_1_week: 'Next 1 Week',
  next_1_month: 'Next 1 Month',
  no_action_needed: 'No Action Needed',
};

const TIMEFRAME_URGENCY: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'none'> = {
  immediately: 'critical',
  next_1_hour: 'critical',
  next_6_hours: 'high',
  next_12_hours: 'high',
  next_24_hours: 'medium',
  next_3_days: 'medium',
  next_1_week: 'low',
  next_1_month: 'low',
  no_action_needed: 'none',
};

export type ActionTimeframeSection = {
  raw: string;
  label: string;
  urgency: 'critical' | 'high' | 'medium' | 'low' | 'none';
  deadline: string | null;
};

export function extractActionTimeframe(ai: AIAnalysis | null): ActionTimeframeSection {
  const raw = typeof ai?.action_timeframe === 'string' ? ai.action_timeframe : 'no_action_needed';
  const deadline = typeof ai?.deadline === 'string' ? ai.deadline : null;

  return {
    raw,
    label: TIMEFRAME_LABELS[raw] ?? raw,
    urgency: TIMEFRAME_URGENCY[raw] ?? 'none',
    deadline,
  };
}
