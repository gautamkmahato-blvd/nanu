// lib/v1/tasks-deadlines/index.ts
// User's exact code. No changes.

import type { TaskEmail, GroupedTasks } from './types';
import { buildTasksList } from './build-tasks-list';
import { groupTasksByBucket } from './group-tasks';

export type { TaskEmail, TaskEmailItem, GroupedTasks, TaskBucket, TaskItem } from './types';

export function getTasksAndDeadlines(emails: TaskEmail[]): GroupedTasks {
  const tasks = buildTasksList(emails);
  return groupTasksByBucket(tasks);
}
