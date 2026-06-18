// lib/v1/tasks-deadlines/utils/safe-parse-date.ts
// User's exact code. No changes.

export function safeParseDate(
  value?: string | null,
): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
