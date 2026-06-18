// corsair.ts  (replaces your current file — only the webhookHooks block is new)
import 'dotenv/config';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { gmail } from '@corsair-dev/gmail';
import { createCorsair } from 'corsair';

import { handleGmailWebhookEvent } from '@/lib/v1/webhook-handlers';
import { pool } from './db';

export const corsair = createCorsair({
  plugins: [
    gmail({
      authType: 'oauth_2',
      webhookHooks: {
        messageChanged: {
          // `after` only runs when Corsair processed the webhook successfully
          // (signature verified, payload decoded, its own tables updated).
          // Pass the full Corsair WebhookResponse — handler reads `response.data`
          // for the Gmail event (messageReceived | messageDeleted | messageLabelChanged).
          after: async (_ctx, response) => {
            try {
              // Extract tenantId from Corsair's context
              const tenantId = (_ctx as any)?.tenantId ?? (_ctx as any)?.tenant_id ?? 'default';
              await handleGmailWebhookEvent(response, tenantId);
            } catch (error) {
              // Re-throw so the route returns 500 and the sender retries —
              // ingest is idempotent, so a retry can only help.
              console.error('[webhook] gmail after-hook failed:', error);
              throw error;
            }
          },
        },
      },
    }),
    googlecalendar({
      authType: 'oauth_2',
    }),
  ],
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});