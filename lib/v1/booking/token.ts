// lib/v1/booking/token.ts
// Auto-refreshes expired Google OAuth tokens using the stored refresh token.

import { corsair } from '@/corsair';

export async function getFreshAccessToken(
  tenantId: string,
  service: 'gmail' | 'googlecalendar',
): Promise<string> {
  const tenant = corsair.withTenant(tenantId);
  const svc = service === 'gmail' ? tenant.gmail : tenant.googlecalendar;

  // Try current token
  const current = await svc.keys.get_access_token();
  if (current) {
    const test = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${current}`);
    if (test.ok) return current;
  }

  // Refresh
  const refreshToken = await svc.keys.get_refresh_token();
  if (!refreshToken) throw new Error(`No refresh token for ${service}`);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    console.error('[token] refresh failed:', res.status, await res.text());
    throw new Error('Token refresh failed');
  }

  const data = await res.json();
  await svc.keys.set_access_token(data.access_token);
  return data.access_token;
}
