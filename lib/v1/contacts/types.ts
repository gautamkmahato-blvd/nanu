// lib/v1/contacts/types.ts

export type ContactIntelligence = {
  email: string;
  name: string | null;
  emailsReceived: number;
  emailsSent: number;
  totalThreads: number;
  lastEmailAt: string;
  firstEmailAt: string;
  relationshipType: string | null;
  latestSentiment: string | null;
  primaryTag: string | null;
  pendingCount: number;
  topics: string[];
  initials: string;
};
