// app/api/v1/booking/profile/route.ts
// Auth required — Zod-validated profile management.

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getProfileByTenant, upsertProfile, isSlugAvailable } from '@/lib/v1/booking/queries';
import { profileUpdateSchema, formatZodError } from '@/lib/v1/booking/validation';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  const profile = await getProfileByTenant(tenantId);
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: formatZodError(result.error) }, { status: 400 });

    const input = result.data;

    // Check slug uniqueness
    if (input.slug) {
      const available = await isSlugAvailable(input.slug, tenantId);
      if (!available) return NextResponse.json({ error: 'This URL is already taken.' }, { status: 409 });
    }

    const profile = await upsertProfile(tenantId, input);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[booking:profile] update failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
