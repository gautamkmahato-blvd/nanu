// app/api/v1/priority-contacts/[id]/route.ts
// DELETE → remove a priority contact

import { NextRequest, NextResponse } from 'next/server';
import { deleteContact } from '@/lib/v1/priority-contacts/db';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await deleteContact(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[priority-contacts DELETE]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete' },
      { status: 500 }
    );
  }
}
