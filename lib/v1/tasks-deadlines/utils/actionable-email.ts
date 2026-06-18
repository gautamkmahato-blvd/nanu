// lib/v1/tasks-deadlines/utils/actionable-email.ts
// User's exact code.
// CHANGE: ai_response → ai_analysis (matches DB column name)

import type { TaskEmail } from '../types';

export function isActionableEmail(email: TaskEmail): boolean {
  const ai = email.ai_analysis;
  if (!ai) return false;

  return (
    (ai.action_items?.length ?? 0) > 0 ||
    ai.waiting_on_me === true ||
    ai.requires_response === true
  );
}
