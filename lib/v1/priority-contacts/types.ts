// lib/v1/priority-contacts/types.ts

export type PriorityContact = {
  id: string;
  email: string;
  name: string | null;
  notes: string | null;
  createdAt: string;
};

export type NotificationSettings = {
  telegramBotToken: string | null;
  telegramChatId: string | null;
  telegramEnabled: boolean;
};
