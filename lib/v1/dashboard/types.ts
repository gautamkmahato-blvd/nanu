// lib/v1/dashboard/types.ts
// Shared types across all dashboard widgets.

export type PriorityLevel = 'urgent' | 'important' | 'normal' | 'low';

export type AttentionLabel =
  | 'opportunity'
  | 'risk'
  | 'action_required'
  | 'deadline'
  | 'follow_up'
  | 'information';

export type AIAnalysis = {
  opportunity_score?: number;
  risk_score?: number;
  waiting_on_me?: boolean;
  requires_response?: boolean;
  requires_followup?: boolean;
  deadline_detected?: boolean;
  action_timeframe?: string;
  recommended_action?: string;
  summary?: string;
  [key: string]: unknown;
};

export type DashboardEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  attentionLabels: AttentionLabel[];
  actionTaken: boolean;
  aiAnalysis: AIAnalysis | null;
};
