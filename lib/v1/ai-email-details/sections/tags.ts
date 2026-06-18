// lib/v1/ai-email-details/sections/tags.ts

import type { AIAnalysis } from '../types';

export type TagsSection = {
  tags: string[];
  topics: string[];
};

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((s) => s.trim());
}

export function extractTags(ai: AIAnalysis | null): TagsSection {
  if (!ai) return { tags: [], topics: [] };

  return {
    tags: safeStringArray(ai.tags),
    topics: safeStringArray(ai.topics),
  };
}
