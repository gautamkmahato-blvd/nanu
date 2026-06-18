// lib/v1/ai-email-details/sections/classification.ts

import type { AIAnalysis } from '../types';

export type ClassificationSection = {
  category: string | null;
  industry: string | null;
  topicCluster: string | null;
  primaryTag: string | null;
};

function safeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function extractClassification(ai: AIAnalysis | null): ClassificationSection {
  if (!ai) return { category: null, industry: null, topicCluster: null, primaryTag: null };

  return {
    category: safeString(ai.category),
    industry: safeString(ai.industry),
    topicCluster: safeString(ai.topic_cluster),
    primaryTag: safeString(ai.primary_tag),
  };
}
