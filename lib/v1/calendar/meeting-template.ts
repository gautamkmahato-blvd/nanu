// lib/v1/calendar/meeting-template.ts
// Generates a beautiful HTML email for meeting invitations.

type MeetingTemplateInput = {
  recipientName: string;
  title: string;
  date: string;         // "Tuesday, Jun 16, 2026"
  time: string;         // "8:00 AM – 8:30 AM IST"
  duration: string;     // "30 minutes"
  meetLink?: string;     // Google Meet / Zoom / custom URL
  meetType?: string;     // "Google Meet" | "Zoom" | "Custom"
  description?: string;  // AI-generated agenda
  organizerName: string;
  organizerEmail: string;
  attendees: string[];   // list of attendee emails
};

export function generateMeetingInviteHtml(input: MeetingTemplateInput): string {
  const {
    recipientName,
    title,
    date,
    time,
    duration,
    meetLink,
    meetType,
    description,
    organizerName,
    organizerEmail,
    attendees,
  } = input;

  const meetLabel = meetType ?? (meetLink?.includes('zoom') ? 'Zoom' : meetLink?.includes('meet.google') ? 'Google Meet' : 'Virtual');

  const meetButton = meetLink
    ? `<a href="${meetLink}" style="display:inline-block;padding:12px 28px;background-color:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;letter-spacing:0.02em;">Join Meeting</a>`
    : '';

  const descriptionBlock = description
    ? `
      <tr><td style="padding:20px 32px 0;">
        <div style="background-color:#f3f0ff;border-radius:10px;padding:16px 20px;">
          <div style="font-size:12px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Meeting Agenda</div>
          <div style="font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml(description)}</div>
        </div>
      </td></tr>`
    : '';

  const attendeesList = attendees.length > 0
    ? attendees.map((a) => `<span style="display:inline-block;padding:3px 10px;background-color:#f3f4f6;border-radius:12px;font-size:11px;color:#6b7280;margin:2px 2px;">${escapeHtml(a)}</span>`).join('')
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="font-size:28px;">📅</div>
            <div>
              <div style="font-size:12px;color:#c4b5fd;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Meeting Invitation</div>
              <div style="font-size:20px;font-weight:700;color:#ffffff;margin-top:2px;">${escapeHtml(title)}</div>
            </div>
          </div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:24px 32px 8px;">
          <div style="font-size:14px;color:#374151;">Hi <strong>${escapeHtml(recipientName)}</strong>,</div>
          <div style="font-size:14px;color:#6b7280;margin-top:4px;">You're invited to a meeting. Here are the details:</div>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:12px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('📅', 'Date', date)}
            ${detailRow('🕐', 'Time', `${time} · ${duration}`)}
            ${meetLink ? detailRow('📹', 'Meeting', `<a href="${meetLink}" style="color:#7c3aed;text-decoration:none;">${meetLabel}</a>`) : ''}
            ${detailRow('👤', 'Organizer', `${escapeHtml(organizerName)} (${escapeHtml(organizerEmail)})`)}
          </table>
        </td></tr>

        <!-- AI Description -->
        ${descriptionBlock}

        <!-- Join Button -->
        ${meetButton ? `
        <tr><td style="padding:24px 32px 0;" align="center">
          ${meetButton}
        </td></tr>` : ''}

        <!-- Attendees -->
        ${attendeesList ? `
        <tr><td style="padding:20px 32px 0;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Attendees</div>
          <div>${attendeesList}</div>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="padding:24px 32px 28px;">
          <div style="border-top:1px solid #f3f4f6;padding-top:16px;text-align:center;">
            <div style="font-size:12px;color:#9ca3af;">Sent via <strong style="color:#7c3aed;">Context Mode</strong></div>
            <div style="font-size:11px;color:#d1d5db;margin-top:2px;">Relationship-first email workspace</div>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(icon: string, label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;vertical-align:top;" width="40">
        <div style="width:36px;height:36px;background-color:#f3f0ff;border-radius:10px;text-align:center;line-height:36px;font-size:16px;">${icon}</div>
      </td>
      <td style="padding:8px 0 8px 12px;vertical-align:middle;">
        <div style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${label}</div>
        <div style="font-size:14px;color:#374151;font-weight:500;">${value}</div>
      </td>
    </tr>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
