// app/api/public/booking/[slug]/book/route.ts
// Public — creates booking with Zod validation + OTP check + email confirmations.

import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug, verifyOtp, countBookingsForDate, createBooking } from '@/lib/v1/booking/queries';
import { getAvailableSlots } from '@/lib/v1/booking/availability';
import { limitBooking } from '@/lib/v1/booking/rate-limit';
import { bookingRequestSchema, formatZodError } from '@/lib/v1/booking/validation';
import { getFreshAccessToken } from '@/lib/v1/booking/token';

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

  // Rate limit
  const limit = limitBooking(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } });
  }

  // Parse + validate
  let input;
  try {
    const body = await req.json();
    const result = bookingRequestSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: formatZodError(result.error) }, { status: 400 });
    input = result.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Get profile
  const profile = await getProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify OTP
  const otpResult = await verifyOtp(input.email, slug, input.otp);
  if (!otpResult.valid) {
    return NextResponse.json({ error: otpResult.reason ?? 'Invalid verification code' }, { status: 403 });
  }

  // Verify slot still available
  const result = await getAvailableSlots(profile, input.date, input.duration);
  const slotExists = result.available.some((s) => s.start === input.startTime);
  if (!slotExists) {
    return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 });
  }

  // Check max bookings per day
  const dailyCount = await countBookingsForDate(profile.id, input.date);
  if (dailyCount >= profile.maxBookingsPerDay) {
    return NextResponse.json({ error: 'No more bookings available for this day.' }, { status: 409 });
  }

  // Calculate end time
  const [sh, sm] = input.startTime.split(':').map(Number);
  const endMin = sh * 60 + sm + input.duration;
  const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

  // Create Google Calendar event
  let googleEventId: string | null = null;
  let meetLink: string | null = null;

  try {
    const { corsair } = await import('@/corsair');
    const tenant = corsair.withTenant(profile.tenantId);

    const meetingTitle = profile.meetingTitleTemplate
      .replace('{{guest_name}}', input.name)
      .replace('{{host_name}}', profile.displayName || 'Host');

    const eventBody: Record<string, unknown> = {
      summary: meetingTitle,
      start: { dateTime: `${input.date}T${input.startTime}:00`, timeZone: profile.timezone },
      end: { dateTime: `${input.date}T${endTime}:00`, timeZone: profile.timezone },
      attendees: [{ email: input.email }],
      description: input.notes
        ? `Booked via Context Mode\n\nNotes from ${input.name}:\n${input.notes}`
        : `Booked via Context Mode`,
    };

    const createParams: Record<string, unknown> = {
      calendarId: 'primary', sendUpdates: 'all', event: eventBody,
    };

    if (profile.includeMeet) {
      createParams.conferenceDataVersion = 1;
      eventBody.conferenceData = {
        createRequest: { requestId: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, conferenceSolutionKey: { type: 'hangoutsMeet' } },
      };
    }

    const event = await tenant.googlecalendar.api.events.create(createParams as any);
    googleEventId = (event as any)?.id ?? null;
    meetLink = (event as any)?.hangoutLink ?? (event as any)?.conferenceData?.entryPoints?.[0]?.uri ?? null;
  } catch (err) {
    console.error('[booking:book] Calendar create failed:', err);
    return NextResponse.json({ error: 'Failed to create calendar event.' }, { status: 500 });
  }

  // Save to DB
  let booking;
  try {
    booking = await createBooking({
      tenantId: profile.tenantId, profileId: profile.id,
      guestName: input.name, guestEmail: input.email, notes: input.notes ?? '',
      date: input.date, startTime: input.startTime, endTime, durationMinutes: input.duration,
      timezone: profile.timezone, googleEventId: googleEventId ?? undefined, meetLink: meetLink ?? undefined,
    });
  } catch (err) {
    console.error('[booking:book] DB save failed:', err);
  }

  // Send confirmation emails (fire-and-forget)
  sendConfirmationEmails(profile, input.name, input.email, input.date, input.startTime, endTime, input.duration, meetLink, input.notes ?? '').catch((err) =>
    console.error('[booking:book] confirmation email failed:', err),
  );

  return NextResponse.json({
    success: true,
    booking: {
      id: booking?.id, date: input.date, startTime: input.startTime, endTime,
      duration: input.duration, timezone: profile.timezone, meetLink, hostName: profile.displayName,
    },
  }, { status: 201 });
}

// ---------------------------------------------------------------------------
// Send confirmation emails to both guest and host
// ---------------------------------------------------------------------------

async function sendConfirmationEmails(
  profile: { tenantId: string; displayName: string; timezone: string },
  guestName: string, guestEmail: string,
  date: string, startTime: string, endTime: string,
  duration: number, meetLink: string | null, notes: string,
) {
  const accessToken = await getFreshAccessToken(profile.tenantId, 'gmail');
  if (!accessToken) return;

  // Get host's email from Gmail API
  let hostEmail: string | null = null;
  try {
    const meRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      hostEmail = meData.emailAddress ?? null;
    }
  } catch {}

  const dateDisplay = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const fmtTime = (t: string) => { const [h, m] = t.split(':').map(Number); const hr = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${hr}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

  const guestBody = [
    `Hi ${guestName},`, ``,
    `Your meeting with ${profile.displayName} is confirmed!`, ``,
    `📅 Date: ${dateDisplay}`,
    `🕐 Time: ${fmtTime(startTime)} - ${fmtTime(endTime)} (${duration} min)`,
    `🌍 Timezone: ${profile.timezone}`,
    meetLink ? `📹 Meeting Link: ${meetLink}` : '',
    ``, `A calendar invitation has also been sent to your email.`,
    ``, `— Context Mode`,
  ].filter(Boolean).join('\n');

  const hostBody = [
    `Hi ${profile.displayName},`, ``,
    `You have a new booking!`, ``,
    `👤 Guest: ${guestName} (${guestEmail})`,
    `📅 Date: ${dateDisplay}`,
    `🕐 Time: ${fmtTime(startTime)} - ${fmtTime(endTime)} (${duration} min)`,
    meetLink ? `📹 Meeting Link: ${meetLink}` : '',
    notes ? `📝 Notes: ${notes}` : '',
    ``, `— Context Mode`,
  ].filter(Boolean).join('\n');

  const sendMail = async (to: string, subject: string, body: string) => {
    const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`, 'utf-8').toString('base64url');
    await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
  };

  await Promise.allSettled([
    sendMail(guestEmail, `Meeting Confirmed: ${dateDisplay} at ${fmtTime(startTime)}`, guestBody),
    hostEmail ? sendMail(hostEmail, `New Booking: ${guestName} on ${dateDisplay}`, hostBody) : Promise.resolve(),
  ]);
}
