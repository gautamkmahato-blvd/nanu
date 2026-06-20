// lib/v1/booking/otp.ts
// OTP generation + email sending via host's Gmail (with token refresh).

import crypto from 'crypto';
import { getFreshAccessToken } from './token';
import type { BookingProfile } from './types';

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function sendOtpEmail(profile: BookingProfile, guestEmail: string, code: string): Promise<void> {
  const hostName = profile.displayName || 'Context Mode User';
  const accessToken = await getFreshAccessToken(profile.tenantId, 'gmail');

  const subject = `Your verification code: ${code}`;
  const body = [
    `Hi,`, ``,
    `Your verification code to book a meeting with ${hostName} is:`, ``,
    `    ${code}`, ``,
    `This code expires in 10 minutes.`, ``,
    `If you didn't request this, you can ignore this email.`, ``,
    `— Context Mode`,
  ].join('\n');

  const raw = Buffer.from(`To: ${guestEmail}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`, 'utf-8').toString('base64url');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    console.error('[booking:otp] Gmail send failed:', res.status, await res.text());
    throw new Error('Failed to send verification email');
  }
}
