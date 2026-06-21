// app/api/auth/logout/route.ts
// Clears the session cookie and redirects to /login.

import { NextRequest, NextResponse } from 'next/server';
import { buildClearSessionCookie } from '@/lib/auth/session';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';


const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;
  const clear = buildClearSessionCookie();

  const response = NextResponse.redirect(`${baseUrl}/login`);
  response.cookies.set(clear.name, clear.value, clear.options);

  return response;
}

// Also support POST for forms / fetch calls
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;

  const clear = buildClearSessionCookie();

  const response = NextResponse.redirect(`${baseUrl}/login`);
  response.cookies.set(clear.name, clear.value, clear.options);

  return response;
}
