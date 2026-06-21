// lib/v1/scheduled-emails/validation.ts

import { z } from 'zod';

const emailAddress = z.string().trim().toLowerCase().email('Invalid email address');

export const createScheduledEmailSchema = z.object({
  type: z.enum(['scheduled_send', 'follow_up']).default('scheduled_send'),
  threadId: z.string().max(200).optional().nullable(),
  toEmails: z.array(emailAddress).min(1, 'At least one recipient required').max(50),
  ccEmails: z.array(emailAddress).max(50).default([]),
  subject: z.string().trim().max(500, 'Subject too long').min(1, 'Subject required'),
  body: z.string().trim().min(1, 'Body required').max(100_000, 'Body too long'),
  isReply: z.boolean().default(false),
  scheduledAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      // Must be at least 1 minute in the future
      return date.getTime() > Date.now() + 60_000;
    },
    { message: 'Scheduled time must be at least 1 minute in the future' },
  ),
  // Follow-up specific
  watchEmail: z.string().email().optional().nullable(),
  followUpHours: z.number().int().min(1).max(168).optional().nullable(), // max 7 days
}).refine(
  (data) => {
    // If type is follow_up, watchEmail and followUpHours are required
    if (data.type === 'follow_up') {
      return !!data.watchEmail && !!data.followUpHours;
    }
    return true;
  },
  { message: 'Follow-up requires watchEmail and followUpHours' },
);

export const updateScheduledEmailSchema = z.object({
  subject: z.string().trim().max(500).min(1).optional(),
  body: z.string().trim().min(1).max(100_000).optional(),
  scheduledAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date.getTime() > Date.now() + 60_000;
    },
    { message: 'Scheduled time must be at least 1 minute in the future' },
  ).optional(),
  toEmails: z.array(emailAddress).min(1).max(50).optional(),
  ccEmails: z.array(emailAddress).max(50).optional(),
});

export type CreateScheduledEmailParsed = z.infer<typeof createScheduledEmailSchema>;
export type UpdateScheduledEmailParsed = z.infer<typeof updateScheduledEmailSchema>;
