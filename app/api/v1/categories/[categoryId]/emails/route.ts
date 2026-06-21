// app/api/v1/categories/[categoryId]/emails/route.ts
// GET: List emails in a category
// POST: Assign an email to a category
// DELETE: Remove an email from a category
// FIXED: tenant_id on email_categories table for defense-in-depth.
// All three handlers now filter/write tenant_id directly on the junction table,
// in addition to the existing JOIN-based enforcement on categories + emails.

import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

const rl = await rateLimit(_request, apiLimiter, tenantId); if (rl) return rl;
  const { categoryId } = await params;

  try {
    // Triple-layer tenant enforcement: ec.tenant_id + c.tenant_id + e.tenant_id
    const result = await db.execute(sql`
      SELECT
        e.id,
        e.thread_id,
        e.subject,
        e.from_email,
        e.from_name,
        e.snippet,
        e.received_at,
        e.is_starred,
        COALESCE(e.status, 'new') AS status,
        e.ai_analysis->>'summary' AS summary,
        e.ai_analysis->>'primary_tag' AS primary_tag,
        e.ai_analysis->>'sentiment' AS sentiment,
        e.ai_analysis->>'relationship_type' AS relationship_type,
        ec.assigned_at
      FROM email_categories ec
      JOIN categories c ON c.id = ec.category_id
      JOIN emails e ON e.id = ec.email_id
      WHERE ec.tenant_id = ${tenantId}
        AND ec.category_id = ${categoryId}
        AND c.tenant_id = ${tenantId}
        AND e.tenant_id = ${tenantId}
      ORDER BY ec.assigned_at DESC
    `);

    const emails = (result.rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      threadId: String(row.thread_id),
      subject: (row.subject as string) ?? null,
      fromEmail: String(row.from_email),
      fromName: (row.from_name as string) ?? null,
      snippet: (row.snippet as string) ?? null,
      receivedAt: new Date(row.received_at as string).toISOString(),
      isStarred: Boolean(row.is_starred),
      status: String(row.status),
      summary: (row.summary as string) ?? null,
      primaryTag: (row.primary_tag as string) ?? null,
      sentiment: (row.sentiment as string) ?? null,
      relationshipType: (row.relationship_type as string) ?? null,
      assignedAt: new Date(row.assigned_at as string).toISOString(),
    }));

    return NextResponse.json({ emails, total: emails.length });
  } catch (error) {
    console.error('[category-emails] list failed:', error);
    return NextResponse.json({ error: 'Failed to load emails' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { categoryId } = await params;

  try {
    const body = await request.json();
    const emailId = body.emailId;

    if (!emailId || typeof emailId !== 'string') {
      return NextResponse.json({ error: 'emailId is required' }, { status: 400 });
    }

    // Verify both exist AND belong to this tenant
    const [catCheck, emailCheck] = await Promise.all([
      db.execute(sql`SELECT id FROM categories WHERE id = ${categoryId} AND tenant_id = ${tenantId} LIMIT 1`),
      db.execute(sql`SELECT id FROM emails WHERE id = ${emailId} AND tenant_id = ${tenantId} LIMIT 1`),
    ]);

    if (catCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (emailCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Assign with tenant_id baked into the row
    await db.execute(sql`
      INSERT INTO email_categories (tenant_id, email_id, category_id)
      VALUES (${tenantId}, ${emailId}, ${categoryId})
      ON CONFLICT (email_id, category_id) DO NOTHING
    `);

    return NextResponse.json({ success: true, emailId, categoryId });
  } catch (error) {
    console.error('[category-emails] assign failed:', error);
    return NextResponse.json({ error: 'Failed to assign email' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { categoryId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('emailId');

    if (!emailId) {
      return NextResponse.json({ error: 'emailId query param is required' }, { status: 400 });
    }

    // Direct tenant_id filter on the junction table — no JOIN needed
    await db.execute(sql`
      DELETE FROM email_categories
      WHERE tenant_id = ${tenantId}
        AND email_id = ${emailId}
        AND category_id = ${categoryId}
    `);

    return NextResponse.json({ success: true, emailId, categoryId });
  } catch (error) {
    console.error('[category-emails] unassign failed:', error);
    return NextResponse.json({ error: 'Failed to remove email' }, { status: 500 });
  }
}