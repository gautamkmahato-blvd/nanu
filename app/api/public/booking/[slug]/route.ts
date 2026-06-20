// app/api/public/booking/[slug]/route.ts
// No auth — public profile info for the booking page.

import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug, toPublicProfile } from '@/lib/v1/booking/queries';

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const profile = await getProfileBySlug(slug);

  // Return same 404 whether slug doesn't exist or is inactive (prevent enumeration)
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ profile: toPublicProfile(profile) });
}
