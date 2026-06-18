// app/mails/v1/compose-modal.tsx
'use client';

// Compose button + modal. Self-contained: drop <ComposeModal onSent={loadInbox} />
// next to the Sync button.
//
// Edge cases handled:
// - double-submit guard (sending flag disables the button)
// - comma/semicolon-separated recipient parsing with inline validation
// - Escape / backdrop close, with a confirm when the form has content
// - server error shown inline, modal stays open, input preserved
// - form resets only after a successful send
// - focus moves into the modal on open

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  btnDisabled,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from '../../_components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 14,
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  marginBottom: 4,
};

function parseRecipients(value: string): { emails: string[]; invalid: string[] } {
  const tokens = value
    .split(/[,;]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const emails = [...new Set(tokens.filter((token) => EMAIL_RE.test(token)))];
  const invalid = tokens.filter((token) => !EMAIL_RE.test(token));
  return { emails, invalid };
}

type ComposeModalProps = {
  onSent?: () => void | Promise<void>;
};

export function ComposeModal({ onSent }: ComposeModalProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const toInputRef = useRef<HTMLInputElement>(null);

  const isDirty = Boolean(to || cc || subject || body);

  const close = useCallback(
    (force = false) => {
      if (sending) return; // never close mid-send
      if (!force && isDirty && !window.confirm('Discard this message?')) return;

      setOpen(false);
      setError('');
    },
    [sending, isDirty],
  );

  // Escape closes; focus the To field on open.
  useEffect(() => {
    if (!open) return;

    toInputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  async function handleSend() {
    if (sending) return;
    setError('');

    // Client-side validation: instant feedback, server re-validates anyway.
    const toParsed = parseRecipients(to);
    const ccParsed = parseRecipients(cc);

    if (toParsed.invalid.length > 0 || ccParsed.invalid.length > 0) {
      const bad = [...toParsed.invalid, ...ccParsed.invalid].join(', ');
      setError(`Invalid email address: ${bad}`);
      return;
    }
    if (toParsed.emails.length === 0) {
      setError('Add at least one recipient');
      return;
    }
    if (!body.trim()) {
      setError('Message body is required');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/v1/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toParsed.emails,
          cc: ccParsed.emails,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to send email');
      }

      // Success: reset the form, close, refresh the inbox.
      setTo('');
      setCc('');
      setSubject('');
      setBody('');
      setOpen(false);
      await onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={btnPrimary}
      >
        Compose
      </button>

      {open ? (
        <div
          onClick={() => close()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-label="Compose email"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 10,
              width: 'min(560px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              padding: 20,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 16 }}>New message</h2>
              <button
                type="button"
                onClick={() => close()}
                disabled={sending}
                style={{ ...btnGhost, ...btnDisabled(sending) }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle} htmlFor="compose-to">
                To
              </label>
              <input
                id="compose-to"
                ref={toInputRef}
                style={fieldStyle}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="someone@example.com, other@example.com"
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle} htmlFor="compose-cc">
                Cc <span style={{ fontWeight: 400, color: '#999' }}>(optional)</span>
              </label>
              <input
                id="compose-cc"
                style={fieldStyle}
                value={cc}
                onChange={(event) => setCc(event.target.value)}
                placeholder="cc@example.com"
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle} htmlFor="compose-subject">
                Subject
              </label>
              <input
                id="compose-subject"
                style={fieldStyle}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject"
                maxLength={500}
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle} htmlFor="compose-body">
                Message
              </label>
              <textarea
                id="compose-body"
                style={{ ...fieldStyle, minHeight: 140, resize: 'vertical' }}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your message…"
                disabled={sending}
              />
            </div>

            {error ? (
              <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 12px' }}>
                {error}
              </p>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => close()}
                disabled={sending}
                style={{ ...btnSecondary, ...btnDisabled(sending) }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                style={{ ...btnPrimary, ...btnDisabled(sending) }}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
