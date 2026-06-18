import { z } from 'zod';

const attachmentSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  attachmentId: z.string(),
});

export const emailRowSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  labelIds: z.array(z.string()).default([]),
  isSent: z.boolean().default(false),
  isRead: z.boolean().default(false),
  isStarred: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  fromEmail: z.string().min(1),
  fromName: z.string().nullable(),
  toEmails: z.array(z.string()).default([]),
  ccEmails: z.array(z.string()).default([]),
  bccEmails: z.array(z.string()).default([]),
  subject: z.string().nullable(),
  snippet: z.string().nullable(),
  bodyText: z.string().nullable(),
  bodyHtml: z.string().nullable(),
  hasAttachments: z.boolean().default(false),
  attachments: z.array(attachmentSchema).default([]),
  messageIdHeader: z.string().nullable(),
  inReplyTo: z.string().nullable(),
  referencesHeader: z.string().nullable(),
  receivedAt: z.coerce.date(),
  historyId: z.string().nullable(),
  sizeEstimate: z.number().nullable(),
});

export type EmailRow = z.infer<typeof emailRowSchema>;
