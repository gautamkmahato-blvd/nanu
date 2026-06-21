// app/api/auth/google/callback/route.ts
// Step 2 of OAuth: Google redirects here with ?code=...&state=...
//
// Flow:
// 1. Verify CSRF (state matches the HMAC cookie we set in /api/auth/google)
// 2. Exchange code for tokens directly with Google's token endpoint
// 3. Decode id_token to get user's Google `sub` (stable, unique per Google account)
// 4. Derive a DETERMINISTIC tenantId from the sub — same user always gets same tenant
// 5. Provision Corsair tenant (setupCorsair — idempotent)
// 6. Store tokens in Corsair via the keys API
// 7. Set encrypted session cookie
// 8. Redirect to /mails/v1/dashboard
//
// CRITICAL FIX: tenantId was previously derived from `state` (a random UUID),
// which meant every login created a new tenant. Now it's derived from the
// Google `sub` claim, so the same Google account always maps to the same tenant.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { corsair } from '@/corsair';
import { setupCorsair } from 'corsair';
import {
  buildSessionCookie,
  buildClearCsrfCookie,
  getCsrfFromRequest,
  verifyCsrfToken,
} from '@/lib/auth/session';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Deterministic tenant ID from Google sub
// ---------------------------------------------------------------------------
// Uses SHA-256 of a namespace prefix + Google sub, formatted as a UUID.
// Same Google account → same tenantId every time, across all devices/sessions.
// ---------------------------------------------------------------------------

function deriveTenantId(googleSub: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`contextmode:${googleSub}`)
    .digest('hex');

  // Format as UUID v5-style: xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '5' + hash.slice(13, 16),          // version 5
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20), // variant
    hash.slice(20, 32),
  ].join('-');
}

// ---------------------------------------------------------------------------
// Google token exchange
// ---------------------------------------------------------------------------

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${body}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Decode id_token JWT (no verification needed — we just got it from Google
// over HTTPS, and we only use it for display name/email, not authorization)
// ---------------------------------------------------------------------------

type IdTokenPayload = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

function decodeIdToken(idToken: string): IdTokenPayload {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return {};
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    );
    return payload as IdTokenPayload;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');


const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login`;

  // ----- Google returned an error (user denied, etc.) -----
  if (errorParam) {
    const reason =
      errorParam === 'access_denied' ? 'access_denied' : 'google_error';
    return NextResponse.redirect(`${loginUrl}?error=${reason}`);
  }

  // ----- Missing required params -----
  if (!code || !state) {
    console.warn('[auth] callback missing code or state');
    return NextResponse.redirect(`${loginUrl}?error=missing_params`);
  }

  // ----- Env check -----
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('[auth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
    return NextResponse.redirect(`${loginUrl}?error=server_misconfigured`);
  }

  // ----- CSRF verification -----
  const csrfToken = getCsrfFromRequest(request);
  if (!csrfToken) {
    console.warn('[auth] callback missing CSRF cookie');
    return NextResponse.redirect(`${loginUrl}?error=csrf_failed`);
  }

  try {
    if (!verifyCsrfToken(state, csrfToken)) {
      console.warn('[auth] CSRF token mismatch');
      return NextResponse.redirect(`${loginUrl}?error=csrf_failed`);
    }
  } catch {
    console.warn('[auth] CSRF verification threw');
    return NextResponse.redirect(`${loginUrl}?error=csrf_failed`);
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // ----- 1. Exchange code for tokens with Google -----
  let tokens: GoogleTokenResponse;
  try {
    tokens = await exchangeCodeForTokens(code, redirectUri);
    console.log('[auth] token exchange successful');
  } catch (err) {
    console.error('[auth] token exchange failed:', err);
    return NextResponse.redirect(`${loginUrl}?error=token_exchange_failed`);
  }

  if (!tokens.access_token) {
    console.error('[auth] no access_token in Google response');
    return NextResponse.redirect(`${loginUrl}?error=token_exchange_failed`);
  }

  // ----- 2. Extract user info from id_token -----
  let email = '';
  let name = '';
  let googleSub = '';

  if (tokens.id_token) {
    const profile = decodeIdToken(tokens.id_token);
    email = profile.email ?? '';
    name = profile.name ?? '';
    googleSub = profile.sub ?? '';
    console.log(`[auth] user profile: ${email} (${name}), sub: ${googleSub}`);
  }

  // The sub claim is required — it's the stable Google account identifier
  if (!googleSub) {
    console.error('[auth] no sub claim in id_token — cannot derive stable tenant');
    return NextResponse.redirect(`${loginUrl}?error=missing_sub`);
  }

  // ----- 3. Derive stable tenantId from Google sub -----
  const userId = deriveTenantId(googleSub);
  console.log(`[auth] derived stable tenantId: ${userId} from sub: ${googleSub}`);

  // ----- 4. Provision Corsair tenant (idempotent) -----
  try {
    await setupCorsair(corsair, { tenantId: userId });
    console.log(`[auth] tenant provisioned: ${userId}`);
  } catch (err) {
    console.error('[auth] setupCorsair failed:', err);
    return NextResponse.redirect(`${loginUrl}?error=provision_failed`);
  }

  // ----- 5. Store tokens in Corsair -----
  try {
    const tenant = corsair.withTenant(userId);

    // Gmail tokens
    await tenant.gmail.keys.set_access_token(tokens.access_token);
    if (tokens.refresh_token) {
      await tenant.gmail.keys.set_refresh_token(tokens.refresh_token);
    }

    // Calendar tokens (same Google OAuth tokens work for both)
    await tenant.googlecalendar.keys.set_access_token(tokens.access_token);
    if (tokens.refresh_token) {
      await tenant.googlecalendar.keys.set_refresh_token(tokens.refresh_token);
    }

    console.log(`[auth] tokens stored in Corsair for tenant: ${userId}`);
  } catch (err) {
    console.error('[auth] failed to store tokens in Corsair:', err);
    return NextResponse.redirect(`${loginUrl}?error=token_store_failed`);
  }

  // Fallback: try Gmail API if id_token didn't have email
  if (!email) {
    try {
      const tenant = corsair.withTenant(userId);
      const profile = await (tenant.gmail.api as any).users.getProfile({
        userId: 'me',
      });
      email = (profile as any)?.emailAddress ?? '';
      console.log(`[auth] email from Gmail API: ${email}`);
    } catch {
      console.warn('[auth] could not fetch Gmail profile (non-fatal)');
    }
  }

  // ----- 6. Set session cookie + redirect -----
  const session = buildSessionCookie(userId, email, name);
  const clearCsrf = buildClearCsrfCookie();

  const response = NextResponse.redirect(`${baseUrl}/mails/v1/dashboard`);
  response.cookies.set(session.name, session.value, session.options);
  response.cookies.set(clearCsrf.name, clearCsrf.value, clearCsrf.options);

  console.log(`[auth] ✓ session set — user: ${email || userId}, tenant: ${userId}`);
  return response;
}