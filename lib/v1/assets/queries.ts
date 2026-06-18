// lib/v1/assets/queries.ts
// Tenant-scoped queries for the assets API.
// All queries require tenantId — no cross-tenant access possible.

import { sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { getMimeCategory, type Asset, type AssetFilters, type MimeCategory } from './types';

// ---------------------------------------------------------------------------
// MIME category → SQL filter
// ---------------------------------------------------------------------------

const MIME_CATEGORY_PATTERNS: Record<MimeCategory, string[]> = {
  pdf: ['application/pdf'],
  image: ['image/%'],
  document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml%', 'application/rtf', 'text/plain', 'text/markdown'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml%', 'text/csv'],
  presentation: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml%'],
  archive: ['application/zip', 'application/x-rar%', 'application/gzip', 'application/x-tar', 'application/x-7z%'],
  video: ['video/%'],
  audio: ['audio/%'],
  code: ['application/json', 'application/javascript', 'text/html', 'text/css', 'application/xml', 'text/xml'],
  other: [],
};

function buildMimeCategoryFilter(category: MimeCategory): SQL | null {
  const patterns = MIME_CATEGORY_PATTERNS[category];
  if (!patterns || patterns.length === 0) return null;

  // Build OR conditions for each MIME pattern
  const conditions = patterns.map((p) =>
    p.includes('%') ? sql`mime_type ILIKE ${p}` : sql`mime_type = ${p}`
  );

  let combined = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    combined = sql`${combined} OR ${conditions[i]}`;
  }
  return sql`(${combined})`;
}

// ---------------------------------------------------------------------------
// Main query: list assets with filters
// ---------------------------------------------------------------------------

export async function getAssets(tenantId: string, filters: AssetFilters): Promise<{ assets: Asset[]; total: number }> {
  const conditions: SQL[] = [sql`tenant_id = ${tenantId}`];

  // Asset type filter
  if (filters.assetType) {
    conditions.push(sql`asset_type = ${filters.assetType}`);
  }

  // MIME category filter
  if (filters.mimeCategory) {
    if (filters.mimeCategory === 'other') {
      // "other" = not matching any known category
      const knownPatterns = Object.entries(MIME_CATEGORY_PATTERNS)
        .filter(([key]) => key !== 'other')
        .flatMap(([, patterns]) => patterns);

      const exclusions = knownPatterns.map((p) =>
        p.includes('%') ? sql`mime_type NOT ILIKE ${p}` : sql`mime_type != ${p}`
      );

      if (exclusions.length > 0) {
        let combined = exclusions[0];
        for (let i = 1; i < exclusions.length; i++) {
          combined = sql`${combined} AND ${exclusions[i]}`;
        }
        conditions.push(sql`(mime_type IS NULL OR (${combined}))`);
      }
    } else {
      const mimeFilter = buildMimeCategoryFilter(filters.mimeCategory);
      if (mimeFilter) conditions.push(mimeFilter);
    }
  }

  // Sender filter
  if (filters.fromEmail) {
    conditions.push(sql`LOWER(from_email) = ${filters.fromEmail.toLowerCase()}`);
  }

  // Domain filter (for links)
  if (filters.domain) {
    conditions.push(sql`domain = ${filters.domain.toLowerCase()}`);
  }

  // Text search on filename
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(sql`(
      LOWER(COALESCE(filename, '')) LIKE ${searchTerm}
      OR LOWER(COALESCE(url, '')) LIKE ${searchTerm}
      OR LOWER(COALESCE(subject, '')) LIKE ${searchTerm}
    )`);
  }

  // Date range
  if (filters.dateFrom) {
    conditions.push(sql`received_at >= ${filters.dateFrom}::timestamptz`);
  }
  if (filters.dateTo) {
    conditions.push(sql`received_at <= ${filters.dateTo}::timestamptz`);
  }

  // Size range (attachments only)
  if (filters.minSize !== undefined) {
    conditions.push(sql`size >= ${filters.minSize}`);
  }
  if (filters.maxSize !== undefined) {
    conditions.push(sql`size <= ${filters.maxSize}`);
  }

  // Build WHERE clause
  let whereClause = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    whereClause = sql`${whereClause} AND ${conditions[i]}`;
  }

  // Count total (for pagination)
  const countResult = await db.execute(sql`
    SELECT COUNT(*)::int AS total FROM email_assets WHERE ${whereClause}
  `);
  const total = Number((countResult.rows[0] as Record<string, unknown>)?.total ?? 0);

  // Fetch page
  const result = await db.execute(sql`
    SELECT id, tenant_id, email_id, asset_type, filename, url, mime_type,
           size, attachment_id, domain, from_email, from_name, subject,
           received_at, created_at
    FROM email_assets
    WHERE ${whereClause}
    ORDER BY received_at DESC
    LIMIT ${filters.limit}
    OFFSET ${filters.offset}
  `);

  const assets: Asset[] = (result.rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    tenantId: String(row.tenant_id),
    emailId: String(row.email_id),
    assetType: String(row.asset_type) as Asset['assetType'],
    filename: (row.filename as string) ?? null,
    url: (row.url as string) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    size: row.size != null ? Number(row.size) : null,
    attachmentId: (row.attachment_id as string) ?? null,
    domain: (row.domain as string) ?? null,
    fromEmail: String(row.from_email),
    fromName: (row.from_name as string) ?? null,
    subject: (row.subject as string) ?? null,
    receivedAt: new Date(row.received_at as string).toISOString(),
    createdAt: new Date(row.created_at as string).toISOString(),
    mimeCategory: getMimeCategory((row.mime_type as string) ?? null),
  }));

  return { assets, total };
}

