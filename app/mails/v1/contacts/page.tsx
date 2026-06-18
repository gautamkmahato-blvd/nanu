// app/contacts/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContactIntelligence = {
  email: string;
  name: string | null;
  emailsReceived: number;
  emailsSent: number;
  totalThreads: number;
  lastEmailAt: string;
  firstEmailAt: string;
  relationshipType: string | null;
  latestSentiment: string | null;
  primaryTag: string | null;
  pendingCount: number;
  topics: string[];
  initials: string;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RELATIONSHIP_COLORS: Record<string, string> = {
  investor: '#f59e0b',
  manager: '#f59e0b',
  founder: '#f59e0b',
  client: '#22c55e',
  partner: '#3b82f6',
  lead: '#8b5cf6',
  vendor: '#6366f1',
  coworker: '#06b6d4',
  friend: '#ec4899',
  personal_contact: '#ec4899',
  other: '#6b7280',
};

const SENTIMENT_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  positive: { emoji: '🟢', color: '#22c55e', label: 'Positive' },
  neutral: { emoji: '🟡', color: '#f59e0b', label: 'Neutral' },
  negative: { emoji: '🔴', color: '#ef4444', label: 'Negative' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(name: string | null, email: string): string {
  if (name) return name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function domain(email: string): string {
  const at = email.indexOf('@');
  return at > 0 ? email.slice(at + 1) : '';
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/contacts');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed');
      }
      const data = await res.json();
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter by search
  const filtered = searchQuery.trim()
    ? contacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.email.toLowerCase().includes(q) ||
          (c.name?.toLowerCase().includes(q) ?? false) ||
          (c.relationshipType?.toLowerCase().includes(q) ?? false) ||
          c.topics.some((t) => t.includes(q))
        );
      })
    : contacts;

  if (loading) return <Shell>Loading contacts...</Shell>;
  if (error) return <Shell><span style={{ color: '#ef4444' }}>{error}</span></Shell>;

  return (
    <div style={{ background: '#09090b', height: '100vh', overflowY: 'auto', color: '#fafafa', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Contact Intelligence</h1>
          <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0', fontFamily: 'monospace' }}>
            {contacts.length} contacts · computed from {contacts.reduce((s, c) => s + c.emailsReceived + c.emailsSent, 0)} emails
          </p>
        </div>
        <button
          onClick={load}
          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #27272a', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 32px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts by name, email, relationship, or topic..."
          style={{
            width: '100%',
            maxWidth: 500,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #27272a',
            background: '#18181b',
            color: '#fafafa',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Contacts grid */}
      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px 0', color: '#52525b', gridColumn: '1 / -1', textAlign: 'center' }}>
            {searchQuery ? 'No contacts match your search.' : 'No contacts found.'}
          </div>
        )}

        {filtered.map((contact) => (
          <ContactCard key={contact.email} contact={contact} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact card
// ---------------------------------------------------------------------------

function ContactCard({ contact }: { contact: ContactIntelligence }) {
  const relColor = RELATIONSHIP_COLORS[contact.relationshipType ?? 'other'] ?? '#6b7280';
  const sentiment = SENTIMENT_CONFIG[contact.latestSentiment ?? 'neutral'] ?? SENTIMENT_CONFIG.neutral;

  return (
    <div style={{
      background: '#18181b',
      borderRadius: 12,
      border: '1px solid #27272a',
      padding: 20,
      transition: 'border-color 150ms',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
    >
      {/* Header: avatar + name + relationship badge */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${relColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 700,
          color: relColor,
          flexShrink: 0,
        }}>
          {contact.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName(contact.name, contact.email)}
            </span>
            {contact.relationshipType && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: `${relColor}20`, color: relColor }}>
                {capitalize(contact.relationshipType)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#52525b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact.email} · {domain(contact.email)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12 }}>
        <Stat label="Received" value={contact.emailsReceived} />
        <Stat label="Sent" value={contact.emailsSent} />
        <Stat label="Threads" value={contact.totalThreads} />
        <Stat label="Last" value={relativeTime(contact.lastEmailAt)} isText />
      </div>

      {/* Pending items */}
      {contact.pendingCount > 0 && (
        <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠️</span>
          <span>{contact.pendingCount} item{contact.pendingCount > 1 ? 's' : ''} waiting on you</span>
        </div>
      )}

      {/* Sentiment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12 }}>
        <span>{sentiment.emoji}</span>
        <span style={{ color: sentiment.color }}>{sentiment.label}</span>
        {contact.primaryTag && (
          <>
            <span style={{ color: '#27272a' }}>·</span>
            <span style={{ color: '#52525b' }}>{contact.primaryTag}</span>
          </>
        )}
      </div>

      {/* Topics */}
      {contact.topics.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {contact.topics.slice(0, 6).map((topic) => (
            <span key={topic} style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 8,
              background: '#27272a',
              color: '#a1a1aa',
            }}>
              {topic}
            </span>
          ))}
          {contact.topics.length > 6 && (
            <span style={{ fontSize: 10, color: '#52525b', padding: '2px 4px' }}>
              +{contact.topics.length - 6}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stat({ label, value, isText }: { label: string; value: string | number; isText?: boolean }) {
  return (
    <div>
      <div style={{ color: '#52525b', marginBottom: 2, fontSize: 11 }}>{label}</div>
      <div style={{ fontWeight: isText ? 400 : 600, color: isText ? '#a1a1aa' : '#fafafa', fontFamily: isText ? 'inherit' : 'monospace' }}>
        {value}
      </div>
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
