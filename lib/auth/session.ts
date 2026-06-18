// lib/auth/session.ts
// Session management for multi-tenant auth.
//
// - AES-256-GCM encrypted session cookie (userId + email + name)
// - CSRF protection for OAuth flow (HMAC-SHA256 of state param)
// - Cookie builders (for route handlers to set on NextResponse)
// - Session readers (for route handlers + server components)
//
// Required env: SESSION_SECRET (min 32 chars)

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'cm_session';
const CSRF_COOKIE_NAME = 'cm_csrf';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionPayload = {
  userId: string; // doubles as Corsair tenantId
  email: string;
  name: string;
  createdAt: number;
};

// ---------------------------------------------------------------------------
// Internal: derive 256-bit key from SESSION_SECRET
// ---------------------------------------------------------------------------

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET env var must be set (min 32 characters)');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

// ---------------------------------------------------------------------------
// Encrypt / Decrypt (AES-256-GCM)
// ---------------------------------------------------------------------------

export function encrypt(payload: SessionPayload): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Format: iv.tag.ciphertext (base64url, dot-separated)
  return [
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decrypt(token: string): SessionPayload | null {
  try {
    const key = getKey();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], 'base64url');
    const tag = Buffer.from(parts[1], 'base64url');
    const data = Buffer.from(parts[2], 'base64url');

    if (iv.length !== 12 || tag.length !== 16) return null;

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);

    const parsed = JSON.parse(decrypted.toString('utf8'));

    // Basic shape validation
    if (!parsed?.userId || typeof parsed.userId !== 'string') return null;

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// CSRF helpers (HMAC-SHA256 of the OAuth state param)
// ---------------------------------------------------------------------------

export function createCsrfToken(state: string): string {
  return crypto.createHmac('sha256', getKey()).update(state).digest('hex');
}

export function verifyCsrfToken(state: string, token: string): boolean {
  const expected = createCsrfToken(state);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(token, 'hex'),
  );
}

// ---------------------------------------------------------------------------
// Cookie builders — return { name, value, options } for NextResponse.cookies.set()
// ---------------------------------------------------------------------------

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function buildSessionCookie(
  userId: string,
  email: string,
  name: string,
) {
  const payload: SessionPayload = {
    userId,
    email,
    name,
    createdAt: Date.now(),
  };
  return {
    name: COOKIE_NAME,
    value: encrypt(payload),
    options: cookieOptions(SESSION_MAX_AGE),
  };
}

export function buildCsrfCookie(state: string) {
  return {
    name: CSRF_COOKIE_NAME,
    value: createCsrfToken(state),
    options: cookieOptions(600), // 10 min — covers the Google consent screen
  };
}

export function buildClearSessionCookie() {
  return { name: COOKIE_NAME, value: '', options: cookieOptions(0) };
}

export function buildClearCsrfCookie() {
  return { name: CSRF_COOKIE_NAME, value: '', options: cookieOptions(0) };
}

// ---------------------------------------------------------------------------
// Read session from raw Request (works in route handlers + middleware)
// ---------------------------------------------------------------------------

function parseCookieValue(request: Request, cookieName: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${cookieName}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(cookieName.length + 1));
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const value = parseCookieValue(request, COOKIE_NAME);
  if (!value) return null;
  return decrypt(value);
}

export function getCsrfFromRequest(request: Request): string | null {
  return parseCookieValue(request, CSRF_COOKIE_NAME);
}

// ---------------------------------------------------------------------------
// Server-side helpers (use next/headers — works in route handlers + RSCs)
// ---------------------------------------------------------------------------

export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return decrypt(cookie.value);
}

export async function getTenantId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

/**
 * Use in API route handlers. Throws if not authenticated,
 * so the route can catch and return 401.
 */
export async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();
  if (!tenantId) {
    throw new Error('UNAUTHORIZED');
  }
  return tenantId;
}
