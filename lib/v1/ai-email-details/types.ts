// lib/v1/ai-email-details/types.ts

export type AIAnalysis = Record<string, unknown>;

export type ActionItem = {
  task: string;
  owner: 'sender' | 'recipient' | 'unknown';
  dueDate: string | null;
};

export type Entity = {
  name: string;
  type: string;
};

export type PipelineStage =
  | 'unknown'
  | 'lead'
  | 'discovery'
  | 'proposal'
  | 'negotiation'
  | 'contract'
  | 'closed_won'
  | 'closed_lost';

export const PIPELINE_STAGES: PipelineStage[] = [
  'lead',
  'discovery',
  'proposal',
  'negotiation',
  'contract',
  'closed_won',
  'closed_lost',
];
