import { syncThreads } from '@/app/service/v1/syncThreads';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 25;

  if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'limit must be a number between 1 and 100' },
      { status: 400 },
    );
  }

  try {
    const result = await syncThreads(limit);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to sync threads';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
