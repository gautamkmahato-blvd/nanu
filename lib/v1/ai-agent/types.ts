// lib/v1/ai-agent/types.ts

export type EmailContext = {
  emailId: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  bodySnippet: string;
};

export type PendingAction = {
  callId: string;
  tool: string;
  args: Record<string, unknown>;
  preview: string;
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

export type AssetResult = {
  id: string;
  emailId: string;
  type: string; // 'attachment' | 'link' | 'inline_image'
  filename: string | null;
  url: string | null;
  mimeCategory: string;
  size: number | null;
  domain: string | null;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
};

export type AgentRequest = {
  message: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  emailContext?: EmailContext;
  pendingAction?: PendingAction;
  confirmed?: boolean;
  tenantId?: string; // multi-tenant: passed from API route session
};

export type AgentResponse =
  | { status: 'done'; message: string; toolsUsed: string[]; emails?: SearchResultEmail[]; assets?: AssetResult[] }
  | { status: 'needs_confirmation'; message: string; pendingAction: PendingAction; toolsUsed: string[]; emails?: SearchResultEmail[]; assets?: AssetResult[] }
  | { status: 'error'; message: string; toolsUsed: string[]; emails?: SearchResultEmail[]; assets?: AssetResult[] };