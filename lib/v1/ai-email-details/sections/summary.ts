// lib/v1/ai-email-details/sections/summary.ts

import type { AIAnalysis } from '../types';

export type SummarySection = {
  summary: string | null;
};

export function extractSummary(ai: AIAnalysis | null): SummarySection {
  if (!ai) return { summary: null };
  const raw = ai.summary;
  return { summary: typeof raw === 'string' && raw.trim() ? raw.trim() : null };
}
