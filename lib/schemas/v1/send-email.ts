// lib/schemas/v1/send-email.ts  (UPDATED — adds replyEmailSchema)
import { z } from 'zod';

const emailAddress = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Invalid email address' }));

export const sendEmailSchema = z.object({
  to: z
    .array(emailAddress)
    .min(1, 'At least one recipient is required')
    .max(50, 'Too many recipients (max 50)'),
  cc: z.array(emailAddress).max(50, 'Too many cc recipients (max 50)').default([]),
  subject: z
    .string()
    .trim()
    .max(500, 'Subject is too long (max 500 characters)')
    .default(''),
  body: z
    .string()
    .trim()
    .min(1, 'Message body is required')
    .max(100_000, 'Message body is too long'),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

// Reply: recipients, subject, and threading headers are all derived
// server-side from the thread — the client only supplies the body and mode.
export const replyEmailSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Message body is required')
    .max(100_000, 'Message body is too long'),
  mode: z.enum(['reply', 'replyAll']).default('reply'),
});

export type ReplyEmailInput = z.infer<typeof replyEmailSchema>;
