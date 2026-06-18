// lib/v1/ai-email-details/sections/pipeline-stage.ts

import type { AIAnalysis, PipelineStage } from '../types';
import { PIPELINE_STAGES } from '../types';

export type PipelineStageSection = {
  current: PipelineStage;
  stages: PipelineStage[];
};

export function extractPipelineStage(ai: AIAnalysis | null): PipelineStageSection {
  const raw = typeof ai?.stage === 'string' ? ai.stage : 'unknown';
  const current: PipelineStage = PIPELINE_STAGES.includes(raw as PipelineStage)
    ? (raw as PipelineStage)
    : 'unknown';

  return {
    current,
    stages: PIPELINE_STAGES,
  };
}
