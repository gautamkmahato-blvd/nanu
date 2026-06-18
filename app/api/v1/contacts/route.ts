// app/api/v1/contacts/route.ts

import { NextResponse } from 'next/server';
import { getContactIntelligence } from '@/lib/v1/contacts';
import { getOwnEmail } from '@/lib/v1/get-own-email';

export async function GET() {
  try {
    // Exclude the user's own email from the contacts list
    let ownEmail: string | undefined;
    try {
      ownEmail = await getOwnEmail();
    } catch {
      // If we can't get own email, proceed without filtering
    }

    const contacts = await getContactIntelligence(ownEmail || undefined);

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
