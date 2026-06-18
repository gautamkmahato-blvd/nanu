// lib/v1/mime.ts  (UPDATED — adds In-Reply-To / References for replies)
// Builds a base64url-encoded RFC 2822 message for gmail.api.messages.send.
//
// Edge cases handled:
// - Header injection: CR/LF stripped from every header value
// - Non-ASCII subjects: RFC 2047 encoded-words, chunked without splitting
//   multibyte characters
// - Non-ASCII bodies: base64 content-transfer-encoding, 76-char lines
// - CRLF line endings, blank line between headers and body
// - Reply threading: In-Reply-To + References headers so the RECIPIENT's
//   mail client threads the reply correctly (Gmail's own threading uses
//   the threadId param on send, but other clients rely on these headers)

const CRLF = '\r\n';
const ASCII_PRINTABLE = /^[\x20-\x7E]*$/;

/** Strips CR/LF so user input can never inject extra headers. */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * RFC 2047 encoding for non-ASCII header values (Subject).
 * Chunks by bytes (max ~45 source bytes per encoded-word) without ever
 * splitting a multibyte character.
 */
function encodeHeaderValue(value: string): string {
  const clean = sanitizeHeaderValue(value);
  if (ASCII_PRINTABLE.test(clean)) {
    return clean;
  }

  const MAX_CHUNK_BYTES = 45;
  const words: string[] = [];
  let chunk = '';
  let chunkBytes = 0;

  for (const char of clean) {
    const charBytes = Buffer.byteLength(char, 'utf-8');
    if (chunkBytes + charBytes > MAX_CHUNK_BYTES && chunk) {
      words.push(`=?UTF-8?B?${Buffer.from(chunk, 'utf-8').toString('base64')}?=`);
      chunk = '';
      chunkBytes = 0;
    }
    chunk += char;
    chunkBytes += charBytes;
  }
  if (chunk) {
    words.push(`=?UTF-8?B?${Buffer.from(chunk, 'utf-8').toString('base64')}?=`);
  }

  return words.join(`${CRLF} `);
}

/** Base64 body folded to 76-char lines per RFC 2045. */
function encodeBody(body: string): string {
  const base64 = Buffer.from(body, 'utf-8').toString('base64');
  const lines: string[] = [];
  for (let index = 0; index < base64.length; index += 76) {
    lines.push(base64.slice(index, index + 76));
  }
  return lines.join(CRLF);
}

export type BuildMimeInput = {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  bodyText: string;
  /** Message-Id of the message being replied to, e.g. "<abc@mail.gmail.com>" */
  inReplyTo?: string;
  /** Space-separated Message-Id chain for the thread */
  references?: string;
};

/** Returns the base64url string that messages.send expects as `raw`. */
export function buildMimeMessage(input: BuildMimeInput): string {
  const to = input.to.map(sanitizeHeaderValue).filter(Boolean);
  const cc = (input.cc ?? []).map(sanitizeHeaderValue).filter(Boolean);

  const headers: string[] = [
    `From: ${sanitizeHeaderValue(input.from)}`,
    `To: ${to.join(', ')}`,
  ];

  if (cc.length > 0) {
    headers.push(`Cc: ${cc.join(', ')}`);
  }

  if (input.inReplyTo) {
    headers.push(`In-Reply-To: ${sanitizeHeaderValue(input.inReplyTo)}`);
  }
  if (input.references) {
    headers.push(`References: ${sanitizeHeaderValue(input.references)}`);
  }

  headers.push(
    `Subject: ${encodeHeaderValue(input.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  );

  const mime = headers.join(CRLF) + CRLF + CRLF + encodeBody(input.bodyText);

  return Buffer.from(mime, 'utf-8').toString('base64url');
}

/** "Re: " prefix without stacking ("Re: Re: Re: hi"). Null subject -> "Re:". */
export function replySubject(subject: string | null): string {
  const clean = subject?.trim() ?? '';
  if (!clean) return 'Re:';
  return /^re:/i.test(clean) ? clean : `Re: ${clean}`;
}
