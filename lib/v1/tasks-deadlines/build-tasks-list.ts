// lib/v1/tasks-deadlines/build-tasks-list.ts
// User's exact code.
// CHANGES: ai_response → ai_analysis, kept from_name

import { derivePriority } from '@/lib/v1/priority';
import type { TaskEmail, TaskEmailItem } from './types';
import { getEmailDueDate } from './utils/email-due-date';
import { getTaskBucket } from './utils/task-bucket';
import { isActionableEmail } from './utils/actionable-email';
import { createDisplayTasks } from './utils/display-tasks';

export function buildTasksList(emails: TaskEmail[]): TaskEmailItem[] {
  return emails
    .filter((email) => !email.actionTaken)
    .filter(isActionableEmail)
    .map((email) => {
      const dueDate = getEmailDueDate(email);

      if (!dueDate) {
        return null;
      }

      const priority = derivePriority(email.ai_analysis);

      return {
        emailId: email.id,
        threadId: email.threadId,

        primaryTag:
          email.ai_analysis?.primary_tag ||
          email.from_name ||
          'Unknown',

        subject: email.subject,

        summary: email.ai_analysis?.summary || '',

        dueDate,

        bucket: getTaskBucket(dueDate),

        tasks: createDisplayTasks(email),

        priorityScore: priority.score,

        priorityLevel: priority.level,
      } satisfies TaskEmailItem;
    })
    .filter((item): item is TaskEmailItem => item !== null)
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
