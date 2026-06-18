import type { MailThread } from '@/types/mail';

export type FullMessageContent = {
  id: string;
  body: string;
  bodyHtml: string | null;
  cached: boolean;
};

export type MessageBodyRecord = {
  messageId: string;
  bodyText: string;
  bodyHtml: string | null;
};

export type SyncLatestMessagesResult = {
  synced: number;
  threads: MailThread[];
};

export type SendMessageResult = {
  id: string;
  threadId: string;
};
