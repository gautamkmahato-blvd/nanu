// app/page.tsx
// Root route — redirects based on session state.
// Authenticated → /mails/v1/dashboard
// Unauthenticated → /login

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function Home() {
  let session = null;

  try {
    session = await getSession();
  } catch {
    // SESSION_SECRET not set or cookie decryption failed — treat as logged out
  }

  if (session?.userId) {
    redirect('/mails/v1/dashboard');
  }

  redirect('/login');
}
