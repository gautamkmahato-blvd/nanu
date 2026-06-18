// lib/v1/dashboard/widgets/todays-focus.ts
// Today's Focus card: headline, counts, estimated workload.
// ALL LOGIC UNCHANGED from user's original.

import type { DashboardEmail, PriorityLevel } from '../types';

export type TodaysFocus = {
  attentionCount: number;
  urgentCount: number;
  opportunityCount: number;
  riskCount: number;
  followUpCount: number;
  estimatedWorkloadMinutes: number;
  headline: string;
};

function estimateWorkloadMinutes(emails: DashboardEmail[]): number {
  let total = 0;

  for (const email of emails) {
    switch (email.priorityLevel) {
      case 'urgent':
        total += 5;
        break;

      case 'important':
        total += 3;
        break;

      case 'normal':
        total += 1;
        break;

      default:
        break;
    }
  }

  return total;
}

function buildHeadline(data: {
  urgentCount: number;
  riskCount: number;
  opportunityCount: number;
  attentionCount: number;
}): string {
  if (data.riskCount > 0) {
    return `${data.riskCount} risk${
      data.riskCount > 1 ? 's' : ''
    } need immediate attention.`;
  }

  if (data.urgentCount > 0) {
    return `${data.urgentCount} urgent conversation${
      data.urgentCount > 1 ? 's' : ''
    } waiting for you.`;
  }

  if (data.opportunityCount > 0) {
    return `${data.opportunityCount} opportunit${
      data.opportunityCount > 1 ? 'ies' : 'y'
    } worth reviewing today.`;
  }

  if (data.attentionCount <= 3) {
    return 'Inbox looks healthy today.';
  }

  return `${data.attentionCount} items need your attention today.`;
}

export function calculateTodaysFocus(
  emails: DashboardEmail[],
): TodaysFocus {
  const attentionEmails = emails.filter(
    (email) =>
      email.priorityScore >= 70 ||
      email.attentionLabels.includes('action_required') ||
      email.attentionLabels.includes('risk') ||
      email.attentionLabels.includes('deadline'),
  );

  const attentionCount = attentionEmails.length;

  const urgentCount = attentionEmails.filter(
    (email) => email.priorityLevel === 'urgent',
  ).length;

  const opportunityCount = attentionEmails.filter(
    (email) => email.attentionLabels.includes('opportunity'),
  ).length;

  const riskCount = attentionEmails.filter(
    (email) => email.attentionLabels.includes('risk'),
  ).length;

  const followUpCount = attentionEmails.filter(
    (email) => email.attentionLabels.includes('follow_up'),
  ).length;

  const estimatedWorkload = estimateWorkloadMinutes(attentionEmails);

  const headline = buildHeadline({
    urgentCount,
    riskCount,
    opportunityCount,
    attentionCount,
  });

  return {
    attentionCount,
    urgentCount,
    opportunityCount,
    riskCount,
    followUpCount,
    estimatedWorkloadMinutes: estimatedWorkload,
    headline,
  };
}
