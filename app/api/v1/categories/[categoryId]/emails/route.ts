// app/api/v1/categories/[categoryId]/emails/route.ts
// GET: List emails in a category
// POST: Assign an email to a category
// DELETE: Remove an email from a category

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  try {
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
      JOIN emails e ON e.id = ec.email_id
      WHERE ec.category_id = ${categoryId}
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
  const { categoryId } = await params;

  try {
    const body = await request.json();
    const emailId = body.emailId;

    if (!emailId || typeof emailId !== 'string') {
      return NextResponse.json({ error: 'emailId is required' }, { status: 400 });
    }

    // Verify both exist
    const [catCheck, emailCheck] = await Promise.all([
      db.execute(sql`SELECT id FROM categories WHERE id = ${categoryId} LIMIT 1`),
      db.execute(sql`SELECT id FROM emails WHERE id = ${emailId} LIMIT 1`),
    ]);

    if (catCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (emailCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Assign (ON CONFLICT = already assigned, no-op)
    await db.execute(sql`
      INSERT INTO email_categories (email_id, category_id)
      VALUES (${emailId}, ${categoryId})
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
  const { categoryId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('emailId');

    if (!emailId) {
      return NextResponse.json({ error: 'emailId query param is required' }, { status: 400 });
    }

    await db.execute(sql`
      DELETE FROM email_categories
      WHERE email_id = ${emailId} AND category_id = ${categoryId}
    `);

    return NextResponse.json({ success: true, emailId, categoryId });
  } catch (error) {
    console.error('[category-emails] unassign failed:', error);
    return NextResponse.json({ error: 'Failed to remove email' }, { status: 500 });
  }
}
