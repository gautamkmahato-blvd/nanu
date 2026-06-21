// app/api/v1/calendar/zoom/route.ts
// POST: Create a Zoom meeting and return the join URL.
// Body: { topic, duration?, startTime? }
//
// Note: Requires Zoom OAuth setup. If not configured, returns a helpful error.
// The Zoom MCP at https://mcp.zoom.us/mcp/zoom/streamable can be used
// for chat-based interactions, but for programmatic meeting creation,
// we need direct API access via Corsair or Zoom OAuth.

import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  try {
    const body = await request.json();
    const { topic, duration, startTime } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    // Attempt to create via Corsair Zoom plugin
    try {
      const { corsair } = await import('@/corsair');
      const tenant = corsair.withTenant(tenantId);

      // Check if zoom plugin exists on the tenant
      const zoom = (tenant as Record<string, unknown>).zoom as {
        api: {
          meetings: {
            create: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
          };
        };
      } | undefined;

      if (zoom?.api?.meetings?.create) {
        const meeting = await zoom.api.meetings.create({
          topic,
          type: 2, // scheduled meeting
          start_time: startTime ? new Date(startTime).toISOString() : undefined,
          duration: duration ?? 60,
          settings: {
            join_before_host: true,
            waiting_room: false,
            auto_recording: 'none',
          },
        });

        return NextResponse.json({
          success: true,
          joinUrl: String(meeting.join_url ?? ''),
          meetingId: String(meeting.id ?? ''),
          password: (meeting.password as string) ?? null,
        });
      }
    } catch (err) {
      console.warn('[zoom] Corsair zoom plugin not available:', err instanceof Error ? err.message : err);
    }

    // Fallback: Zoom plugin not configured
    return NextResponse.json(
      {
        error: 'Zoom integration not configured. To enable: add the Zoom plugin to your Corsair config, or paste a Zoom link manually.',
        fallback: true,
      },
      { status: 501 },
    );
  } catch (error) {
    console.error('[zoom] create meeting failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Zoom meeting' },
      { status: 500 },
    );
  }
}
