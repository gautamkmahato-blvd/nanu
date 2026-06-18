// lib/v1/assets/extract.ts
// Extracts assets (attachments + links) from emails and stores them in email_assets.
// Called during sync/webhook ingestion for new emails, and as a backfill for existing data.
// All operations are idempotent (ON CONFLICT DO NOTHING) — safe to re-run.

import { sql } from 'drizzle-orm';
import { db } from '@/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmailRow = {
  id: string;
  tenant_id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  received_at: string;
  attachments: unknown;
  body_text: string | null;
  has_attachments: boolean;
};

type AssetInsert = {
  tenantId: string;
  emailId: string;
  assetType: 'attachment' | 'link' | 'inline_image';
  filename: string | null;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  attachmentId: string | null;
  domain: string | null;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
};

// ---------------------------------------------------------------------------
// URL extraction from email body
// ---------------------------------------------------------------------------

// Matches http/https URLs — avoids trailing punctuation and common false positives
const URL_REGEX = /https?:\/\/[^\s<>"')\]},;]+/gi;

// Skip common non-asset URLs (tracking pixels, unsubscribe, social, auth)
const SKIP_PATTERNS = [
  /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google)/i,
  /\/(unsubscribe|optout|preferences|manage|tracking|click|open|beacon|pixel)/i,
  /\.(gif|png|jpg|jpeg)(\?.*)?$/i, // tracking pixels in URLs
  /^https?:\/\/(www\.)?(facebook|twitter|linkedin|instagram)\.com\/?$/i, // social homepages
  /^https?:\/\/accounts\.google\.com/i,
  /^https?:\/\/support\.google\.com/i,
  /^https?:\/\/policies\.google\.com/i,
  /mail\.google\.com\/mail/i,
  /^https?:\/\/[^/]*\.list-manage\.com/i, // Mailchimp
  /^https?:\/\/[^/]*\.campaign-archive\.com/i,
  /^https?:\/\/[^/]*\.(sendgrid|mailgun|postmark)\./i, // email service providers
];

function isAssetUrl(url: string): boolean {
  return !SKIP_PATTERNS.some((pattern) => pattern.test(url));
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function extractUrlsFromBody(bodyText: string | null): { url: string; domain: string | null }[] {
  if (!bodyText) return [];

  const matches = bodyText.match(URL_REGEX);
  if (!matches) return [];

  // Deduplicate and filter
  const seen = new Set<string>();
  const results: { url: string; domain: string | null }[] = [];

  for (const raw of matches) {
    // Clean trailing punctuation that regex might have captured
    const url = raw.replace(/[.)>,;:!?]+$/, '');

    if (seen.has(url) || !isAssetUrl(url)) continue;
    seen.add(url);

    results.push({ url, domain: extractDomain(url) });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Extract assets from a single email
// ---------------------------------------------------------------------------

function extractAssetsFromEmail(email: EmailRow): AssetInsert[] {
  const assets: AssetInsert[] = [];
  const base = {
    tenantId: email.tenant_id,
    emailId: email.id,
    fromEmail: email.from_email,
    fromName: email.from_name,
    subject: email.subject,
    receivedAt: email.received_at,
  };

  // 1. Attachments from the JSONB column
  const attachments = Array.isArray(email.attachments) ? email.attachments : [];

  for (const att of attachments) {
    const a = att as Record<string, unknown>;
    const filename = String(a.filename ?? '');
    const mimeType = String(a.mimeType ?? '');
    const size = typeof a.size === 'number' ? a.size : null;
    const attachmentId = String(a.attachmentId ?? '');

    if (!attachmentId) continue;

    // Classify inline images vs regular attachments
    const isInlineImage = mimeType.startsWith('image/') && (
      filename.startsWith('image') || !filename || filename === 'undefined'
    );

    assets.push({
      ...base,
      assetType: isInlineImage ? 'inline_image' : 'attachment',
      filename: filename || null,
      url: null,
      mimeType: mimeType || null,
      size,
      attachmentId,
      domain: null,
    });
  }

  // 2. Links from email body
  const urls = extractUrlsFromBody(email.body_text);

  for (const { url, domain } of urls) {
    // Use the last path segment or domain as a display name
    let filename: string | null = null;
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length < 80) {
        filename = decodeURIComponent(lastPart);
      }
    } catch { /* ignore */ }

    assets.push({
      ...base,
      assetType: 'link',
      filename,
      url,
      mimeType: null,
      size: null,
      attachmentId: null,
      domain,
    });
  }

  return assets;
}

// ---------------------------------------------------------------------------
// Insert assets into DB (idempotent)
// ---------------------------------------------------------------------------

async function insertAssets(assets: AssetInsert[]): Promise<number> {
  if (assets.length === 0) return 0;

  let inserted = 0;

  for (const a of assets) {
    try {
      await db.execute(sql`
        INSERT INTO email_assets (
          tenant_id, email_id, asset_type, filename, url, mime_type,
          size, attachment_id, domain, from_email, from_name, subject, received_at
        ) VALUES (
          ${a.tenantId}, ${a.emailId}, ${a.assetType}, ${a.filename}, ${a.url},
          ${a.mimeType}, ${a.size}, ${a.attachmentId}, ${a.domain},
          ${a.fromEmail}, ${a.fromName}, ${a.subject}, ${a.receivedAt}
        )
        ON CONFLICT DO NOTHING
      `);
      inserted++;
    } catch (err) {
      // Log but don't fail the whole batch — one bad row shouldn't block others
      console.warn(`[assets] insert failed for email ${a.emailId}:`, err);
    }
  }

  return inserted;
}

// ---------------------------------------------------------------------------
// Public API: extract assets for a single email (called from webhook/sync)
// ---------------------------------------------------------------------------

export async function extractAssetsForEmail(emailId: string, tenantId: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT id, tenant_id, from_email, from_name, subject, received_at,
           attachments, body_text, has_attachments
    FROM emails
    WHERE tenant_id = ${tenantId} AND id = ${emailId}
    LIMIT 1
  `);

  const row = result.rows[0] as EmailRow | undefined;
  if (!row) return 0;

  const assets = extractAssetsFromEmail(row);
  return insertAssets(assets);
}

// ---------------------------------------------------------------------------
// Public API: backfill assets for all existing emails (run once)
// ---------------------------------------------------------------------------

export async function backfillAssets(tenantId: string): Promise<{ processed: number; extracted: number }> {
  const BATCH_SIZE = 100;
  let processed = 0;
  let extracted = 0;
  let offset = 0;

  console.log(`[assets] starting backfill for tenant ${tenantId}...`);

  while (true) {
    const result = await db.execute(sql`
      SELECT id, tenant_id, from_email, from_name, subject, received_at,
             attachments, body_text, has_attachments
      FROM emails
      WHERE tenant_id = ${tenantId}
        AND (has_attachments = true OR body_text IS NOT NULL)
      ORDER BY received_at DESC
      LIMIT ${BATCH_SIZE}
      OFFSET ${offset}
    `);

    const rows = result.rows as EmailRow[];
    if (rows.length === 0) break;

    for (const row of rows) {
      const assets = extractAssetsFromEmail(row);
      const count = await insertAssets(assets);
      extracted += count;
      processed++;
    }

    console.log(`[assets] backfill progress: ${processed} emails processed, ${extracted} assets extracted`);
    offset += BATCH_SIZE;
  }

  console.log(`[assets] backfill complete: ${processed} emails → ${extracted} assets`);
  return { processed, extracted };
}
