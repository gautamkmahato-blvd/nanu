// app/api/v1/categories/route.ts
// GET: List all categories as a flat list (UI builds the tree)
// POST: Create a new category
// FIXED: tenant_id filtering on all queries

import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

const ALLOWED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a78bfa', '#ec4899', '#06b6d4', '#6b7280',
];

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  try {
    const result = await db.execute(sql`
      SELECT
        c.id,
        c.name,
        c.parent_id,
        c.color,
        c.created_at,
        COUNT(ec.email_id)::int AS email_count
      FROM categories c
      LEFT JOIN email_categories ec ON ec.category_id = c.id
      WHERE c.tenant_id = ${tenantId}
      GROUP BY c.id, c.name, c.parent_id, c.color, c.created_at
      ORDER BY c.created_at ASC
    `);

    const categories = (result.rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      parentId: row.parent_id ? String(row.parent_id) : null,
      color: String(row.color ?? '#6b7280'),
      createdAt: new Date(row.created_at as string).toISOString(),
      emailCount: Number(row.email_count),
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[categories] list failed:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = (body.name ?? '').trim();
    const parentId = body.parentId ?? null;
    const color = body.color ?? '#6b7280';

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Category name too long (max 100 chars)' }, { status: 400 });
    }

    // Validate parent exists AND belongs to this tenant
    if (parentId) {
      const parent = await db.execute(sql`
        SELECT id FROM categories WHERE id = ${parentId} AND tenant_id = ${tenantId} LIMIT 1
      `);
      if (parent.rows.length === 0) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }
    }

    const safeColor = ALLOWED_COLORS.includes(color) ? color : '#6b7280';

    // Include tenant_id in the insert
    const result = await db.execute(sql`
      INSERT INTO categories (id, tenant_id, name, parent_id, color)
      VALUES (gen_random_uuid(), ${tenantId}, ${name}, ${parentId}, ${safeColor})
      RETURNING id, name, parent_id, color, created_at
    `);

    const row = result.rows[0] as Record<string, unknown>;

    return NextResponse.json({
      category: {
        id: String(row.id),
        name: String(row.name),
        parentId: row.parent_id ? String(row.parent_id) : null,
        color: String(row.color),
        createdAt: new Date(row.created_at as string).toISOString(),
        emailCount: 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[categories] create failed:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}