// lib/v1/contacts/index.ts

import { getReceivedStats, getSentStats, getContactAIData } from './queries';
import { enrichContacts } from './enrich';
import type { ContactIntelligence } from './types';

export type { ContactIntelligence } from './types';

export async function getContactIntelligence(
  excludeOwnEmail?: string,
): Promise<ContactIntelligence[]> {
  // Run all 3 queries in parallel
  const [received, sent, aiData] = await Promise.all([
    getReceivedStats(excludeOwnEmail),
    getSentStats(),
    getContactAIData(excludeOwnEmail),
  ]);

  return enrichContacts(received, sent, aiData);
}
