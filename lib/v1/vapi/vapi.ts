// lib/v1/reminders/vapi.ts
// Makes outbound phone calls via Corsair's Vapi plugin.
// Uses a "platform" tenant for shared Vapi credentials.

import { corsair } from '@/corsair';
import type { UpcomingMeeting } from './types';

const PLATFORM_TENANT = process.env.VAPI_TENANT_ID || 'platform';
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID!;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID!;

/**
 * Trigger an outbound Vapi call to remind the user about an upcoming meeting.
 * Returns the Vapi call ID on success.
 */
export async function triggerReminderCall(
  phoneNumber: string,
  userName: string,
  meeting: UpcomingMeeting,
): Promise<{ callId: string }> {
  if (!VAPI_PHONE_NUMBER_ID || !VAPI_ASSISTANT_ID) {
    throw new Error('Vapi not configured: VAPI_PHONE_NUMBER_ID and VAPI_ASSISTANT_ID required');
  }

  // Build a concise, informative first message
  const startTime = formatTime(meeting.startTime);
  const attendeeList = meeting.attendees.length > 0
    ? meeting.attendees.slice(0, 3).join(', ') + (meeting.attendees.length > 3 ? ` and ${meeting.attendees.length - 3} others` : '')
    : 'no other attendees listed';

  const firstMessage = [
    `Hi ${userName}.`,
    `You have a meeting starting in ${meeting.minutesUntilStart} minutes.`,
    `${meeting.summary}.`,
    `With ${attendeeList}.`,
    meeting.hangoutLink ? `A Google Meet link is ready in your calendar.` : '',
    `Have a great meeting!`,
  ].filter(Boolean).join(' ');

  const platform = corsair.withTenant(PLATFORM_TENANT);

  const result = await (platform as any).vapi.api.calls.create({
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    assistantId: VAPI_ASSISTANT_ID,
    customer: {
      number: phoneNumber,
    },
    assistantOverrides: {
      firstMessage,
    },
  });

  const callId = (result as any)?.id ?? 'unknown';
  console.log(`[reminder:vapi] call triggered → ${phoneNumber} for "${meeting.summary}" (call: ${callId})`);

  return { callId };
}

/**
 * Format ISO datetime to readable time (e.g., "10:30 AM")
 */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return iso;
  }
}
