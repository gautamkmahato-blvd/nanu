// lib/v1/ai-email-details/sections/business-intelligence.ts

import type { AIAnalysis } from '../types';

export type BusinessIntelligenceSection = {
  opportunityScore: number;
  businessValue: number;
  riskScore: number;
};

function safeScore(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
}

export function extractBusinessIntelligence(ai: AIAnalysis | null): BusinessIntelligenceSection {
  if (!ai) return { opportunityScore: 0, businessValue: 0, riskScore: 0 };

  return {
    opportunityScore: safeScore(ai.opportunity_score),
    businessValue: safeScore(ai.estimated_business_value),
    riskScore: safeScore(ai.risk_score),
  };
}
