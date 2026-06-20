// app/api/v1/profile/route.ts
// Returns user profile data: session info + usage stats.

import { NextResponse } from 'next/server';
import { getSession, getTenantId } from '@/lib/auth/session';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenantId = session.userId;

  try {
    // Fetch stats in parallel
    const [emailStats, contactStats, conversationStats, bookingProfile] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE is_sent = true)::int as sent,
          COUNT(*) FILTER (WHERE is_sent = false)::int as received,
          COUNT(DISTINCT thread_id)::int as threads
        FROM emails WHERE tenant_id = ${tenantId}
      `),
      db.execute(sql`
        SELECT COUNT(DISTINCT from_email)::int as count
        FROM emails WHERE tenant_id = ${tenantId} AND is_sent = false
      `),
      db.execute(sql`
        SELECT COUNT(*)::int as count
        FROM ai_conversations WHERE tenant_id = ${tenantId}
      `).catch(() => ({ rows: [{ count: 0 }] })),
      db.execute(sql`
        SELECT slug, is_active, display_name
        FROM booking_profiles WHERE tenant_id = ${tenantId} LIMIT 1
      `).catch(() => ({ rows: [] })),
    ]);

    const emails = emailStats.rows[0] as Record<string, number>;
    const contacts = (contactStats.rows[0] as Record<string, number>)?.count ?? 0;
    const conversations = (conversationStats.rows[0] as Record<string, number>)?.count ?? 0;
    const booking = bookingProfile.rows[0] as Record<string, unknown> | undefined;

    return NextResponse.json({
      user: {
        name: session.name,
        email: session.email,
        tenantId,
        createdAt: new Date(session.createdAt).toISOString(),
      },
      stats: {
        totalEmails: emails.total ?? 0,
        sentEmails: emails.sent ?? 0,
        receivedEmails: emails.received ?? 0,
        threads: emails.threads ?? 0,
        contacts,
        conversations,
      },
      booking: booking ? {
        slug: booking.slug,
        isActive: booking.is_active,
        displayName: booking.display_name,
      } : null,
    });
  } catch (error) {
    console.error('[profile] failed:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}