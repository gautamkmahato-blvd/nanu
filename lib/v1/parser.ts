// Parses raw Gmail messages into flat rows for the `emails` table.
// Pipeline: GmailMessage -> parseGmailMessage() -> emailRowSchema.safeParse() -> upsertEmail()

// ---------------------------------------------------------------------------
// Types matching the Corsair Gmail API response shape
// ---------------------------------------------------------------------------

export interface GmailHeader {
  name?: string;
  value?: string;
}

export interface GmailBody {
  attachmentId?: string;
  size?: number;
  data?: string;
}

export interface GmailPart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: GmailBody;
  parts?: GmailPart[]; // recursive ("lazy" in Corsair's Zod schema)
}

export interface GmailMessage {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string | number | Date | null;
  sizeEstimate?: number;
  payload?: GmailPart;
  raw?: string;
}

export interface ParsedAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface ParsedAddress {
  name: string | null;
  email: string;
}

// ---------------------------------------------------------------------------
// 1. Header helpers
// ---------------------------------------------------------------------------

/** Case-insensitive header lookup. Returns null if header is absent or empty. */
export function getHeader(headers: GmailHeader[] | undefined, name: string): string | null {
  if (!headers) return null;
  const lower = name.toLowerCase();
  const found = headers.find((h) => h.name?.toLowerCase() === lower);
  const value = found?.value?.trim();
  return value ? value : null;
}

// ---------------------------------------------------------------------------
// 2. Address parsing
// ---------------------------------------------------------------------------

/**
 * Parses a single RFC 5322 mailbox like:
 *   `"Gautam Kumar" <gk@example.com>` -> { name: "Gautam Kumar", email: "gk@example.com" }
 *   `gk@example.com`                  -> { name: null, email: "gk@example.com" }
 */
export function parseAddress(raw: string): ParsedAddress | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Form: Name <email>
  const angleMatch = trimmed.match(/^(.*?)<([^<>\s]+@[^<>\s]+)>$/);
  if (angleMatch) {
    let name = angleMatch[1].trim().replace(/^"(.*)"$/, "$1").trim();
    return {
      name: name || null,
      email: angleMatch[2].trim().toLowerCase(),
    };
  }

  // Form: bare email (possibly with stray punctuation around it)
  const bareMatch = trimmed.match(/([^<>\s,;"]+@[^<>\s,;"]+)/);
  if (bareMatch) {
    return { name: null, email: bareMatch[1].toLowerCase() };
  }

  return null;
}

/**
 * Parses a To/Cc/Bcc header that may contain multiple recipients.
 * Splits on commas, but NOT commas inside quoted display names:
 *   `"Doe, John" <john@x.com>, jane@y.com` -> 2 addresses
 */
export function parseAddressList(raw: string | null): ParsedAddress[] {
  if (!raw) return [];

  const parts: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const ch of raw) {
    if (ch === '"') inQuotes = !inQuotes;
    if (ch === "," && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);

  return parts
    .map((p) => parseAddress(p))
    .filter((a): a is ParsedAddress => a !== null);
}

// ---------------------------------------------------------------------------
// 3. Body decoding
// ---------------------------------------------------------------------------

const BASE64URL_RE = /^[A-Za-z0-9_-]+={0,2}$/;

/**
 * Gmail's API base64url-encodes body data, but Corsair may return it
 * already decoded (your test email came back as plain text).
 * This handles both cases safely.
 */
export function decodeBody(data: string | undefined): string | null {
  if (!data) return null;

  // Plain text will almost always contain spaces, newlines, or symbols
  // outside the base64url alphabet -> return as-is.
  const compact = data.replace(/\s/g, "");
  if (!BASE64URL_RE.test(compact) || compact.length < 8) {
    return data;
  }

  // Looks like base64url -> try to decode, fall back to original on garbage.
  try {
    const decoded = Buffer.from(compact, "base64url").toString("utf-8");
    // If decoding produced replacement chars / mostly non-printable bytes,
    // the input was probably plain text that happened to look like base64.
    const nonPrintable = decoded.match(/[\x00-\x08\x0E-\x1F\uFFFD]/g)?.length ?? 0;
    if (decoded.length === 0 || nonPrintable / decoded.length > 0.1) {
      return data;
    }
    return decoded;
  } catch {
    return data;
  }
}

// ---------------------------------------------------------------------------
// 4. MIME tree walk (text / html / attachments)
// ---------------------------------------------------------------------------

export interface ExtractedContent {
  text: string | null;
  html: string | null;
  attachments: ParsedAttachment[];
}

/**
 * Recursively walks payload.parts to extract:
 *  - first text/plain part  -> bodyText
 *  - first text/html part   -> bodyHtml
 *  - any part with a filename + attachmentId -> attachments[]
 *
 * Also handles non-multipart messages where the body sits directly
 * on `payload.body` (like your "Hello this is just text" sample).
 */
