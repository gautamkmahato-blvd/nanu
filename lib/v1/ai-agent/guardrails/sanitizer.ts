// lib/v1/ai-agent/sanitizer.ts
// Neutralizes prompt injection attempts WITHOUT blocking the query.
// Key principle: never reject a query — sanitize and pass through.
// This preserves accuracy while preventing the LLM from following injected instructions.

// ---------------------------------------------------------------------------
// Injection patterns — these get STRIPPED from the message, not blocked
// ---------------------------------------------------------------------------

const INJECTION_PREFIXES = [
  // Direct instruction override attempts
  /^\s*(ignore|forget|disregard|override|bypass|skip)\s+(all\s+)?(your\s+)?(previous\s+|prior\s+|above\s+)?(instructions|rules|prompts|guidelines|constraints|system\s*prompt)/i,
  /^\s*(you\s+are\s+now|act\s+as|pretend\s+(to\s+be|you'?re)|from\s+now\s+on\s+you\s+are|switch\s+to|enter)\s/i,
  /^\s*(system|admin|root|sudo|developer\s+mode|debug\s+mode|jailbreak|dan\s+mode|do\s+anything\s+now)\s*[:>]/i,
  /^\s*\[?(system|SYSTEM|System)\]?\s*[:>]/i,
];

const INJECTION_ANYWHERE = [
  // Prompt leaking attempts
  /(?:reveal|show|print|display|output|repeat|echo)\s+(?:your\s+)?(?:system\s*prompt|instructions|rules|initial\s*prompt|hidden\s*prompt|secret\s*instructions)/i,
  // Role hijacking
  /(?:you\s+must|you\s+should|you\s+will|you\s+need\s+to)\s+(?:always|never|now)\s+(?:ignore|bypass|override|forget)/i,
  // Code execution attempts
  /(?:run|execute|eval|import|require|install|download|fetch|curl|wget)\s+(?:this\s+)?(?:script|code|command|package|module|file|program|binary)/i,
  // Data exfiltration via email
  /(?:send|forward|email|mail)\s+(?:all|every|my|the)\s+(?:emails?|data|messages?|contacts?|info|information|credentials?|passwords?|tokens?)\s+to\s/i,
  // SQL injection (even though parameterized, strip it from LLM context)
  /(?:DROP\s+TABLE|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|INSERT\s+INTO|UPDATE\s+.+\s+SET|UNION\s+SELECT|;\s*--)/i,
];

// ---------------------------------------------------------------------------
// Sanitize user input
// ---------------------------------------------------------------------------

export type SanitizeResult = {
  message: string;
  wasModified: boolean;
  injectionDetected: boolean;
  injectionsFound: string[];
};

export function sanitizeInput(rawMessage: string): SanitizeResult {
  let message = rawMessage.trim();
  const injectionsFound: string[] = [];
  let wasModified = false;

  // 1. Strip injection prefixes
  for (const pattern of INJECTION_PREFIXES) {
    const match = message.match(pattern);
    if (match) {
      injectionsFound.push(`prefix: "${match[0].trim()}"`);
      message = message.replace(pattern, '').trim();
      wasModified = true;
    }
  }

  // 2. Check for injection patterns anywhere in the message
  for (const pattern of INJECTION_ANYWHERE) {
    const match = message.match(pattern);
    if (match) {
      injectionsFound.push(`pattern: "${match[0].trim().slice(0, 50)}"`);
    }
  }

  // 3. Strip control characters and zero-width chars (used to hide injection)
  const beforeLen = message.length;
  message = message
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, '') // zero-width chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');  // control chars except \t\n\r
  if (message.length !== beforeLen) wasModified = true;

  // 4. Limit message length (prevent token-stuffing attacks)
  const MAX_LENGTH = 4000;
  if (message.length > MAX_LENGTH) {
    message = message.slice(0, MAX_LENGTH);
    wasModified = true;
    injectionsFound.push('truncated: exceeded max length');
  }

  return {
    message,
    wasModified,
    injectionDetected: injectionsFound.length > 0,
    injectionsFound,
  };
}

// ---------------------------------------------------------------------------
// Sanitize email context (prevents injection via malicious email subjects/bodies)
// ---------------------------------------------------------------------------

export function sanitizeEmailContext(text: string, maxLen = 500): string {
  return text
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLen);
}
