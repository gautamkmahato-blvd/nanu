// lib/v1/reminders/scheduler.ts
// Core scheduler logic. Called every 60 seconds by the cron endpoint.
// 1. Gets all tenants with reminders enabled
// 2. For each tenant, fetches upcoming calendar events
// 3. Checks if any events start within the reminder window
// 4. Triggers Vapi calls for unnotified meetings

import { corsair } from '@/corsair';
import {
  getEnabledTenants, hasReminderBeenSent, logReminder, countRecentCalls,
} from './queries';
import { triggerReminderCall } from './vapi';
import type { UpcomingMeeting, ReminderSettings } from './types';

const MAX_CALLS_PER_HOUR = 10;

/**
 * Main scheduler tick. Called once per minute.
 * Returns a summary of actions taken.
 */
export async function runSchedulerTick(): Promise<{
  tenantsChecked: number;
  callsTriggered: number;
  errors: string[];
}> {
  const summary = { tenantsChecked: 0, callsTriggered: 0, errors: [] as string[] };

  try {
    const tenants = await getEnabledTenants();
    summary.tenantsChecked = tenants.length;

    for (const settings of tenants) {
      try {
        await processTenant(settings, summary);
      } catch (err) {
        const msg = `Tenant ${settings.tenantId}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error(`[reminder:scheduler] ${msg}`);
        summary.errors.push(msg);
      }
    }
  } catch (err) {
    console.error('[reminder:scheduler] fatal:', err);
    summary.errors.push(err instanceof Error ? err.message : 'Fatal error');
  }

  return summary;
}

/**
 * Process a single tenant: fetch meetings, check window, trigger calls.
 */
async function processTenant(
  settings: ReminderSettings,
  summary: { callsTriggered: number; errors: string[] },
): Promise<void> {
  const { tenantId, phoneNumber, reminderMinutes, timezone } = settings;

  if (!phoneNumber) return;

  // Check quiet hours
  if (isQuietHours(settings)) {
    return;
  }

  // Rate limit: max calls per hour
  const recentCalls = await countRecentCalls(tenantId);
  if (recentCalls >= MAX_CALLS_PER_HOUR) {
    console.log(`[reminder:scheduler] ${tenantId}: rate limited (${recentCalls} calls this hour)`);
    return;
  }

  // Fetch upcoming meetings from Google Calendar
  const meetings = await fetchUpcomingMeetings(tenantId, reminderMinutes);

  for (const meeting of meetings) {
    // Skip if already notified
    const alreadySent = await hasReminderBeenSent(tenantId, meeting.id, 'vapi');
    if (alreadySent) continue;

    // Only trigger if meeting starts within the window (±1 min tolerance)
    if (meeting.minutesUntilStart > reminderMinutes + 1) continue;
    if (meeting.minutesUntilStart < 0) continue; // Already started

    // Get the user's name from session/profile for the greeting
    const userName = await getTenantName(tenantId);

    try {
      const { callId } = await triggerReminderCall(phoneNumber, userName, meeting);

      await logReminder({
        tenantId,
        eventId: meeting.id,
        eventSummary: meeting.summary,
        phoneNumber,
        callType: 'vapi',
        status: 'triggered',
        vapiCallId: callId,
      });

      summary.callsTriggered++;
      console.log(`[reminder:scheduler] ✓ call triggered for ${tenantId}: "${meeting.summary}" in ${meeting.minutesUntilStart}min`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Call failed';
      console.error(`[reminder:scheduler] ✗ call failed for ${tenantId}: ${errMsg}`);

      await logReminder({
        tenantId,
        eventId: meeting.id,
        eventSummary: meeting.summary,
        phoneNumber,
        callType: 'vapi',
        status: 'failed',
        error: errMsg,
      });

      summary.errors.push(`${tenantId}: ${errMsg}`);
    }
  }
}

/**
 * Fetch upcoming meetings from Google Calendar for a tenant.
 * Returns meetings starting within the next (reminderMinutes + 2) minutes.
 */
async function fetchUpcomingMeetings(tenantId: string, reminderMinutes: number): Promise<UpcomingMeeting[]> {
  try {
    const tenant = corsair.withTenant(tenantId);

    const now = new Date();
    const windowEnd = new Date(now.getTime() + (reminderMinutes + 2) * 60000);

    const events = await tenant.googlecalendar.api.events.getMany({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: windowEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    } as any);

    const items = ((events as any)?.items ?? events) as any[];
    if (!Array.isArray(items)) return [];

    return items
      .filter((e: any) => e.start?.dateTime) // Skip all-day events
      .map((e: any) => {
        const startTime = e.start.dateTime;
        const startMs = new Date(startTime).getTime();
        const minutesUntil = Math.round((startMs - now.getTime()) / 60000);

        return {
          id: e.id ?? '',
          summary: e.summary ?? 'Untitled Meeting',
          startTime,
          endTime: e.end?.dateTime ?? startTime,
          attendees: (e.attendees ?? [])
            .filter((a: any) => !a.self)
            .map((a: any) => a.displayName || a.email)
            .slice(0, 5),
          hangoutLink: e.hangoutLink ?? null,
          minutesUntilStart: minutesUntil,
        };
      });
  } catch (err) {
    console.error(`[reminder:scheduler] failed to fetch calendar for ${tenantId}:`, err);
    return [];
  }
}

/**
 * Check if current time is within quiet hours for the tenant.
 */
function isQuietHours(settings: ReminderSettings): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: settings.timezone,
    });
    const currentTime = formatter.format(now);
    const [ch, cm] = currentTime.split(':').map(Number);
    const currentMin = ch * 60 + cm;

    const [sh, sm] = settings.quietHoursStart.split(':').map(Number);
    const startMin = sh * 60 + sm;

    const [eh, em] = settings.quietHoursEnd.split(':').map(Number);
    const endMin = eh * 60 + em;

    // Handle overnight quiet hours (e.g., 22:00 → 07:00)
    if (startMin > endMin) {
      return currentMin >= startMin || currentMin < endMin;
    }
    return currentMin >= startMin && currentMin < endMin;
  } catch {
    return false;
  }
}

/**
 * Get a display name for the tenant (for the phone greeting).
 */
async function getTenantName(tenantId: string): Promise<string> {
  try {
    const { db: database } = await import('@/db');
    const { sql } = await import('drizzle-orm');
    const result = await database.execute(sql`
      SELECT display_name FROM booking_profiles WHERE tenant_id = ${tenantId} LIMIT 1
    `);
    if (result.rows[0]) return String((result.rows[0] as any).display_name || 'there');

    // Fallback: try session name from emails
    const emailResult = await database.execute(sql`
      SELECT from_name FROM emails WHERE tenant_id = ${tenantId} AND is_sent = true LIMIT 1
    `);
    if (emailResult.rows[0]) return String((emailResult.rows[0] as any).from_name || 'there');

    return 'there';
  } catch {
    return 'there';
  }
}
