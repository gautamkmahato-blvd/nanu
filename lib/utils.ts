export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Extracts and parses a JSON object from messy LLM output.
 * Returns a clean Record<string, unknown> or throws with a clear message.
 */
export function extractJsonFromLLM(raw: unknown): Record<string, unknown> {
  // Step 0: get a string to work with
  if (raw === null || raw === undefined) {
    throw new Error('LLM returned null/undefined');
  }

  // Already an object (some APIs parse for you) — pass through
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }

  let text = String(raw).trim();
  if (!text) {
    throw new Error('LLM returned empty string');
  }

  // Step 1: strip markdown fences (```json ... ``` or ``` ... ```)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim();

  // Step 3: fix trailing commas — ,} or ,] (invalid JSON, very common LLM mistake)
  text = text.replace(/,\s*([\]}])/g, '$1');

  // Step 4: parse
  try {
    const parsed = JSON.parse(text);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('LLM returned a non-object JSON value');
    }

    return parsed as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `Failed to parse LLM JSON: ${err instanceof Error ? err.message : err}\n` +
      `Cleaned text: "${text.slice(0, 200)}"`,
    );
  }
}