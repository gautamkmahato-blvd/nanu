// app/api/v1/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getDashboardEmails } from '@/lib/v1/queries/dashboard';
import { computeDashboard } from '@/lib/v1/dashboard';

export async function GET() {
  try {
    const emails = await getDashboardEmails();
    const dashboard = computeDashboard(emails);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('[dashboard] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load dashboard' },
      { status: 500 },
    );
  }
}
