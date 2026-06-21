// app/api/v1/tasks-deadlines/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTaskEmails } from '@/lib/v1/queries/tasks-deadlines';
import { getTasksAndDeadlines } from '@/lib/v1/tasks-deadlines';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(req, apiLimiter, tenantId); if (rl) return rl;

  try {
    const emails = await getTaskEmails(tenantId);
    const grouped = getTasksAndDeadlines(emails);

    // Include counts for the UI header
    const counts = {
      overdue: grouped.overdue.length,
      today: grouped.today.length,
      tomorrow: grouped.tomorrow.length,
      next3Days: grouped.next3Days.length,
      thisWeek: grouped.thisWeek.length,
      later: grouped.later.length,
      total:
        grouped.overdue.length +
        grouped.today.length +
        grouped.tomorrow.length +
        grouped.next3Days.length +
        grouped.thisWeek.length +
        grouped.later.length,
    };

    return NextResponse.json({ grouped, counts });
  } catch (error) {
    console.error('[tasks-deadlines] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load tasks' },
      { status: 500 },
    );
  }
}
