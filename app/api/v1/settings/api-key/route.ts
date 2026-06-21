// app/api/v1/settings/api-key/route.ts
// Manages user's OpenRouter API key.
// POST: save key (encrypted), DELETE: remove key, GET: check status

import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { decrypt, getUserSettings, invalidateClientCache, maskApiKey, removeApiKey, saveApiKey, validateApiKey } from '@/lib/v1/user-settings';
import { authLimiter } from '@/lib/utils/rate-limit';
import { rateLimit, getClientIp } from '@/lib/utils/rate-limit/check';

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


const rl = await rateLimit(request, authLimiter, getClientIp(request)); if (rl) return rl;

  const settings = await getUserSettings(tenantId);

  // Never return the actual key — only status and masked version
  let maskedKey: string | null = null;
  if (settings?.hasApiKey) {
    try {
      const result = await db.execute(sql`
        SELECT encrypted_api_key, api_key_iv, api_key_tag
        FROM user_settings WHERE tenant_id = ${tenantId} AND has_api_key = true LIMIT 1
      `);
      const row = result.rows[0] as Record<string, unknown> | undefined;
      if (row?.encrypted_api_key && row?.api_key_iv && row?.api_key_tag) {
        const plain = decrypt(String(row.encrypted_api_key), String(row.api_key_iv), String(row.api_key_tag));
        maskedKey = maskApiKey(plain);
      }
    } catch {}
  }

  return NextResponse.json({
    hasApiKey: settings?.hasApiKey ?? false,
    maskedKey,
    syncLimit: settings?.syncLimit ?? 20,
  });
}

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const apiKey = String(body.apiKey ?? '').trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (apiKey.length < 10 || apiKey.length > 500) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 });
    }

    // Validate by making a test call
    const validation = await validateApiKey(apiKey);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Encrypt and save
    await saveApiKey(tenantId, apiKey);
    invalidateClientCache(tenantId);

    return NextResponse.json({
      success: true,
      maskedKey: maskApiKey(apiKey),
      message: 'API key saved. You now have unlimited AI chats and configurable sync limits.',
    });
  } catch (error) {
    console.error('[settings:api-key] save failed:', error);
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function DELETE() {
  const tenantId = await getTenantId();
  if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await removeApiKey(tenantId);
    invalidateClientCache(tenantId);

    return NextResponse.json({
      success: true,
      message: 'API key removed. You are now on the free tier (20 chats/day, sync limit 20).',
    });
  } catch (error) {
    console.error('[settings:api-key] remove failed:', error);
    return NextResponse.json({ error: 'Failed to remove API key' }, { status: 500 });
  }
}
