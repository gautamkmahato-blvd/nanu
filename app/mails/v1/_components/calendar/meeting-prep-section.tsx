// components/calendar/meeting-prep-section.tsx
// Shows AI-enriched meeting prep cards for upcoming events.
'use client';

import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AttendeeContext = {
  email: string; name: string | null; responseStatus: string;
  emailsReceived: number; emailsSent: number; lastInteraction: string | null;
  relationshipType: string | null; sentiment: string | null;
  recentTopics: string[]; pendingItems: string[];
  relevantEmails: { subject: string; receivedAt: string; snippet: string; similarity: number }[];
};

type AiPrep = {
  briefing: string;
  talkingPoints: string[];
  openItems: string[];
  attendeeNotes: Record<string, string>;
  suggestedApproach: string;
  riskFlags: string[];
};

type PreparedEvent = {
  id: string; summary: string; startTime: string; endTime: string;
  hangoutLink: string | null; htmlLink: string | null;
  attendeePrep: AttendeeContext[]; prepSummary: string;
  aiPrep: AiPrep | null;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SENTIMENT: Record<string, { bg: string; text: string }> = {
  positive: { bg: '#22c55e20', text: '#22c55e' }, neutral: { bg: '#3b82f620', text: '#3b82f6' },
  negative: { bg: '#ef444420', text: '#ef4444' }, mixed: { bg: '#f59e0b20', text: '#f59e0b' },
};
const REL_COLORS: Record<string, string> = {
  client: '#3b82f6', colleague: '#22c55e', vendor: '#f59e0b', partner: '#a78bfa', lead: '#06b6d4', recruiter: '#ec4899',
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MeetingPrepSection() {
  const [events, setEvents] = useState<PreparedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/calendar/meeting-prep?hours=48&limit=5');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setEvents(data.events ?? []);
        // Auto-expand the first/next meeting
        if (data.events?.length > 0) setExpanded(data.events[0].id);
      } catch { /* silent — don't break calendar */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ padding: '12px 0', color: '#52525b', fontSize: 12, textAlign: 'center' }}>Loading meeting prep...</div>;
  if (events.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#fafafa' }}>🎯 Meeting Prep</h3>
        <span style={{ fontSize: 10, color: '#52525b' }}>Next 48 hours · AI-powered</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {events.map((event) => (
          <PrepCard key={event.id} event={event} isExpanded={expanded === event.id} onToggle={() => setExpanded(expanded === event.id ? null : event.id)} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prep Card
// ---------------------------------------------------------------------------

function PrepCard({ event, isExpanded, onToggle }: { event: PreparedEvent; isExpanded: boolean; onToggle: () => void }) {
  const timeUntil = getTimeUntil(event.startTime);
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  const ai = event.aiPrep;

  return (
    <div style={{ borderRadius: 10, background: '#18181b', border: '1px solid #27272a', overflow: 'hidden' }}>
      {/* Header */}
      <div onClick={onToggle} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1c1f'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>{event.summary}</span>
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: timeUntil.urgent ? '#ef444420' : '#a78bfa15', color: timeUntil.urgent ? '#ef4444' : '#a78bfa' }}>{timeUntil.label}</span>
            {ai && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#a78bfa15', color: '#a78bfa' }}>✨ AI Prep</span>}
          </div>
          <div style={{ fontSize: 11, color: '#52525b' }}>
            {fmtTime(event.startTime)} – {fmtTime(event.endTime)} · {event.attendeePrep.length} attendee{event.attendeePrep.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Avatars */}
        <div style={{ display: 'flex', marginLeft: 8 }}>
          {event.attendeePrep.slice(0, 4).map((a, i) => (
            <div key={a.email} style={{ width: 26, height: 26, borderRadius: '50%', background: '#27272a', border: '2px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#a1a1aa', marginLeft: i > 0 ? -6 : 0 }}>
              {(a.name ?? a.email).slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        <span style={{ color: '#3f3f46', fontSize: 12, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>▼</span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #27272a' }}>

          {/* AI Briefing */}
          {ai && ai.briefing && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: '#a78bfa08', border: '1px solid #a78bfa15', margin: '10px 0', fontSize: 12, color: '#d4d4d8', lineHeight: 1.5 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#a78bfa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>✨ AI Briefing</div>
              {ai.briefing}
            </div>
          )}

          {/* Talking Points */}
          {ai && ai.talkingPoints.length > 0 && (
            <div style={{ margin: '8px 0' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#52525b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>💡 Talking Points</div>
              {ai.talkingPoints.map((pt, i) => (
                <div key={i} style={{ fontSize: 11, color: '#a1a1aa', padding: '2px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>•</span><span>{pt}</span>
                </div>
              ))}
            </div>
          )}

          {/* Open Items */}
          {ai && ai.openItems.length > 0 && (
            <div style={{ margin: '8px 0' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>⚠ Open Items</div>
              {ai.openItems.map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: '#f59e0b99', padding: '2px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span><span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Risk Flags */}
          {ai && ai.riskFlags.length > 0 && (
            <div style={{ margin: '8px 0', padding: '6px 10px', borderRadius: 6, background: '#ef444408', border: '1px solid #ef444415' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>🚩 Watch Out</div>
              {ai.riskFlags.map((flag, i) => (
                <div key={i} style={{ fontSize: 11, color: '#ef444499', padding: '1px 0' }}>{flag}</div>
              ))}
            </div>
          )}

          {/* Suggested Approach */}
          {ai && ai.suggestedApproach && (
            <div style={{ margin: '8px 0', fontSize: 11, color: '#71717a' }}>
              <span style={{ fontWeight: 600, color: '#52525b' }}>Approach: </span>{ai.suggestedApproach}
            </div>
          )}

          {/* Attendees */}
          <div style={{ margin: '10px 0 0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#52525b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>👥 Attendees</div>
            {event.attendeePrep.map((a) => (
              <AttendeeRow key={a.email} attendee={a} aiNote={ai?.attendeeNotes?.[a.email] ?? null} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {event.hangoutLink && <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, background: '#3b82f6', color: '#fff', textDecoration: 'none' }}>📹 Join Meet</a>}
            {event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #27272a', color: '#71717a', textDecoration: 'none' }}>Calendar ↗</a>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendee Row
// ---------------------------------------------------------------------------

function AttendeeRow({ attendee: a, aiNote }: { attendee: AttendeeContext; aiNote: string | null }) {
  const display = a.name ?? a.email.split('@')[0];
  const hasContext = a.emailsReceived > 0 || a.emailsSent > 0;
  const sStyle = SENTIMENT[a.sentiment ?? ''] ?? SENTIMENT.neutral;
  const relColor = REL_COLORS[a.relationshipType?.toLowerCase() ?? ''] ?? '#52525b';

  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #1a1a1e' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#a1a1aa' }}>{display.slice(0, 2).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>{display}</span>
          <span style={{ fontSize: 10, color: '#3f3f46', marginLeft: 6 }}>{a.email}</span>
        </div>
        <span style={{ fontSize: 10, color: a.responseStatus === 'accepted' ? '#22c55e' : a.responseStatus === 'declined' ? '#ef4444' : '#52525b' }}>
          {a.responseStatus === 'accepted' ? '✅' : a.responseStatus === 'declined' ? '❌' : '⏳'}
        </span>
      </div>

      {/* AI note about this person */}
      {aiNote && (
        <div style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 4, fontStyle: 'italic', padding: '0 0 0 32px' }}>"{aiNote}"</div>
      )}

      {hasContext ? (
        <>
          <div style={{ padding: '0 0 0 32px', display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: a.relevantEmails.length > 0 ? 6 : 0 }}>
            {a.relationshipType && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${relColor}20`, color: relColor }}>{a.relationshipType}</span>}
            {a.sentiment && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: sStyle.bg, color: sStyle.text }}>{a.sentiment}</span>}
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#27272a', color: '#71717a' }}>↓{a.emailsReceived} ↑{a.emailsSent}</span>
            {a.lastInteraction && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#27272a', color: '#52525b' }}>{relDate(a.lastInteraction)}</span>}
          </div>

          {/* Relevant emails (RAG-powered) */}
          {a.relevantEmails.length > 0 && (
            <div style={{ padding: '0 0 0 32px' }}>
              <div style={{ fontSize: 9, color: '#52525b', fontWeight: 500, marginBottom: 3 }}>Related emails:</div>
              {a.relevantEmails.slice(0, 3).map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2, fontSize: 10 }}>
                  <span style={{ fontSize: 8, padding: '0px 4px', borderRadius: 3, background: e.similarity > 0.5 ? '#22c55e15' : '#27272a', color: e.similarity > 0.5 ? '#22c55e' : '#52525b', fontFamily: 'monospace', flexShrink: 0 }}>{(e.similarity * 100).toFixed(0)}%</span>
                  <span style={{ color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{e.subject}"</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 10, color: '#3f3f46', fontStyle: 'italic', padding: '0 0 0 32px' }}>No prior email history</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeUntil(iso: string): { label: string; urgent: boolean } {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return { label: 'Now', urgent: true };
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { label: `in ${mins}m`, urgent: mins < 15 };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { label: `in ${hrs}h`, urgent: false };
  return { label: `in ${Math.floor(hrs / 24)}d`, urgent: false };
}

function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
