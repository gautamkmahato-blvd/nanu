export type MailCategory = 'primary' | 'promotion' | 'social';

export type MailFolder = 'inbox' | 'sent';

export type MailParticipant = {
  name: string;
  email: string;
};

export type MailMessage = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  senderName: string;
  senderEmail: string;
  to: string;
  recipientName: string;
  recipientEmail: string;
  snippet: string;
  body: string;
  date: string;
  timestamp: number;
  labels: string[];
  category: MailCategory;
  starred: boolean;
};

export type MailThread = {
  threadId: string;
  latestMessageId: string;
  subject: string;
  from: string;
  senderName: string;
  senderEmail: string;
  to: string;
  recipientName: string;
  recipientEmail: string;
  participantLabel: string;
  participants: MailParticipant[];
  snippet: string;
  date: string;
  timestamp: number;
  labels: string[];
  category: MailCategory;
  starred: boolean;
  unread: boolean;
  messageCount: number;
};

export type MailConversationMessage = MailMessage & {
  fullBody?: string;
  fullBodyHtml?: string | null;
  fullBodyCached?: boolean;
};

export type MailConversation = {
  threadId: string;
  subject: string;
  messages: MailConversationMessage[];
  source: 'db' | 'api';
};

export type MailNavItem = {
  id: string;
  label: string;
  icon: string;
  count?: number;
};

export type MailLabel = {
  id: string;
  label: string;
  color: string;
  count?: number;
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
};
