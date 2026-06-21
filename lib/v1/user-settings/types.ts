// lib/v1/user-settings/types.ts

export type UserSettings = {
  id: string;
  tenantId: string;
  hasApiKey: boolean;
  syncLimit: number;
  createdAt: string;
  updatedAt: string;
};

export type DailyUsage = {
  chatCount: number;
  agentCount: number;
  searchCount: number;
  assistantCount: number;
  date: string;
};

export type UsageLimits = {
  chatLimit: number;        // 20 for free, unlimited for BYOK
  chatUsed: number;
  chatRemaining: number;
  syncLimit: number;         // 20 for free, user-configured for BYOK
  isByok: boolean;
  isUnlimited: boolean;
};

export type UsageSource = 'agent' | 'search' | 'assistant';

// Free tier limits
export const FREE_CHAT_LIMIT = 20;
export const FREE_SYNC_LIMIT = 20;
export const MAX_SYNC_LIMIT = 500;
export const BYOK_DEFAULT_SYNC_LIMIT = 100;
