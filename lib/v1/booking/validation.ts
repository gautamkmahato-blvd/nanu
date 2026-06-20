// lib/v1/booking/validation.ts
// Centralized Zod validation for all booking-related inputs.
// Used by public APIs to sanitize untrusted input before processing.

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .min(5, 'Email is required')
  .max(254, 'Email too long')
  .email('Invalid email address')
  .refine((e) => e.includes('.'), 'Invalid email domain');

const slugSchema = z.string()
  .trim()
  .toLowerCase()
  .min(3, 'Slug must be at least 3 characters')
  .max(30, 'Slug must be at most 30 characters')
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Slug: letters, numbers, hyphens only. Cannot start/end with hyphen.');

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
  .refine((d) => !isNaN(new Date(d + 'T00:00:00').getTime()), 'Invalid date');

const timeSchema = z.string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format')
  .refine((t) => {
    const [h, m] = t.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }, 'Invalid time');

const safeName = z.string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[^<>{}[\]\\]*$/, 'Name contains invalid characters');

const safeText = z.string()
  .trim()
  .max(1000, 'Text too long')
  .regex(/^[^<>{}[\]\\]*$/, 'Contains invalid characters')
  .default('');

// ---------------------------------------------------------------------------
// OTP request
// ---------------------------------------------------------------------------

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

// ---------------------------------------------------------------------------
// Booking request
// ---------------------------------------------------------------------------

export const bookingRequestSchema = z.object({
  name: safeName,
  email: emailSchema,
  otp: z.string().trim().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
  date: dateSchema,
  startTime: timeSchema,
  duration: z.number().int().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
  notes: safeText.optional().default(''),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

// ---------------------------------------------------------------------------
// Profile update (settings page)
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  slug: slugSchema.optional(),
  displayName: z.string().trim().min(1, 'Display name required').max(100).optional(),
  bio: z.string().trim().max(500, 'Bio too long').optional(),
  timezone: z.string().min(1).max(100).optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).min(1, 'Select at least one day').optional(),
  hoursStart: timeSchema.optional(),
  hoursEnd: timeSchema.optional(),
  durationOptions: z.array(z.number().int().min(5).max(480)).min(1, 'At least one duration required').optional(),
  defaultDuration: z.number().int().min(5).max(480).optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
  maxAdvanceDays: z.number().int().min(1).max(365).optional(),
  maxBookingsPerDay: z.number().int().min(1).max(100).optional(),
  meetingTitleTemplate: z.string().trim().max(200).optional(),
  includeMeet: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.hoursStart && data.hoursEnd) {
    const [sh, sm] = data.hoursStart.split(':').map(Number);
    const [eh, em] = data.hoursEnd.split(':').map(Number);
    return (eh * 60 + em) > (sh * 60 + sm);
  }
  return true;
}, { message: 'End time must be after start time', path: ['hoursEnd'] });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ---------------------------------------------------------------------------
// Availability query params
// ---------------------------------------------------------------------------

export const availabilityQuerySchema = z.object({
  date: dateSchema,
  duration: z.coerce.number().int().min(5).max(480),
});

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;

// ---------------------------------------------------------------------------
// Helper: format Zod errors into a single string
// ---------------------------------------------------------------------------

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join('. ');
}
