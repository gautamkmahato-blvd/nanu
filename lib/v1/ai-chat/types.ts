// lib/v1/ai-chat/types.ts

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  emails?: SearchResultEmail[];
  timestamp: string;
};

export type SearchResultEmail = {
  id: string;
  thread_id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  snippet: string | null;
  received_at: string;
  summary: string | null;
  relevance_score: number;
  match_sources: ('structured' | 'fulltext' | 'semantic')[];
};

export type QueryAnalysis = {
  filters: StructuredFilter[];
  search_terms: string;
  embedding_text: string;
  intent: 'find_emails' | 'summarize' | 'count' | 'compare' | 'general';
};

export type StructuredFilter = {
  field: string;
  op: '=' | '>=' | '<=' | '>' | '<' | 'ilike';
  value: string | number | boolean;
};

// Allowed fields for structured search — prevents injection
export const ALLOWED_STRING_FIELDS = [
  'sentiment', 'relationship_type', 'category', 'industry',
  'topic_cluster', 'primary_tag', 'action_timeframe', 'stage',
  'email_type',
] as const;

export const ALLOWED_NUMERIC_FIELDS = [
  'opportunity_score', 'risk_score', 'estimated_business_value',
  'urgency_score', 'analysis_confidence',
] as const;

export const ALLOWED_BOOLEAN_FIELDS = [
  'waiting_on_me', 'requires_response', 'deadline_detected',
  'requires_followup', 'is_human_conversation',
] as const;

export const ALL_ALLOWED_FIELDS = [
  ...ALLOWED_STRING_FIELDS,
  ...ALLOWED_NUMERIC_FIELDS,
  ...ALLOWED_BOOLEAN_FIELDS,
] as const;
