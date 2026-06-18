import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

// GET — return cached draft or null
export async function GET(_req: Request, { params }: { params: Promise<{ emailId: string }> }) {
  const { emailId } = await params;
  const result = await db.execute(sql`SELECT draft_reply FROM emails WHERE id = ${emailId}`);
  const draft = (result.rows[0] as any)?.draft_reply ?? null;
  return NextResponse.json({ draft });
}

// POST — save draft to DB
export async function POST(req: Request, { params }: { params: Promise<{ emailId: string }> }) {
  const { emailId } = await params;
  const { draft } = await req.json();
  await db.execute(sql`UPDATE emails SET draft_reply = ${draft} WHERE id = ${emailId}`);
  return NextResponse.json({ saved: true });
}