// app/api/v1/calendar/send-invitation/route.ts
// POST: Send a beautiful meeting invitation email with .ics attachment.
// Uses the same Gmail send mechanism as the existing send email route.
// Body: { to[], title, date, time, duration, startTime, endTime, meetLink?, meetType?, description?, organizerName }

import { NextResponse } from 'next/server';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { generateMeetingInviteHtml } from '@/lib/v1/calendar/meeting-template';
import { generateIcs } from '@/lib/v1/calendar/ics-generator';
import { getTenantId } from '@/lib/auth/session';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, title, date, time, duration, startTime, endTime, meetLink, meetType, description, attendees } = body;

    if (!to || !Array.isArray(to) || to.length === 0 || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'to[], title, startTime, endTime are required' }, { status: 400 });
    }

    const from = await getOwnEmail(tenantId);
    if (!from) {
      return NextResponse.json({ error: 'Could not determine sender email' }, { status: 500 });
    }

    const organizerName = from.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // Generate HTML email
    const html = generateMeetingInviteHtml({
      recipientName: to.map((e: string) => e.split('@')[0]).join(', '),
      title,
      date: date ?? formatDate(startTime),
      time: time ?? formatTimeRange(startTime, endTime),
      duration: duration ?? calcDuration(startTime, endTime),
      meetLink,
      meetType,
      description,
      organizerName,
      organizerEmail: from,
      attendees: attendees ?? to,
    });

    // Generate .ics file
    const uid = `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@contextmode.app`;
    const ics = generateIcs({
      uid,
      title,
      description,
      startTime,
      endTime,
      location: meetLink,
      organizerName,
      organizerEmail: from,
      attendees: to.map((email: string) => ({ email })),
    });

    // Build multipart MIME message
    // Build multipart MIME message
    // Structure: multipart/mixed → multipart/alternative (html + ics) for Gmail to render calendar widget
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const toHeader = to.join(', ');

    const mimeMessage = [
      `From: ${organizerName} <${from}>`,
      `To: ${toHeader}`,
      `Subject: Meeting Invitation: ${title}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/calendar; method=REQUEST; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      base64Encode(ics),
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      base64Encode(html),
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    // Base64url encode for Gmail API
    const raw = base64UrlEncode(mimeMessage);

    // Send via Corsair Gmail (same mechanism as sendEmail)
    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(tenantId);

    const response = await tenant.gmail.api.messages.send({ raw });

    return NextResponse.json({
      success: true,
      messageId: (response as Record<string, unknown>).id,
      threadId: (response as Record<string, unknown>).threadId,
    });
  } catch (error) {
    console.error('[send-invitation] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64Encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  return `${fmt(start)} – ${fmt(end)} IST`;
}

function calcDuration(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60); const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`;
}
