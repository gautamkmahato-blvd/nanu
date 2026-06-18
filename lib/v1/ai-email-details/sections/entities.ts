// lib/v1/ai-email-details/sections/entities.ts

import type { AIAnalysis, Entity } from '../types';

export type EntitiesSection = {
  entities: Entity[];
};

export function extractEntities(ai: AIAnalysis | null): EntitiesSection {
  if (!ai || !Array.isArray(ai.entities)) {
    return { entities: [] };
  }

  const entities: Entity[] = [];

  for (const raw of ai.entities) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) continue;

    entities.push({
      name,
      type: typeof item.type === 'string' ? item.type : 'other',
    });
  }

  return { entities };
}
