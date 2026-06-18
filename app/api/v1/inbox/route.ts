import { getInboxThreads } from '@/lib/v1/queries/inbox';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  try {
    const threads = await getInboxThreads(limit, offset);
    return NextResponse.json(threads);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load inbox';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
