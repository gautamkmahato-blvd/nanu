// app/api/v1/contacts/route.ts

import { NextResponse } from 'next/server';
import { getContactIntelligence } from '@/lib/v1/contacts';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { getTenantId } from '@/lib/auth/session';

export async function GET() {
  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Exclude the user's own email from the contacts list
    let ownEmail: string | undefined;
    try {
      ownEmail = await getOwnEmail(tenantId);
    } catch {
      // If we can't get own email, proceed without filtering
    }

    const contacts = await getContactIntelligence(ownEmail || undefined, tenantId);

    return NextResponse.json({
      contacts,
      total: contacts.length,
    });
  } catch (error) {
    console.error('[contacts] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load contacts' },
      { status: 500 },
    );
  }
}
