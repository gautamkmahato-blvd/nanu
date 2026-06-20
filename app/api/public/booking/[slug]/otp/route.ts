// app/api/public/booking/[slug]/otp/route.ts
// Public — sends OTP with Zod validation + rate limiting.

import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug, createOtp, countRecentOtps } from '@/lib/v1/booking/queries';
import { generateOtpCode, sendOtpEmail } from '@/lib/v1/booking/otp';
import { limitOtpByIp, limitOtpByEmail } from '@/lib/v1/booking/rate-limit';
import { otpRequestSchema, formatZodError } from '@/lib/v1/booking/validation';

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

  // IP rate limit
  const ipLimit = limitOtpByIp(ip);
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(ipLimit.retryAfterMs / 1000)) } });
  }

  // Parse + validate body
  let input;
  try {
    const body = await req.json();
    const result = otpRequestSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: formatZodError(result.error) }, { status: 400 });
    input = result.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Email rate limit
  const emailLimit = limitOtpByEmail(input.email);
  if (!emailLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts for this email. Try again later.' }, { status: 429 });
  }

  // DB rate limit
  const recentCount = await countRecentOtps(input.email);
  if (recentCount >= 5) {
    return NextResponse.json({ error: 'Too many codes sent. Try again in an hour.' }, { status: 429 });
  }

  // Get profile
  const profile = await getProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const code = generateOtpCode();
    await createOtp(input.email, slug, code, ip);
    await sendOtpEmail(profile, input.email, code);
    return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('[booking:otp] failed:', error);
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
  }
}
