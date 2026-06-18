// lib/v1/email-assistant/types.ts

export type AssistantResponse = {
  type: 'direct' | 'search' | 'off_topic';
  answer: string;
  emails?: SearchEmail[];
  searchStats?: {
    structured: number;
    fulltext: number;
    semantic: number;
    merged: number;
    timeMs: number;
  };
};

export type SearchEmail = {
  id: string;
  thread_id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  summary: string | null;
  received_at: string;
  match_sources: string[];
};

export type EmailContext = {
  id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  body_text: string | null;
  received_at: string;
  ai_analysis: Record<string, unknown> | null;
};

export type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};
