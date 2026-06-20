// lib/v1/ai-agent/tool-validation.ts
// Validates tool arguments AFTER the LLM generates them, BEFORE execution.
// Catches malformed, malicious, or out-of-bounds arguments.
// Does NOT affect what the user can ask — only what the LLM can do.

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas — one per tool
// ---------------------------------------------------------------------------

const emailSchema = z.string().email().max(254);

const toolSchemas: Record<string, z.ZodSchema> = {
  send_email: z.object({
    to: z.array(emailSchema).min(1).max(20),
    subject: z.string().min(1).max(500),
    body: z.string().min(1).max(50000),
    cc: z.array(emailSchema).max(20).optional(),
  }),

  reply_to_email: z.object({
    body: z.string().min(1).max(50000),
    mode: z.enum(['reply', 'replyAll']).optional(),
  }),

  create_event: z.object({
    summary: z.string().min(1).max(500),
    startDateTime: z.string().min(10).max(50),
    endDateTime: z.string().min(10).max(50),
    attendeeEmails: z.array(emailSchema).max(50).optional(),
    description: z.string().max(10000).optional(),
    includeMeet: z.boolean().optional(),
  }),

  check_availability: z.object({
    startDate: z.string().min(10).max(50),
    endDate: z.string().min(10).max(50),
  }),

  search_calendar: z.object({
    attendeeEmail: z.string().max(254).optional(),
    query: z.string().max(200).optional(),
    daysBack: z.number().int().min(1).max(365).optional(),
    daysForward: z.number().int().min(1).max(365).optional(),
  }),

  search_inbox: z.object({
    query: z.string().min(1).max(500),
  }),

  search_assets: z.object({
    query: z.string().max(500).optional(),
    category: z.enum(['pdf', 'image', 'document', 'spreadsheet', 'presentation', 'archive', 'video', 'audio', 'code', 'other']).optional(),
    from: z.string().max(254).optional(),
    asset_type: z.enum(['attachment', 'link']).optional(),
    domain: z.string().max(100).optional(),
    days_back: z.number().int().min(1).max(3650).optional(),
  }),
};

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

export type ValidationResult =
  | { valid: true; args: Record<string, unknown> }
  | { valid: false; error: string };

export function validateToolArgs(toolName: string, args: Record<string, unknown>): ValidationResult {
  const schema = toolSchemas[toolName];

  // No schema defined → allow (for Corsair MCP tools like run_script which have their own validation)
  if (!schema) return { valid: true, args };

  const result = schema.safeParse(args);
  if (result.success) {
    return { valid: true, args: result.data as Record<string, unknown> };
  }

  const errorMsg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  return { valid: false, error: `Invalid tool arguments: ${errorMsg}` };
}

// ---------------------------------------------------------------------------
// Blocklist check — prevent sending to suspicious domains
// ---------------------------------------------------------------------------

const BLOCKED_EMAIL_PATTERNS = [
  /mailinator\.com$/i,
  /guerrillamail\./i,
  /tempmail\./i,
  /throwaway\./i,
  /yopmail\./i,
  /10minutemail\./i,
];

export function checkEmailRecipients(emails: string[]): { safe: boolean; blocked: string[] } {
  const blocked: string[] = [];
  for (const email of emails) {
    if (BLOCKED_EMAIL_PATTERNS.some((p) => p.test(email))) {
      blocked.push(email);
    }
  }
  return { safe: blocked.length === 0, blocked };
}
