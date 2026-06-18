// lib/v1/ai-email-details/sections/key-insights.ts

import type { AIAnalysis } from '../types';

export type KeyInsightsSection = {
  insights: string[];
};

export function extractKeyInsights(ai: AIAnalysis | null): KeyInsightsSection {
  if (!ai || !Array.isArray(ai.importance_reasoning)) {
    return { insights: [] };
  }

  return {
    insights: ai.importance_reasoning
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((s) => s.trim()),
  };
}
