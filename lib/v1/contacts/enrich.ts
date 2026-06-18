// lib/v1/contacts/enrich.ts
// JS post-processing: extracts topics from ai_analysis, merges sent stats,
// and builds the final ContactIntelligence objects.

import type { ContactIntelligence } from './types';

type ReceivedStats = {
  from_email: string;
  from_name: string | null;
  emails_received: number;
  total_threads: number;
  last_email_at: string;
  first_email_at: string;
  pending_count: number;
  relationship_type: string | null;
  latest_sentiment: string | null;
  primary_tag: string | null;
};

type SentStats = {
  to_email: string;
  emails_sent: number;
};

type AIDataRow = {
  from_email: string;
  ai_analysis: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// Topic extraction from ai_analysis
// ---------------------------------------------------------------------------

function extractTopics(aiDataRows: AIDataRow[]): Map<string, string[]> {
  const topicsMap = new Map<string, Map<string, number>>();

  for (const row of aiDataRows) {
    const ai = row.ai_analysis;
    if (!ai) continue;

    const email = row.from_email;
    if (!topicsMap.has(email)) topicsMap.set(email, new Map());
    const counts = topicsMap.get(email)!;

    // Extract from tags array
    const tags = ai.tags;
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim()) {
          const key = tag.trim().toLowerCase();
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }

    // Extract from topics array
    const topics = ai.topics;
    if (Array.isArray(topics)) {
      for (const topic of topics) {
        if (typeof topic === 'string' && topic.trim()) {
          const key = topic.trim().toLowerCase();
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }

    // Extract topic_cluster
    const cluster = ai.topic_cluster;
    if (typeof cluster === 'string' && cluster.trim()) {
      const key = cluster.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  // Convert to sorted arrays (most common first, top 8)
  const result = new Map<string, string[]>();
  for (const [email, counts] of topicsMap) {
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic]) => topic);
    result.set(email, sorted);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Build initials from name or email
// ---------------------------------------------------------------------------

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Main enrichment: merge all data sources into ContactIntelligence[]
// ---------------------------------------------------------------------------

export function enrichContacts(
  receivedStats: ReceivedStats[],
  sentStats: SentStats[],
  aiData: AIDataRow[],
): ContactIntelligence[] {
  // Build sent lookup
  const sentMap = new Map<string, number>();
  for (const s of sentStats) {
    sentMap.set(s.to_email, s.emails_sent);
  }

  // Build topics lookup
  const topicsMap = extractTopics(aiData);

  // Merge
  return receivedStats.map((r) => ({
    email: r.from_email,
    name: r.from_name,
    emailsReceived: Number(r.emails_received),
    emailsSent: sentMap.get(r.from_email) ?? 0,
    totalThreads: Number(r.total_threads),
    lastEmailAt: new Date(r.last_email_at).toISOString(),
    firstEmailAt: new Date(r.first_email_at).toISOString(),
    relationshipType: r.relationship_type || null,
    latestSentiment: r.latest_sentiment || null,
    primaryTag: r.primary_tag || null,
    pendingCount: Number(r.pending_count),
    topics: topicsMap.get(r.from_email) ?? [],
    initials: getInitials(r.from_name, r.from_email),
  }));
}
