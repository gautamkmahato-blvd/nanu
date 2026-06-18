// lib/v1/ai-email-details/sections/attention-signals.ts
// Uses deriveAttentionLabels from the dashboard module (user's original logic).

import type { AIAnalysis } from '../types';
import { deriveAttentionLabels } from '@/lib/v1/dashboard/attention-labels';
import type { AttentionLabel } from '@/lib/v1/dashboard/types';

export type AttentionSignalsSection = {
  labels: AttentionLabel[];
};

export function extractAttentionSignals(ai: AIAnalysis | null): AttentionSignalsSection {
  return { labels: deriveAttentionLabels(ai) };
}
