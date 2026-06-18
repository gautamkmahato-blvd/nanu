// app/api/auth/logout/route.ts
// Clears the session cookie and redirects to /login.

import { NextResponse } from 'next/server';
import { buildClearSessionCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const clear = buildClearSessionCookie();

  const response = NextResponse.redirect(`${baseUrl}/login`);
  response.cookies.set(clear.name, clear.value, clear.options);

  return response;
}

// Also support POST for forms / fetch calls
export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const clear = buildClearSessionCookie();

  const response = NextResponse.redirect(`${baseUrl}/login`);
  response.cookies.set(clear.name, clear.value, clear.options);

  return response;
}
