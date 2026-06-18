// app/service/v1/syncThreads.ts
import { corsair } from '@/corsair';
import { getOwnEmail } from '@/lib/v1/get-own-email';
import { ingestMessage } from '@/lib/v1/upsert';
import { classifySyncedEmails } from '@/lib/v1/ai/classify';

const THREAD_BATCH_SIZE = 10;

export type SyncThreadsResult = {
  listTimeMs: number;
  fullDataTimeMs: number;
  threadsFetched: number;
  messagesIngested: number;
  messagesSkipped: number;
  errors: string[];
};

export async function syncThreadsOld(
  maxResults = 25,
  tenantId = 'default',
): Promise<SyncThreadsResult> {
  const tenant = corsair.withTenant(tenantId);
  const ownEmail = await getOwnEmail(tenantId);

  const listStart = Date.now();
  const listResponse = await tenant.gmail.api.threads.list({
    maxResults,
    labelIds: ['INBOX'],
  });
  const listTimeMs = Date.now() - listStart;

  const threadIds = (listResponse.threads ?? [])
    .map((thread) => thread.id)
    .filter((id): id is string => Boolean(id));

  const fullDataStart = Date.now();
  const result: SyncThreadsResult = {
    listTimeMs,
    fullDataTimeMs: 0,
    threadsFetched: 0,
    messagesIngested: 0,
    messagesSkipped: 0,
    errors: [],
  };

  for (let index = 0; index < threadIds.length; index += THREAD_BATCH_SIZE) {
    const batch = threadIds.slice(index, index + THREAD_BATCH_SIZE);

    const settled = await Promise.allSettled(
      batch.map(async (threadId) => {
        const thread = await tenant.gmail.api.threads.get({
          id: threadId,
          format: 'full',
        });

        result.threadsFetched++;

        const ingestResults = await Promise.all(
          (thread.messages ?? []).map((message) => ingestMessage(message, ownEmail, tenantId)),
        );

        for (const ingestResult of ingestResults) {
          if (ingestResult.ok) {
            result.messagesIngested++;
          } else {
            result.messagesSkipped++;
            if (ingestResult.error) {
              result.errors.push(`msg ${ingestResult.id}: ${ingestResult.error}`);
            }
          }
        }
      }),
    );

    for (const entry of settled) {
      if (entry.status === 'rejected') {
        result.errors.push(String(entry.reason));
      }
    }

    // Fire-and-forget: classify what we just ingested while next batch syncs.
    // The running guard inside classifySyncedEmails collapses overlapping nudges.
    classifySyncedEmails(tenantId).catch((err) =>
      console.error('[ai] mid-sync nudge failed:', err),
    );
  }

  result.fullDataTimeMs = Date.now() - fullDataStart;

  return result;
}
