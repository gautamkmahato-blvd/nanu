// lib/v1/reminders/validation.ts

import { z } from 'zod';

// E.164 phone number format: +[country code][number], 7-15 digits total
const phoneSchema = z.string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, 'Phone number must be in E.164 format (e.g., +919876543210)')
  .nullable()
  .optional();

const timeSchema = z.string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format');

export const reminderSettingsSchema = z.object({
  phoneNumber: phoneSchema,
  callEnabled: z.boolean().optional(),
  telegramEnabled: z.boolean().optional(),
  reminderMinutes: z.number().int().min(1, 'Minimum 1 minute').max(30, 'Maximum 30 minutes').optional(),
  quietHoursStart: timeSchema.optional(),
  quietHoursEnd: timeSchema.optional(),
  timezone: z.string().min(1).max(100).optional(),
}).refine((data) => {
  // If enabling calls, phone number is required
  if (data.callEnabled && !data.phoneNumber) {
    return false;
  }
  return true;
}, { message: 'Phone number is required to enable call reminders', path: ['phoneNumber'] });

export type ReminderSettingsInput = z.infer<typeof reminderSettingsSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join('. ');
}
