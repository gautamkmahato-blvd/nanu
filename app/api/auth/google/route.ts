// app/api/auth/google/route.ts
// Step 1 of OAuth: generate a Google consent URL and redirect the user.
//
// Flow:
// 1. Generate a UUID → this becomes the Corsair tenantId
// 2. Set a CSRF cookie (HMAC of the UUID) so callback can verify
// 3. Redirect to Google's OAuth consent screen
//
// Required env:
//   GOOGLE_CLIENT_ID     — from Google Cloud Console (same one used for Corsair)
//   NEXT_PUBLIC_BASE_URL — e.g. https://thumbnix.com
//   SESSION_SECRET       — for CSRF HMAC
//
// Google Cloud Console setup:
//   Authorized redirect URI must include:
//   ${NEXT_PUBLIC_BASE_URL}/api/auth/google/callback

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { buildCsrfCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
].join(' ');

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Server misconfigured: GOOGLE_CLIENT_ID is not set' },
      { status: 500 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Generate a unique userId — this becomes the Corsair tenantId
  const userId = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',  // ensures refresh token is returned
    prompt: 'consent',       // force consent to always get refresh token
    state: userId,           // Corsair uses state as the tenantId
  });

  const googleUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Set CSRF cookie (HMAC of userId) → callback verifies before trusting state
  const csrf = buildCsrfCookie(userId);
  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(csrf.name, csrf.value, csrf.options);

  return response;
}
