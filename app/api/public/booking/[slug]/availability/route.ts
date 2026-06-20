// app/api/public/booking/[slug]/availability/route.ts
// Public — returns available + booked slots with Zod validation.

import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug } from '@/lib/v1/booking/queries';
import { getAvailableSlots } from '@/lib/v1/booking/availability';
import { limitAvailability } from '@/lib/v1/booking/rate-limit';
import { availabilityQuerySchema, formatZodError } from '@/lib/v1/booking/validation';

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

  const limit = limitAvailability(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } });
  }

  const profile = await getProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const parsed = availabilityQuerySchema.safeParse({
    date: searchParams.get('date'),
    duration: searchParams.get('duration') || profile.defaultDuration,
  });

  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

  try {
    const result = await getAvailableSlots(profile, parsed.data.date, parsed.data.duration);
    return NextResponse.json({
      date: parsed.data.date, duration: parsed.data.duration, timezone: profile.timezone,
      slots: result.available, bookedSlots: result.booked,
      slotsCount: result.available.length, bookedCount: result.booked.length,
    });
  } catch (error) {
    console.error('[booking:availability] failed:', error);
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }
}
