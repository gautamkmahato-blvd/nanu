// lib/v1/scheduled-emails/types.ts

export type ScheduledEmailType = 'scheduled_send' | 'follow_up';
export type ScheduledEmailStatus = 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed';

export type ScheduledEmail = {
  id: string;
  tenantId: string;
  type: ScheduledEmailType;
  threadId: string | null;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  body: string;
  isReply: boolean;
  scheduledAt: string;
  watchEmail: string | null;
  followUpHours: number | null;
  status: ScheduledEmailStatus;
  sentAt: string | null;
  error: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateScheduledEmailInput = {
  type?: ScheduledEmailType;
  threadId?: string;
  toEmails: string[];
  ccEmails?: string[];
  subject: string;
  body: string;
  isReply?: boolean;
  scheduledAt: string;
  // Follow-up only
  watchEmail?: string;
  followUpHours?: number;
};

export type UpdateScheduledEmailInput = {
  subject?: string;
  body?: string;
  scheduledAt?: string;
  toEmails?: string[];
  ccEmails?: string[];
};

export const MAX_RETRY_COUNT = 3;
export const STALE_PROCESSING_MINUTES = 5;
