// lib/v1/tasks-deadlines/types.ts

import type { PriorityLevel } from '@/lib/v1/priority';

export type AIAnalysis = {
  action_items?: { task: string; owner: string; due_date?: string | null }[];
  waiting_on_me?: boolean;
  requires_response?: boolean;
  deadline_detected?: boolean;
  deadline?: string | null;
  action_timeframe?: string | null;
  recommended_action?: string | null;
  summary?: string | null;
  primary_tag?: string | null;
  [key: string]: unknown;
};

export type TaskEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  from_name: string | null;
  snippet: string | null;
  receivedAt: string;
  actionTaken: boolean;
  ai_analysis: AIAnalysis | null;
};

export type TaskItem = {
  task: string;
  owner: 'sender' | 'recipient' | 'unknown';
  due_date: string | null;
};

export type TaskBucket =
  | 'overdue'
  | 'today'
  | 'tomorrow'
  | 'next_3_days'
  | 'this_week'
  | 'later';

export type TaskEmailItem = {
  emailId: string;
  threadId: string;
  primaryTag: string;
  subject: string | null;
  summary: string;
  dueDate: Date;
  bucket: TaskBucket;
  tasks: TaskItem[];
  priorityScore: number;
  priorityLevel: PriorityLevel;
};

export type GroupedTasks = {
  overdue: TaskEmailItem[];
  today: TaskEmailItem[];
  tomorrow: TaskEmailItem[];
  next3Days: TaskEmailItem[];
  thisWeek: TaskEmailItem[];
  later: TaskEmailItem[];
};
