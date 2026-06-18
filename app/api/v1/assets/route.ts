// app/api/v1/assets/route.ts
// GET:  List assets with filters (paginated)
// POST: Trigger backfill for existing emails (run once after migration)
//
// All queries scoped by tenant_id — no cross-tenant access.

import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/auth/session';
import { getAssets, getAssetFilterOptions } from '@/lib/v1/assets/queries';
import { backfillAssets } from '@/lib/v1/assets/extract';
import type { AssetType, MimeCategory, AssetFilters } from '@/lib/v1/assets/types';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const VALID_ASSET_TYPES = new Set(['attachment', 'link', 'inline_image']);
const VALID_MIME_CATEGORIES = new Set([
  'pdf', 'image', 'document', 'spreadsheet', 'presentation',
  'archive', 'video', 'audio', 'code', 'other',
]);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// GET: List assets with filters
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    // Parse filters from query params
    const filters: AssetFilters = {
      limit: clamp(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1, 200),
      offset: Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0),
    };

    // Asset type
    const assetType = searchParams.get('type');
    if (assetType && VALID_ASSET_TYPES.has(assetType)) {
      filters.assetType = assetType as AssetType;
    }

    // MIME category
    const mimeCategory = searchParams.get('category');
    if (mimeCategory && VALID_MIME_CATEGORIES.has(mimeCategory)) {
      filters.mimeCategory = mimeCategory as MimeCategory;
    }

    // Sender
    const fromEmail = searchParams.get('from');
    if (fromEmail) filters.fromEmail = fromEmail;

    // Domain
    const domain = searchParams.get('domain');
    if (domain) filters.domain = domain;

    // Search
    const search = searchParams.get('q');
    if (search && search.trim()) filters.search = search.trim();

    // Date range
    const dateFrom = searchParams.get('from_date');
    const dateTo = searchParams.get('to_date');
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // Size range (bytes)
    const minSize = searchParams.get('min_size');
    const maxSize = searchParams.get('max_size');
    if (minSize) filters.minSize = parseInt(minSize, 10);
    if (maxSize) filters.maxSize = parseInt(maxSize, 10);

    // Fetch assets + filter options in parallel
    const [assetsResult, filterOptions] = await Promise.all([
      getAssets(tenantId, filters),
      // Only fetch filter options on the first page (offset 0) to avoid redundant queries
      filters.offset === 0
        ? getAssetFilterOptions(tenantId)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      assets: assetsResult.assets,
      total: assetsResult.total,
      ...(filterOptions && { filters: filterOptions }),
    });
  } catch (error) {
    console.error('[assets] GET failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load assets' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST: Trigger backfill for existing emails
// ---------------------------------------------------------------------------

export async function POST() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await backfillAssets(tenantId);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[assets] backfill failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backfill failed' },
      { status: 500 },
    );
  }
}
