// lib/v1/tasks-deadlines/group-tasks.ts
// User's exact code. No changes.

import type { TaskEmailItem, GroupedTasks } from './types';

export function groupTasksByBucket(items: TaskEmailItem[]): GroupedTasks {
  return {
    overdue: items.filter((i) => i.bucket === 'overdue'),
    today: items.filter((i) => i.bucket === 'today'),
    tomorrow: items.filter((i) => i.bucket === 'tomorrow'),
    next3Days: items.filter((i) => i.bucket === 'next_3_days'),
    thisWeek: items.filter((i) => i.bucket === 'this_week'),
    later: items.filter((i) => i.bucket === 'later'),
  };
}
