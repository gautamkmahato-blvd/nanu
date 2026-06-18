// app/api/v1/priority-contacts/route.ts
// GET  → list all priority contacts
// POST → add a priority contact

import { NextRequest, NextResponse } from 'next/server';
import { listContacts, addContact } from '@/lib/v1/priority-contacts/db';

export async function GET() {
  try {
    const contacts = await listContacts();
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error('[priority-contacts GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list contacts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const contact = await addContact(body.email, body.name, body.notes);
    return NextResponse.json({ contact });
  } catch (err) {
    console.error('[priority-contacts POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add contact' },
      { status: 500 }
    );
  }
}
