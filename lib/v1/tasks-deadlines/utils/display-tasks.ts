// lib/v1/tasks-deadlines/utils/display-tasks.ts
// User's exact code.
// CHANGE: ai_response → ai_analysis (matches DB column name)

import type { TaskEmail, TaskItem } from '../types';

export function createDisplayTasks(email: TaskEmail): TaskItem[] {
  const ai = email.ai_analysis;

  if (ai?.action_items && ai.action_items.length > 0) {
    return ai.action_items.map((item) => ({
      task: item.task,
      owner: (['sender', 'recipient', 'unknown'].includes(item.owner)
        ? item.owner
        : 'unknown') as TaskItem['owner'],
      due_date: item.due_date ?? null,
    }));
  }

  return [
    {
      task: ai?.recommended_action || 'Review email',
      owner: 'recipient' as const,
      due_date: null,
    },
  ];
}
