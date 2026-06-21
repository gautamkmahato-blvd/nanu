// app/api/auth/google/route.ts
// Step 1 of OAuth: generate a Google consent URL and redirect the user.
//
// Flow:
// 1. Generate a random state for CSRF protection
// 2. Set a CSRF cookie (HMAC of state) so callback can verify
// 3. Redirect to Google's OAuth consent screen
//
// IMPORTANT: state is for CSRF only — NOT the tenantId.
// The tenantId is derived from the user's Google `sub` in the callback,
// so the same Google account always maps to the same tenant.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { buildCsrfCookie } from '@/lib/auth/session';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';
export const dynamic = 'force-dynamic';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
].join(' ');

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Server misconfigured: GOOGLE_CLIENT_ID is not set' },
      { status: 500 },
    );
  }


const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Random state for CSRF only — tenantId is derived in the callback from Google's sub
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const googleUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Set CSRF cookie (HMAC of state) → callback verifies before trusting
  const csrf = buildCsrfCookie(state);
  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(csrf.name, csrf.value, csrf.options);

  return response;
}