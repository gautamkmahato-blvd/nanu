// app/important/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider } from '../_components/ui/ToastProvider';
import EmailActionButtons from '../_components/email-actions/EmailActionButtons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportantEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  actionTaken: boolean;
  actionTakenAt: string | null;
  summary: string | null;
  sentiment: string | null;
  relationshipType: string | null;
  primaryTag: string | null;
  recommendedAction: string | null;
  urgencyScore: number;
  opportunityScore: number;
  riskScore: number;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SENTIMENT_CONFIG: Record<string, { emoji: string; color: string }> = {
  positive: { emoji: '🟢', color: '#22c55e' },
  neutral: { emoji: '🟡', color: '#f59e0b' },
  negative: { emoji: '🔴', color: '#ef4444' },
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  client: '#22c55e',
  partner: '#3b82f6',
  lead: '#8b5cf6',
  investor: '#f59e0b',
  vendor: '#6366f1',
  coworker: '#06b6d4',
  other: '#6b7280',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(name: string | null, email: string): string {
  if (name) return name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImportantPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<ImportantEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/important');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed');
      }
      const data = await res.json();
      setEmails(data.emails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = emails.filter((e) => !e.actionTaken);
  const done = emails.filter((e) => e.actionTaken);

  if (loading) return <Shell>Loading important emails...</Shell>;
  if (error) return <Shell><span style={{ color: '#ef4444' }}>{error}</span></Shell>;

  return (
    <ToastProvider>
      <div style={{ background: '#09090b', height: '100vh', overflowY: 'auto', color: '#fafafa', fontFamily: '-apple-system, system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              ★ Important Emails
            </h1>
            <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0', fontFamily: 'monospace' }}>
              {emails.length} marked important · {active.length} active · {done.length} done
            </p>
          </div>
          <button
            onClick={load}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #27272a', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {emails.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#52525b' }}>
              No important emails yet. Mark emails as important using the ☆ button in your inbox.
            </div>
          )}

          {/* Active section */}
          {active.length > 0 && (
            <>
              <SectionHeader title="Active" count={active.length} color="#f59e0b" />
              {active.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => router.push(`/ai-email-details/${email.id}`)}
                  onActionComplete={load}
                />
              ))}
            </>
          )}

          {/* Done section */}
          {done.length > 0 && (
            <>
              <SectionHeader title="Completed" count={done.length} color="#22c55e" />
              {done.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => router.push(`/ai-email-details/${email.id}`)}
                  onActionComplete={load}
                  dimmed
                />
              ))}
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div style={{
      padding: '16px 0 8px',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color,
      borderBottom: `1px solid ${color}20`,
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span>{title}</span>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#52525b' }}>{count}</span>
    </div>
  );
}

function EmailCard({
  email,
  onClick,
  onActionComplete,
  dimmed = false,
}: {
  email: ImportantEmail;
  onClick: () => void;
  onActionComplete: () => void;
  dimmed?: boolean;
}) {
  const sentiment = SENTIMENT_CONFIG[email.sentiment ?? 'neutral'] ?? SENTIMENT_CONFIG.neutral;
  const relColor = RELATIONSHIP_COLORS[email.relationshipType ?? 'other'] ?? '#6b7280';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 10,
        background: '#18181b',
        border: '1px solid #27272a',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'border-color 150ms',
        opacity: dimmed ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
    >
      {/* Row 1: sender + badges + actions + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName(email.fromName, email.fromEmail)}
        </span>

        {email.relationshipType && (
          <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 8, background: `${relColor}20`, color: relColor }}>
            {capitalize(email.relationshipType)}
          </span>
        )}

        {email.primaryTag && (
          <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 8, background: '#27272a', color: '#a1a1aa' }}>
            {email.primaryTag}
          </span>
        )}

        <span style={{ fontSize: 11 }}>{sentiment.emoji}</span>

        <EmailActionButtons
          emailId={email.id}
          subject={email.subject}
          initialDone={email.actionTaken}
          initialImportant={email.isStarred}
          onActionComplete={() => onActionComplete()}
        />

        <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace', flexShrink: 0 }}>
          {relativeTime(email.receivedAt)}
        </span>
      </div>

      {/* Row 2: subject */}
      <div style={{ fontSize: 13, fontWeight: 500, color: '#d4d4d8', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {email.subject || '(no subject)'}
      </div>

      {/* Row 3: summary */}
      {email.summary && (
        <div style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email.summary}
        </div>
      )}

      {/* Row 4: recommended action */}
      {email.recommendedAction && !dimmed && (
        <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>→</span>
          <span>{email.recommendedAction}</span>
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      {children}
    </div>
  );
}
