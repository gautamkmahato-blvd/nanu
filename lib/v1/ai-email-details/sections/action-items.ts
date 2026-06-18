// lib/v1/ai-email-details/sections/action-items.ts

import type { AIAnalysis, ActionItem } from '../types';

export type ActionItemsSection = {
  items: ActionItem[];
};

export function extractActionItems(ai: AIAnalysis | null): ActionItemsSection {
  if (!ai || !Array.isArray(ai.action_items)) {
    return { items: [] };
  }

  const items: ActionItem[] = [];

  for (const raw of ai.action_items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    const task = typeof item.task === 'string' ? item.task.trim() : '';
    if (!task) continue;

    items.push({
      task,
      owner: ['sender', 'recipient', 'unknown'].includes(item.owner as string)
        ? (item.owner as ActionItem['owner'])
        : 'unknown',
      dueDate: typeof item.due_date === 'string' ? item.due_date : null,
    });
  }

  return { items };
}
