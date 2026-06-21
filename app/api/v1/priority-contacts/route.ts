// app/api/v1/priority-contacts/route.ts
// GET  → list all priority contacts
// POST → add a priority contact

import { NextRequest, NextResponse } from 'next/server';
import { listContacts, addContact } from '@/lib/v1/priority-contacts/db';
import { getTenantId } from '@/lib/auth/session';
import { apiLimiter } from '@/lib/utils/rate-limit';
import { rateLimit } from '@/lib/utils/rate-limit/check';

export async function GET(request: NextRequest) {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const rl = await rateLimit(request, apiLimiter, tenantId); if (rl) return rl;

  try {
    const contacts = await listContacts(tenantId);
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
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const contact = await addContact(body.email, body.name, body.notes, tenantId);
    return NextResponse.json({ contact });
  } catch (err) {
    console.error('[priority-contacts POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to add contact' },
      { status: 500 }
    );
  }
}
