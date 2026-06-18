// lib/v1/email-actions/actions.ts
// DB operations for email actions. No side effects beyond the update.

import { sql } from 'drizzle-orm';
import { db } from '@/db';

export type ActionType = 'mark_done' | 'unmark_done' | 'mark_important' | 'unmark_important';

export type ActionResult = {
  success: boolean;
  emailId: string;
  action: ActionType;
  error?: string;
};

export async function executeEmailAction(emailId: string, action: ActionType, tenantId = 'default'): Promise<ActionResult> {
  if (!emailId) {
    return { success: false, emailId, action, error: 'Email ID is required' };
  }

  try {
    switch (action) {
      case 'mark_done':
        await db.execute(sql`
          UPDATE emails
          SET action_taken = true,
              action_taken_at = now(),
              updated_at = now()
          WHERE tenant_id = ${tenantId}
            AND id = ${emailId}
        `);
        break;

      case 'unmark_done':
        await db.execute(sql`
          UPDATE emails
          SET action_taken = false,
              action_taken_at = NULL,
              updated_at = now()
          WHERE tenant_id = ${tenantId}
            AND id = ${emailId}
        `);
        break;

      case 'mark_important':
        await db.execute(sql`
          UPDATE emails
          SET is_starred = true,
              updated_at = now()
          WHERE tenant_id = ${tenantId}
            AND id = ${emailId}
        `);
        break;

      case 'unmark_important':
        await db.execute(sql`
          UPDATE emails
          SET is_starred = false,
              updated_at = now()
          WHERE tenant_id = ${tenantId}
            AND id = ${emailId}
        `);
        break;

      default:
        return { success: false, emailId, action, error: `Unknown action: ${action}` };
    }

    return { success: true, emailId, action };
  } catch (err) {
    console.error(`[email-action] ${action} failed for ${emailId}:`, err);
    return { success: false, emailId, action, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}