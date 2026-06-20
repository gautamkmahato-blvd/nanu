// lib/v1/reminders/types.ts

export type ReminderSettings = {
  id: string;
  tenantId: string;
  phoneNumber: string | null;
  callEnabled: boolean;
  telegramEnabled: boolean;
  reminderMinutes: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type ReminderLog = {
  id: string;
  tenantId: string;
  eventId: string;
  eventSummary: string;
  phoneNumber: string | null;
  callType: 'vapi' | 'telegram';
  status: 'triggered' | 'completed' | 'failed';
  vapiCallId: string | null;
  error: string | null;
  createdAt: string;
};

export type UpcomingMeeting = {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  hangoutLink: string | null;
  minutesUntilStart: number;
};
