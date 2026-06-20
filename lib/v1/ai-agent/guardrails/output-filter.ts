// lib/v1/ai-agent/output-filter.ts
// Filters agent responses AFTER the LLM generates them, BEFORE sending to user.
// Strips code blocks (email assistant shouldn't output code),
// and checks for accidentally leaked sensitive data.

// ---------------------------------------------------------------------------
// Strip code blocks
// ---------------------------------------------------------------------------

export function filterAgentOutput(response: string): string {
  let filtered = response;

  // Remove fenced code blocks (```...```)
  // But preserve short inline code (`like this`) which is used for formatting
  filtered = filtered.replace(/```[\s\S]*?```/g, (match) => {
    // If it's a single line or very short, might be intentional formatting
    const lines = match.split('\n').length;
    if (lines <= 2) return match; // Keep short inline

    // Replace multi-line code blocks with a note
    return '_[Code generation is not supported in this assistant.]_';
  });

  // Remove script/HTML injection attempts in output
  filtered = filtered.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  filtered = filtered.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  filtered = filtered.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove potential sensitive data patterns in output
  filtered = redactSensitiveData(filtered);

  return filtered;
}

// ---------------------------------------------------------------------------
// Redact sensitive patterns
// ---------------------------------------------------------------------------

const SENSITIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, label: 'token' },        // Base64 tokens (40+ chars)
  { pattern: /\bsk-[a-zA-Z0-9]{32,}\b/g, label: 'api_key' },             // OpenAI-style keys
  { pattern: /\bghp_[a-zA-Z0-9]{36,}\b/g, label: 'github_token' },       // GitHub PATs
  { pattern: /\b(?:AIza|ya29\.)[a-zA-Z0-9_-]{20,}\b/g, label: 'google_key' }, // Google API keys
  { pattern: /\bpassword\s*[:=]\s*["']?[^\s"',]{8,}/gi, label: 'password' },
];

function redactSensitiveData(text: string): string {
  let result = text;
  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, `[REDACTED:${label}]`);
  }
  return result;
}
