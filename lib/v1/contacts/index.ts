// lib/v1/contacts/index.ts

import { getReceivedStats, getSentStats, getContactAIData } from './queries';
import { enrichContacts } from './enrich';
import type { ContactIntelligence } from './types';

export type { ContactIntelligence } from './types';

export async function getContactIntelligence(
  excludeOwnEmail?: string,
  tenantId = 'default',
): Promise<ContactIntelligence[]> {
  // Run all 3 queries in parallel
  const [received, sent, aiData] = await Promise.all([
    getReceivedStats(excludeOwnEmail, tenantId),
    getSentStats(tenantId),
    getContactAIData(excludeOwnEmail, tenantId),
  ]);

  return enrichContacts(received, sent, aiData);
}
