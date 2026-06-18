// lib/v1/ai-email-details/sections/relationship.ts

import type { AIAnalysis } from '../types';

export type RelationshipSection = {
  type: string;
  sentiment: string;
  isHumanConversation: boolean;
};

export function extractRelationship(ai: AIAnalysis | null): RelationshipSection {
  if (!ai) return { type: 'unknown', sentiment: 'neutral', isHumanConversation: true };

  return {
    type: typeof ai.relationship_type === 'string' ? ai.relationship_type : 'unknown',
    sentiment: typeof ai.sentiment === 'string' ? ai.sentiment : 'neutral',
    isHumanConversation: ai.is_human_conversation !== false,
  };
}