// ---------------------------------------------------------------------------
// Get available filter options (for the UI filter dropdowns)
// ---------------------------------------------------------------------------

export async function getAssetFilterOptions(tenantId: string): Promise<{
  senders: { email: string; name: string | null; count: number }[];
  domains: { domain: string; count: number }[];
  mimeCategories: { category: string; count: number }[];
}> {
  // Top senders with assets
  const sendersResult = await db.execute(sql`
    SELECT from_email, from_name, COUNT(*)::int AS count
    FROM email_assets
    WHERE tenant_id = ${tenantId}
    GROUP BY from_email, from_name
    ORDER BY count DESC
    LIMIT 50
  `);

  // Top domains (links only)
  const domainsResult = await db.execute(sql`
    SELECT domain, COUNT(*)::int AS count
    FROM email_assets
    WHERE tenant_id = ${tenantId} AND domain IS NOT NULL
    GROUP BY domain
    ORDER BY count DESC
    LIMIT 30
  `);

  // MIME type distribution
  const mimeResult = await db.execute(sql`
    SELECT mime_type, COUNT(*)::int AS count
    FROM email_assets
    WHERE tenant_id = ${tenantId} AND mime_type IS NOT NULL
    GROUP BY mime_type
    ORDER BY count DESC
  `);

  // Group mime types into categories
  const categoryMap = new Map<string, number>();
  for (const row of mimeResult.rows as Record<string, unknown>[]) {
    const cat = getMimeCategory(row.mime_type as string);
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(row.count));
  }

  // Add link count as its own "category"
  const linkResult = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM email_assets
    WHERE tenant_id = ${tenantId} AND asset_type = 'link'
  `);
  const linkCount = Number((linkResult.rows[0] as Record<string, unknown>)?.count ?? 0);
  if (linkCount > 0) categoryMap.set('link', linkCount);

  return {
    senders: (sendersResult.rows as Record<string, unknown>[]).map((r) => ({
      email: String(r.from_email),
      name: (r.from_name as string) ?? null,
      count: Number(r.count),
    })),
    domains: (domainsResult.rows as Record<string, unknown>[]).map((r) => ({
      domain: String(r.domain),
      count: Number(r.count),
    })),
    mimeCategories: Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  };
}
