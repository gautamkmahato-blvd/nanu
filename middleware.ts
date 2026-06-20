// middleware.ts
// Route protection for multi-tenant auth.
//
// Runs on the Edge runtime (no Node.js crypto), so we only check
// whether the session cookie EXISTS, not decrypt it. Actual session
// verification (decryption + tenantId extraction) happens in the
// API route handlers via requireTenantId().
//
// Protected routes:
//   /mails/*   → redirect to /login if no session cookie
//   /api/v1/*  → return 401 JSON if no session cookie
//
// Public routes (no auth):
//   /book/*        → public booking pages
//   /api/public/*  → public booking APIs
//
// Special cases:
//   /login     → redirect to /mails/v1/dashboard if already logged in
//   /api/auth/ → always pass through (auth flow must work without session)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'cm_session';

function hasSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE);
  return Boolean(cookie?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Public booking routes: always pass through (no auth) ---
  if (pathname.startsWith('/book') || pathname.startsWith('/api/public/')) {
    return NextResponse.next();
  }

  // --- /login: redirect away if already authenticated ---
  if (pathname === '/login') {
    if (hasSession(request)) {
      return NextResponse.redirect(new URL('/mails/v1/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // --- /api/v1/*: return 401 JSON if not authenticated ---
  if (pathname.startsWith('/api/v1/')) {
    // Exception: webhook route must always be reachable (Google Pub/Sub)
    if (pathname.startsWith('/api/v1/webhooks/')) {
      return NextResponse.next();
    }

    if (!hasSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized — please sign in' },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // --- /mails/*: redirect to /login if not authenticated ---
  if (pathname.startsWith('/mails')) {
    if (!hasSession(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/mails/:path*',
    '/api/v1/:path*',
    '/api/public/:path*',
    '/book/:path*',
    '/login',
  ],
};