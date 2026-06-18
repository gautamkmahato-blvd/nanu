// lib/v1/tasks-deadlines/utils/email-due-date.ts
// User's updated code with safeParseDate.
// CHANGE: ai_response → ai_analysis (matches DB column name)

import type { TaskEmail } from '../types';
import { safeParseDate } from './safe-parse-date';
import { getActionDueDate } from './action-due-date';

export function getEmailDueDate(
  email: TaskEmail,
): Date | null {
  const ai = email.ai_analysis;
  if (!ai) return null;

  // Priority 1: task-level due date
  const firstTaskDueDate = ai.action_items?.find(
    (item) => item.due_date,
  )?.due_date;

  const taskDate = safeParseDate(firstTaskDueDate);
  if (taskDate) {
    return taskDate;
  }

  // Priority 2: explicit email deadline
  const deadlineDate = safeParseDate(ai.deadline);
  if (ai.deadline_detected && deadlineDate) {
    return deadlineDate;
  }

  // Priority 3: AI-estimated timeframe
  if (
    ai.action_timeframe &&
    ai.action_timeframe !== 'no_action_needed'
  ) {
    return getActionDueDate(ai.action_timeframe);
  }

  return null;
}
