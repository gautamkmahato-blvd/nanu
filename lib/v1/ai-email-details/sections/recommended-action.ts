// lib/v1/ai-email-details/sections/recommended-action.ts

import type { AIAnalysis } from '../types';

export type RecommendedActionSection = {
  recommendedAction: string | null;
};

export function extractRecommendedAction(ai: AIAnalysis | null): RecommendedActionSection {
  if (!ai) return { recommendedAction: null };
  const raw = ai.recommended_action;
  return { recommendedAction: typeof raw === 'string' && raw.trim() ? raw.trim() : null };
}
