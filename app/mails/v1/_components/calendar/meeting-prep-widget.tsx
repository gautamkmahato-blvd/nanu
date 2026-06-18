// components/calendar/meeting-prep-widget.tsx
// Compact widget for the calendar page. Shows meeting count + next meeting + link to full prep page.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type PrepEvent = {
  id: string;
  summary: string;
  startTime: string;
  attendeePrep: { email: string; name: string | null }[];
  prepSummary: string;
  aiPrep: { briefing: string; openItems: string[]; riskFlags: string[] } | null;
};

export default function MeetingPrepWidget() {
  const router = useRouter();
  const [events, setEvents] = useState<PrepEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/calendar/meeting-prep?hours=48&limit=5');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setEvents(data.events ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading || events.length === 0) return null;

  const next = events[0];
  const tu = timeUntil(next.startTime);
  const totalPending = events.reduce((s, e) => s + (e.aiPrep?.openItems.length ?? 0), 0);
  const totalRisks = events.reduce((s, e) => s + (e.aiPrep?.riskFlags.length ?? 0), 0);
  const totalPeople = new Set(events.flatMap((e) => e.attendeePrep.map((a) => a.email))).size;

  return (
    <div
      onClick={() => router.push('/mails/v1/meeting-prep')}
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        background: '#a78bfa08',
        border: '1px solid #a78bfa20',
        marginBottom: 14,
        cursor: 'pointer',
        transition: 'border-color 150ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a78bfa40'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#a78bfa20'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 24 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>Meeting Prep</span>
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#a78bfa20', color: '#a78bfa' }}>{events.length} meeting{events.length !== 1 ? 's' : ''}</span>
            {totalPeople > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#3b82f615', color: '#3b82f6' }}>{totalPeople} people</span>}
            {totalPending > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#f59e0b15', color: '#f59e0b' }}>{totalPending} pending</span>}
            {totalRisks > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#ef444415', color: '#ef4444' }}>{totalRisks} risks</span>}
          </div>
          <div style={{ fontSize: 11, color: '#71717a' }}>
            Next: <span style={{ color: '#d4d4d8', fontWeight: 500 }}>{next.summary}</span>
            <span style={{ color: tu.urgent ? '#ef4444' : '#a78bfa', marginLeft: 6, fontWeight: 500 }}>{tu.label}</span>
            {next.aiPrep?.briefing && (
              <span style={{ color: '#52525b' }}> · {next.aiPrep.briefing.slice(0, 60)}...</span>
            )}
          </div>
        </div>
        <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>View Prep →</span>
      </div>
    </div>
  );
}

function timeUntil(iso: string): { label: string; urgent: boolean } {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return { label: 'Now', urgent: true };
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { label: `in ${mins}m`, urgent: mins < 15 };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { label: `in ${hrs}h`, urgent: false };
  return { label: `in ${Math.floor(hrs / 24)}d`, urgent: false };
}