export function extractContent(payload: GmailPart | undefined): ExtractedContent {
  const out: ExtractedContent = { text: null, html: null, attachments: [] };
  if (!payload) return out;

  const walk = (part: GmailPart): void => {
    const mime = part.mimeType?.toLowerCase() ?? "";

    // Attachment: has a filename and an attachmentId (body data lives elsewhere)
    if (part.filename && part.body?.attachmentId) {
      out.attachments.push({
        filename: part.filename,
        mimeType: part.mimeType ?? "application/octet-stream",
        size: part.body.size ?? 0,
        attachmentId: part.body.attachmentId,
      });
    } else if (mime === "text/plain" && part.body?.data && out.text === null) {
      out.text = decodeBody(part.body.data);
    } else if (mime === "text/html" && part.body?.data && out.html === null) {
      out.html = decodeBody(part.body.data);
    }

    part.parts?.forEach(walk);
  };

  walk(payload);

  // Non-multipart fallback: body directly on payload, no parts array.
  if (out.text === null && out.html === null && payload.body?.data) {
    const decoded = decodeBody(payload.body.data);
    const mime = payload.mimeType?.toLowerCase() ?? "";
    if (mime === "text/html") out.html = decoded;
    else out.text = decoded;
  }

  return out;
}

// ---------------------------------------------------------------------------
// 5. Label flags
// ---------------------------------------------------------------------------

export interface LabelFlags {
  isSent: boolean;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

export function deriveLabelFlags(labelIds: string[] | undefined): LabelFlags {
  const labels = new Set(labelIds ?? []);
  return {
    isSent: labels.has("SENT"),
    isRead: !labels.has("UNREAD"),
    isStarred: labels.has("STARRED"),
    // Archived = not in inbox, not sent-only, not trash/spam edge cases.
    // For inbox purposes: anything without INBOX that isn't purely SENT.
    isArchived: !labels.has("INBOX") && !labels.has("SENT"),
  };
}

// ---------------------------------------------------------------------------
// 6. Date handling
// ---------------------------------------------------------------------------

/**
 * internalDate is typed `string | number | Date | null` by Corsair.
 * Usually epoch millis as a string ("1781197709000").
 * Falls back to the RFC 2822 `Date` header, then to "now" as a last resort
 * (so a weird message sorts to the top where you'll notice it, instead of crashing).
 */
export function parseReceivedAt(
  internalDate: string | number | Date | null | undefined,
  headers: GmailHeader[] | undefined
): Date {
  if (internalDate instanceof Date && !isNaN(internalDate.getTime())) {
    return internalDate;
  }
  if (internalDate !== null && internalDate !== undefined) {
    const ms = Number(internalDate);
    if (!isNaN(ms) && ms > 0) return new Date(ms);
  }
  const dateHeader = getHeader(headers, "Date");
  if (dateHeader) {
    const d = new Date(dateHeader);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

// ---------------------------------------------------------------------------
// 7. Small normalizers
// ---------------------------------------------------------------------------

/** "(No subject)" / "" -> null, otherwise trimmed subject. */
export function normalizeSubject(subject: string | null): string | null {
  if (!subject) return null;
  const s = subject.trim();
  if (!s || s.toLowerCase() === "(no subject)") return null;
  return s;
}

/** Gmail snippets contain HTML entities (&amp; &#39; etc). Decode the common ones. */
export function decodeSnippet(snippet: string | undefined): string | null {
  if (!snippet) return null;
  return snippet
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim() || null;
}

// ---------------------------------------------------------------------------
// 8. Main orchestrator: raw API message -> flat row for the `emails` table
// ---------------------------------------------------------------------------

export interface ParsedEmailRow {
  id: string;
  threadId: string;
  labelIds: string[];
  isSent: boolean;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string | null;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  hasAttachments: boolean;
  attachments: ParsedAttachment[];
  messageIdHeader: string | null;
  inReplyTo: string | null;
  referencesHeader: string | null;
  receivedAt: Date;
  historyId: string | null;
  sizeEstimate: number | null;
}

export function parseGmailMessage(msg: GmailMessage): ParsedEmailRow {
  const headers = msg.payload?.headers;

  const from = parseAddress(getHeader(headers, "From") ?? "") ?? {
    name: null,
    email: "", // empty -> Zod rejects -> message is skipped + logged, sync survives
  };

  const content = extractContent(msg.payload);
  const flags = deriveLabelFlags(msg.labelIds);

  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? msg.id ?? "",
    labelIds: msg.labelIds ?? [],
    ...flags,

    fromEmail: from.email,
    fromName: from.name,
    toEmails: parseAddressList(getHeader(headers, "To")).map((a) => a.email),
    ccEmails: parseAddressList(getHeader(headers, "Cc")).map((a) => a.email),
    bccEmails: parseAddressList(getHeader(headers, "Bcc")).map((a) => a.email),

    subject: normalizeSubject(getHeader(headers, "Subject")),
    snippet: decodeSnippet(msg.snippet),
    bodyText: content.text,
    bodyHtml: content.html,
    hasAttachments: content.attachments.length > 0,
    attachments: content.attachments,

    messageIdHeader: getHeader(headers, "Message-Id") ?? getHeader(headers, "Message-ID"),
    inReplyTo: getHeader(headers, "In-Reply-To"),
    referencesHeader: getHeader(headers, "References"),

    receivedAt: parseReceivedAt(msg.internalDate, headers),
    historyId: msg.historyId ?? null,
    sizeEstimate: msg.sizeEstimate ?? null,
  };
}
