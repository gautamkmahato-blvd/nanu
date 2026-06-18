// lib/v1/tasks-deadlines/utils/task-bucket.ts
// User's exact code. No changes.

import { differenceInCalendarDays, startOfDay } from 'date-fns';

import type { TaskBucket } from '../types';

export function getTaskBucket(dueDate: Date): TaskBucket {
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  const diff = differenceInCalendarDays(due, today);

  if (diff < 0) {
    return 'overdue';
  }

  if (diff === 0) {
    return 'today';
  }

  if (diff === 1) {
    return 'tomorrow';
  }

  if (diff <= 3) {
    return 'next_3_days';
  }

  if (diff <= 7) {
    return 'this_week';
  }

  return 'later';
}
