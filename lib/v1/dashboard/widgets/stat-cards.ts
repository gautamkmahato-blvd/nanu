// lib/v1/dashboard/widgets/stat-cards.ts
// Counts emails per attention label for the top stat cards.
// UNCHANGED from user's logic.

import type { DashboardEmail } from '../types';

export type StatCards = {
  opportunities: number;
  risks: number;
  deadlines: number;
  followUps: number;
  information: number;
  actionRequired: number;
};

export function computeStatCards(emails: DashboardEmail[]): StatCards {
  const opportunityCount = emails.filter(
    (email) => email.attentionLabels.includes('opportunity'),
  ).length;

  const riskCount = emails.filter(
    (email) => email.attentionLabels.includes('risk'),
  ).length;

  const deadlineCount = emails.filter(
    (email) => email.attentionLabels.includes('deadline'),
  ).length;

  const followUpCount = emails.filter(
    (email) => email.attentionLabels.includes('follow_up'),
  ).length;

  const informationCount = emails.filter(
    (email) => email.attentionLabels.includes('information'),
  ).length;

  const actionRequiredCount = emails.filter(
    (email) => email.attentionLabels.includes('action_required'),
  ).length;

  return {
    opportunities: opportunityCount,
    risks: riskCount,
    deadlines: deadlineCount,
    followUps: followUpCount,
    information: informationCount,
    actionRequired: actionRequiredCount,
  };
}
