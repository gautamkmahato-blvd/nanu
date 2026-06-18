// app/api/v1/categories/[categoryId]/route.ts
// DELETE: Remove a category (cascades to children and email assignments)
// FIXED: tenant_id filtering — prevents cross-tenant deletion

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getTenantId } from '@/lib/auth/session';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { categoryId } = await params;

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  try {
    // Only delete if category belongs to this tenant
    const result = await db.execute(sql`
      DELETE FROM categories WHERE id = ${categoryId} AND tenant_id = ${tenantId} RETURNING id
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: categoryId });
  } catch (error) {
    console.error('[categories] delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}