// lib/v1/ai-email-details/index.ts
// Extracts all AI intelligence sections from a single email's ai_analysis.

import type { AIAnalysis } from './types';
import { extractSummary, type SummarySection } from './sections/summary';
import { extractRecommendedAction, type RecommendedActionSection } from './sections/recommended-action';
import { extractAttentionSignals, type AttentionSignalsSection } from './sections/attention-signals';
import { extractActionTimeframe, type ActionTimeframeSection } from './sections/action-timeframe';
import { extractActionItems, type ActionItemsSection } from './sections/action-items';
import { extractKeyInsights, type KeyInsightsSection } from './sections/key-insights';
import { extractBusinessIntelligence, type BusinessIntelligenceSection } from './sections/business-intelligence';
import { extractRelationship, type RelationshipSection } from './sections/relationship';
import { extractClassification, type ClassificationSection } from './sections/classification';
import { extractTags, type TagsSection } from './sections/tags';
import { extractEntities, type EntitiesSection } from './sections/entities';
import { extractPipelineStage, type PipelineStageSection } from './sections/pipeline-stage';

export type EmailIntelligence = {
  summary: SummarySection;
  recommendedAction: RecommendedActionSection;
  attentionSignals: AttentionSignalsSection;
  actionTimeframe: ActionTimeframeSection;
  actionItems: ActionItemsSection;
  keyInsights: KeyInsightsSection;
  businessIntelligence: BusinessIntelligenceSection;
  relationship: RelationshipSection;
  classification: ClassificationSection;
  tags: TagsSection;
  entities: EntitiesSection;
  pipelineStage: PipelineStageSection;
  hasAiData: boolean;
};

export function extractEmailIntelligence(ai: AIAnalysis | null): EmailIntelligence {
  return {
    summary: extractSummary(ai),
    recommendedAction: extractRecommendedAction(ai),
    attentionSignals: extractAttentionSignals(ai),
    actionTimeframe: extractActionTimeframe(ai),
    actionItems: extractActionItems(ai),
    keyInsights: extractKeyInsights(ai),
    businessIntelligence: extractBusinessIntelligence(ai),
    relationship: extractRelationship(ai),
    classification: extractClassification(ai),
    tags: extractTags(ai),
    entities: extractEntities(ai),
    pipelineStage: extractPipelineStage(ai),
    hasAiData: ai !== null && ai !== undefined,
  };
}
