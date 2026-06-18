// app/mails/v1/dashboard/_components/CalendarWidget.tsx
// Shows next 3 upcoming meetings in the dashboard.
// Fetches from existing /api/v1/calendar/events endpoint.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalendarEvent = {
    id: string;
    summary: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    hangoutLink?: string;
    attendees?: { email: string; displayName?: string; responseStatus: string }[];
    status: string;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const EVENT_COLORS = ['#a78bfa', '#22c55e', '#71717a', '#f59e0b', '#3b82f6', '#ef4444'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
}

function getDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hr`;
}

function toLocalKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDayHeader(d: Date): string {
  const today = new Date();
  if (toLocalKey(d) === toLocalKey(today)) return `Today, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (toLocalKey(d) === toLocalKey(tomorrow)) return `Tomorrow, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarWidget() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchEvents = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const res = await fetch(`/api/v1/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
console.log('[calendar-widget] API response keys:', Object.keys(data), 'events count:', (data.events ?? data.items ?? []).length);

// Handle both response formats
const allEvents: CalendarEvent[] = data.events ?? data.items ?? [];
console.log('[calendar-widget] first event:', JSON.stringify(allEvents[0], null, 2));
const now = new Date();
const upcoming = allEvents
  .filter((e: CalendarEvent) => {
    const eventStart = new Date(e.startTime);
    if (toLocalKey(date) === toLocalKey(now)) {
        const eventEnd = new Date(e.endTime);
        return eventEnd.getTime() > now.getTime();
      }    return true;
  })
  .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  .slice(0, 3);

      setEvents(upcoming);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(selectedDate); }, [selectedDate, fetchEvents]);

  const goDay = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    setSelectedDate(next);
  };

  return (
    <div className="rounded-xl border border-mail-border bg-mail-surface p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-mail-subtle">
          <Calendar size={14} /> Calendar
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-mail-muted font-medium">{formatDayHeader(selectedDate)}</span>
          <button onClick={() => goDay(-1)} title="Previous day"
            className="w-7 h-7 rounded-md flex items-center justify-center border border-mail-border bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => goDay(1)} title="Next day"
            className="w-7 h-7 rounded-md flex items-center justify-center border border-mail-border bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Events */}
      {loading && (
        <div className="flex items-center justify-center py-6 text-mail-subtle text-xs gap-2">
          <Loader2 size={13} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="py-6 text-center text-mail-subtle text-xs">No upcoming events</div>
      )}

      {!loading && events.length > 0 && (
        <div className="flex flex-col">
          {events.map((event, i) => {
            const startIso = event.startTime;
            const endIso = event.endTime;
            const barColor = EVENT_COLORS[i % EVENT_COLORS.length];

            return (
              <div key={event.id}
              className="flex items-center gap-3 py-2 border-t border-mail-border first:border-t-0">                {/* Time */}
                <div className="w-[72px] shrink-0 text-xs text-mail-subtle font-mono text-right">
                {!event.isAllDay ? formatEventTime(startIso) : 'All day'}                </div>

                {/* Color bar */}
                <div className="w-[3px] h-6 rounded-full shrink-0" style={{ background: barColor }} />
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-mail-text truncate">
                    {event.summary || '(No title)'}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-[11px] text-mail-subtle shrink-0">
                {!event.isAllDay ? getDuration(startIso, endIso) : ''}                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <button onClick={() => router.push('/mails/v1/calendar')}
        className="flex items-center justify-center gap-1.5 w-full mt-3 pt-3 border-t border-mail-border text-xs text-mail-accent bg-transparent border-x-0 border-b-0 cursor-pointer hover:underline">
        View full calendar <ArrowRight size={11} />
      </button>
    </div>
  );
}