// app/api/v1/assets/preview/[assetId]/route.ts
// Proxy endpoint that fetches an email attachment from Gmail
// and returns it as an image/file response. Used for image thumbnails in the assets grid.
// Tenant-scoped: only serves assets belonging to the authenticated user.

import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { corsair } from '@/corsair';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

type Params = { params: Promise<{ assetId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(req, apiLimiter, tenantId); if (rl) return rl;

  const { assetId } = await params;

  try {
    // Look up the asset — tenant-scoped
    const result = await db.execute(sql`
      SELECT email_id, attachment_id, mime_type, filename
      FROM email_assets
      WHERE tenant_id = ${tenantId}
        AND id = ${assetId}
        AND attachment_id IS NOT NULL
      LIMIT 1
    `);

    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const emailId = String(row.email_id);
    const attachmentId = String(row.attachment_id);
    const mimeType = String(row.mime_type ?? 'application/octet-stream');

    // Get access token from Corsair for this tenant
    const tenant = corsair.withTenant(tenantId);
    const accessToken = await tenant.gmail.keys.get_access_token();

    if (!accessToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 });
    }

    // Fetch attachment directly from Gmail API
    const gmailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/attachments/${attachmentId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!gmailRes.ok) {
      console.warn(`[assets/preview] Gmail API returned ${gmailRes.status} for attachment ${attachmentId}`);
      return NextResponse.json({ error: 'Failed to fetch attachment' }, { status: gmailRes.status });
    }

    const gmailData = await gmailRes.json();
    const data = gmailData.data as string | undefined;

    if (!data) {
      return NextResponse.json({ error: 'Attachment data not available' }, { status: 404 });
    }

    // Gmail returns base64url-encoded data — convert to a Buffer
    const buffer = Buffer.from(data, 'base64url');

    // Return with correct content type and cache headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${row.filename ?? 'attachment'}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error(`[assets/preview] failed for ${assetId}:`, error);
    return NextResponse.json(
      { error: 'Failed to load preview' },
      { status: 500 },
    );
  }
}