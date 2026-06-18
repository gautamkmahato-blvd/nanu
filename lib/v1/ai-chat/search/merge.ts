// lib/v1/ai-chat/search/merge.ts
// Reciprocal Rank Fusion (RRF): merges results from structured, fulltext, and semantic search.
// Deduplicates by email id, combines scores, tracks which layers matched.

import type { SearchResultEmail } from '../types';

const RRF_K = 60; // Standard RRF constant — higher = smoother ranking

type MergedResult = SearchResultEmail & {
  rrf_score: number;
};

/**
 * Merge results from multiple search layers using Reciprocal Rank Fusion.
 * Each result's score = sum of 1/(rank + K) across all layers it appeared in.
 * Higher score = appeared in more layers at higher ranks.
 */
export function mergeResults(
  layers: {
    name: 'structured' | 'fulltext' | 'semantic';
    results: SearchResultEmail[];
  }[],
  limit = 10,
): SearchResultEmail[] {
  const merged = new Map<string, MergedResult>();

  for (const layer of layers) {
    for (let rank = 0; rank < layer.results.length; rank++) {
      const result = layer.results[rank];
      const rrfScore = 1 / (rank + RRF_K);

      const existing = merged.get(result.id);
      if (existing) {
        existing.rrf_score += rrfScore;
        if (!existing.match_sources.includes(layer.name)) {
          existing.match_sources.push(layer.name);
        }
      } else {
        merged.set(result.id, {
          ...result,
          rrf_score: rrfScore,
          match_sources: [layer.name],
        });
      }
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => {
      // First by number of matching layers (more = better)
      if (a.match_sources.length !== b.match_sources.length) {
        return b.match_sources.length - a.match_sources.length;
      }
      // Then by RRF score
      return b.rrf_score - a.rrf_score;
    })
    .slice(0, limit)
    .map((r) => ({
      ...r,
      relevance_score: Math.round(r.rrf_score * 1000) / 1000,
    }));
}
