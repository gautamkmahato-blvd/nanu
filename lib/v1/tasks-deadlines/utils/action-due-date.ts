// lib/v1/tasks-deadlines/utils/action-due-date.ts
// User's exact code. No changes.

import { addDays, addHours, addMonths } from 'date-fns';

export function getActionDueDate(
  actionTimeframe?: string | null,
): Date | null {
  if (!actionTimeframe) {
    return null;
  }

  const now = new Date();

  switch (actionTimeframe) {
    case 'immediately':
      return now;

    case 'next_1_hour':
      return addHours(now, 1);

    case 'next_6_hours':
      return addHours(now, 6);

    case 'next_12_hours':
      return addHours(now, 12);

    case 'next_24_hours':
      return addDays(now, 1);

    case 'next_3_days':
      return addDays(now, 3);

    case 'next_1_week':
      return addDays(now, 7);

    case 'next_1_month':
      return addMonths(now, 1);

    default:
      return null;
  }
}
