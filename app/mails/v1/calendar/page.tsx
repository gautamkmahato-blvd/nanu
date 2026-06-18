// app/mails/v1/calendar/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastProvider, useToast } from '../_components/ui/ToastProvider';
import MarkdownRenderer from '../_components/ui/MarkdownRenderer';
import {
  Loader2, Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, Users, Star,
  MapPin, Link2, Video, Globe, X, ExternalLink, Copy, CheckCircle,
  LayoutList, LayoutGrid, Filter, CalendarIcon,
  Sparkles,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventAttendee = { email: string; displayName: string | null; responseStatus: string; self: boolean; organizer: boolean };
type CalendarEvent = {
  id: string; summary: string; description: string | null; location: string | null;
  status: string; htmlLink: string | null; startTime: string; endTime: string;
  isAllDay: boolean; attendees: EventAttendee[];
  organizer: { email: string; displayName: string | null; self: boolean } | null;
  hangoutLink: string | null; eventType: string; colorId: string | null;
};
type CalendarStats = { totalEvents: number; totalMeetings: number; uniqueAttendees: number; busiestDay: string; busiestDayCount: number; daysWithEvents: number };
type AttendeeOption = { email: string; name: string | null };
type ViewMode = 'week' | 'month';
type RightPanel = { mode: 'none' } | { mode: 'detail'; event: CalendarEvent } | { mode: 'create' };
type TimeFilter = 'all' | 'upcoming' | 'past' | 'tentative';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EVENT_COLORS: Record<string, string> = { '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73', '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161', '9': '#3f51b5', '10': '#0b8043', '11': '#d50000' };
const RESP_EMOJI: Record<string, { icon: string; color: string }> = { accepted: { icon: '✓', color: '#22c55e' }, declined: { icon: '✗', color: '#ef4444' }, tentative: { icon: '?', color: '#f59e0b' }, needsAction: { icon: '…', color: '#6b7280' } };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toLocalKey(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function eventLocalKey(iso: string): string { return toLocalKey(new Date(iso)); }
function getWeekStart(d: Date): Date { const r = new Date(d); r.setHours(0, 0, 0, 0); r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); return r; }
function getMonthGridStart(d: Date): Date { const first = new Date(d.getFullYear(), d.getMonth(), 1); first.setDate(first.getDate() - ((first.getDay() + 6) % 7)); return first; }
function isSameDay(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isToday(d: Date): boolean { return isSameDay(d, new Date()); }
function isPast(iso: string): boolean { return new Date(iso).getTime() < Date.now(); }
function isUpcoming(iso: string): boolean { return new Date(iso).getTime() > Date.now(); }
function fmtTime(iso: string): string { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }); }
function fmtDuration(s: string, e: string): string { const m = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000); if (m < 60) return `${m}m`; const h = Math.floor(m / 60); const r = m % 60; return r ? `${h}h ${r}m` : `${h}h`; }
function nameOf(n: string | null, e: string): string { if (n) return n; const i = e.indexOf('@'); return i > 0 ? e.slice(0, i) : e; }
function cap(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }
function eventColor(e: CalendarEvent): string { return e.colorId ? (EVENT_COLORS[e.colorId] ?? '#a78bfa') : '#a78bfa'; }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function CalendarPage() { return <ToastProvider><Content /></ToastProvider>; }

function Content() {
  const { showToast } = useToast();
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [attendeeOptions, setAttendeeOptions] = useState<AttendeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [rightPanel, setRightPanel] = useState<RightPanel>({ mode: 'none' });
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [attendeeFilter, setAttendeeFilter] = useState<string>('all');
  const [importantIds, setImportantIds] = useState<Set<string>>(new Set());
  const [eventLayout, setEventLayout] = useState<'list' | 'grid'>('list');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const toggleImportant = (id: string) => { setImportantIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };

  // Close date picker on outside click
  useEffect(() => {
    if (!showDatePicker) return;
    const handler = (e: MouseEvent) => { if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) setShowDatePicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDatePicker]);

  const fetchedRange = useRef('');
  const load = useCallback(async () => {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 2, 0);
    const rangeKey = `${start.toISOString()}-${end.toISOString()}`;
    if (rangeKey === fetchedRange.current && allEvents.length > 0) return;
    fetchedRange.current = rangeKey;
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/v1/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const data = await res.json();
      setAllEvents(data.events); setStats(data.stats); setAttendeeOptions(data.attendeesList ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, [anchor.getFullYear(), anchor.getMonth()]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let r = allEvents;
    if (timeFilter === 'upcoming') r = r.filter((e) => isUpcoming(e.startTime));
    else if (timeFilter === 'past') r = r.filter((e) => isPast(e.endTime));
    else if (timeFilter === 'tentative') r = r.filter((e) => e.status === 'tentative');
    if (attendeeFilter !== 'all') r = r.filter((e) => e.attendees.some((a) => a.email === attendeeFilter));
    return r;
  }, [allEvents, timeFilter, attendeeFilter]);

  const byDay = useMemo(() => { const m: Record<string, CalendarEvent[]> = {}; for (const e of filtered) { const k = eventLocalKey(e.startTime); if (!m[k]) m[k] = []; m[k].push(e); } return m; }, [filtered]);
  const dayEvents = useMemo(() => byDay[toLocalKey(selectedDay)] ?? [], [byDay, selectedDay]);

  const goPrev = () => { const d = new Date(anchor); if (viewMode === 'month') d.setMonth(d.getMonth() - 1); else d.setDate(d.getDate() - 7); setAnchor(d); setSelectedDay(d); };
  const goNext = () => { const d = new Date(anchor); if (viewMode === 'month') d.setMonth(d.getMonth() + 1); else d.setDate(d.getDate() + 7); setAnchor(d); setSelectedDay(d); };
  const goToday = () => { setAnchor(new Date()); setSelectedDay(new Date()); };

  const weekStart = getWeekStart(anchor);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const monthGridStart = getMonthGridStart(anchor);
  const monthDays = Array.from({ length: 42 }, (_, i) => { const d = new Date(monthGridStart); d.setDate(d.getDate() + i); return d; });

  const periodLabel = viewMode === 'week'
    ? `${MONTH_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_SHORT[new Date(weekStart.getTime() + 6 * 86400000).getMonth()]} ${new Date(weekStart.getTime() + 6 * 86400000).getDate()}, ${anchor.getFullYear()}`
    : `${MONTH_FULL[anchor.getMonth()]} ${anchor.getFullYear()}`;

  // Date picker
  const pickerFirst = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const pickerOffset = (pickerFirst.getDay() + 6) % 7;
  const pickerDaysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();

  return (
    <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-mail-border shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-mail-accent" />
              <h1 className="text-lg font-semibold m-0">Calendar</h1>
            </div>
            <p className="text-xs text-mail-subtle mt-0.5 m-0">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setRightPanel({ mode: 'create' })} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-medium cursor-pointer transition-colors">
              <Plus size={14} /> Create Event
            </button>
            <div className="flex rounded-lg border border-mail-border overflow-hidden ml-2">
              {(['week', 'month'] as ViewMode[]).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 border-none text-xs cursor-pointer capitalize transition-colors ${viewMode === m ? 'bg-mail-accent-soft text-mail-accent font-semibold' : 'bg-transparent text-mail-subtle hover:text-mail-muted'}`}>{m}</button>
              ))}
            </div>
            <button onClick={goPrev} title="Previous" className="p-1.5 rounded-md border border-mail-border bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer"><ChevronLeft size={14} /></button>
            <button onClick={goNext} title="Next" className="p-1.5 rounded-md border border-mail-border bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer"><ChevronRight size={14} /></button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-md border border-mail-accent/30 bg-mail-accent-soft text-mail-accent text-xs font-medium cursor-pointer hover:bg-mail-accent/15 transition-colors">Today</button>

            {/* Date picker */}
            <div className="relative" ref={datePickerRef}>
              <button onClick={() => setShowDatePicker(!showDatePicker)} title="Pick date" className="p-1.5 rounded-md border border-mail-border bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer">
                <CalendarIcon size={14} />
              </button>
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-1.5 bg-mail-surface border border-mail-border rounded-xl p-3 z-50 shadow-2xl w-[240px]">
                  <div className="flex justify-between items-center mb-2">
                    <button onClick={() => setAnchor((p) => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d; })} className="p-1 rounded text-mail-subtle hover:text-mail-muted hover:bg-mail-hover cursor-pointer border-none bg-transparent"><ChevronLeft size={14} /></button>
                    <span className="text-xs font-semibold text-mail-text">{MONTH_SHORT[anchor.getMonth()]} {anchor.getFullYear()}</span>
                    <button onClick={() => setAnchor((p) => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d; })} className="p-1 rounded text-mail-subtle hover:text-mail-muted hover:bg-mail-hover cursor-pointer border-none bg-transparent"><ChevronRight size={14} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {DAY_NAMES.map((n) => <div key={n} className="text-[9px] text-mail-subtle p-1 font-semibold">{n}</div>)}
                    {Array.from({ length: pickerOffset }).map((_, i) => <div key={`e${i}`} />)}
                    {Array.from({ length: pickerDaysInMonth }).map((_, i) => {
                      const d = i + 1; const date = new Date(anchor.getFullYear(), anchor.getMonth(), d);
                      const sel = isSameDay(date, selectedDay); const tod = isToday(date);
                      return (
                        <button key={d} onClick={() => { setSelectedDay(date); setAnchor(date); setShowDatePicker(false); }}
                          className={`w-7 h-7 rounded-full border-none text-xs cursor-pointer transition-colors ${sel ? 'bg-mail-accent text-white font-bold' : tod ? 'bg-mail-accent-soft text-mail-accent font-bold' : 'bg-transparent text-mail-muted hover:bg-mail-hover'}`}>{d}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats + Filters */}
        <div className="flex items-center gap-2">
          {stats && stats.totalEvents > 0 && (
            <>
              <StatBadge icon={CalendarDays} label="Events" value={stats.totalEvents} color="#a78bfa" />
              <StatBadge icon={Users} label="Meetings" value={stats.totalMeetings} color="#3b82f6" />
              <StatBadge icon={Users} label="People" value={stats.uniqueAttendees} color="#22c55e" />
            </>
          )}
          <div className="flex-1" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-2.5 py-1.5 rounded-lg border border-mail-border bg-mail-surface text-mail-muted text-xs outline-none cursor-pointer">
            <option value="all">All Events</option><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="tentative">Tentative</option>
          </select>
          <select value={attendeeFilter} onChange={(e) => setAttendeeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-mail-border bg-mail-surface text-mail-muted text-xs outline-none cursor-pointer">
            <option value="all">All People</option>
            {attendeeOptions.map((a) => <option key={a.email} value={a.email}>{a.name ?? a.email}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="px-6 py-2 text-red-400 text-[13px]">{error}</div>}

      {/* Main */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto sidebar-scroll px-6 py-4">
          {/* WEEK VIEW */}
          {viewMode === 'week' && (
            <>
              <div className="flex gap-1.5 mb-4">
                {weekDays.map((day) => {
                  const key = toLocalKey(day); const sel = isSameDay(day, selectedDay); const tod = isToday(day); const cnt = (byDay[key] ?? []).length;
                  return (
                    <button key={key} onClick={() => setSelectedDay(day)}
                      className={`flex-1 py-2 rounded-xl text-center cursor-pointer border transition-colors ${sel ? 'border-mail-accent bg-mail-accent-soft' : tod ? 'border-mail-border bg-mail-surface' : 'border-transparent bg-transparent hover:bg-mail-hover'}`}>
                      <div className={`text-[10px] font-medium mb-1 ${tod ? 'text-mail-accent' : 'text-mail-subtle'}`}>{DAY_NAMES[(day.getDay() + 6) % 7]}</div>
                      <div className={`text-lg font-semibold ${sel ? 'text-mail-accent' : tod ? 'text-mail-text' : 'text-mail-muted'}`}>{day.getDate()}</div>
                      {cnt > 0 && <div className="flex justify-center gap-1 mt-1">{Array.from({ length: Math.min(cnt, 3) }).map((_, i) => <span key={i} className="w-1 h-1 rounded-full" style={{ background: sel ? 'var(--mail-accent)' : 'var(--mail-subtle)' }} />)}</div>}
                    </button>
                  );
                })}
              </div>
              <DayHeader day={selectedDay} count={dayEvents.length} layout={eventLayout} onLayoutChange={setEventLayout} />
              <EventList events={dayEvents} loading={loading} layout={eventLayout} importantIds={importantIds} onToggleImportant={toggleImportant} onSelect={(e) => setRightPanel({ mode: 'detail', event: e })} />
            </>
          )}

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <>
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAY_NAMES.map((n) => <div key={n} className="py-1 text-center text-[11px] text-mail-subtle font-semibold">{n}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {monthDays.map((day, idx) => {
                  const key = toLocalKey(day); const cur = day.getMonth() === anchor.getMonth(); const tod = isToday(day); const sel = isSameDay(day, selectedDay); const evts = byDay[key] ?? [];
                  return (
                    <div key={idx} onClick={() => setSelectedDay(day)}
                      className={`min-h-[74px] p-1 rounded-md cursor-pointer border transition-colors ${sel ? 'border-mail-accent bg-mail-accent-soft' : 'border-transparent hover:bg-mail-hover'}`}
                      style={{ opacity: cur ? 1 : 0.25 }}>
                      <div className={`text-xs mb-1 w-6 h-6 rounded-full flex items-center justify-center ${tod ? 'bg-mail-accent-soft text-mail-accent font-bold' : 'text-mail-muted'}`}>{day.getDate()}</div>
                      {evts.slice(0, 2).map((evt) => { const c = eventColor(evt); return <div key={evt.id} className="text-[9px] px-1 py-px rounded mb-px truncate" style={{ background: `${c}25`, color: c }}>{!evt.isAllDay && fmtTime(evt.startTime).replace(/\s/g, '') + ' '}{evt.summary}</div>; })}
                      {evts.length > 2 && <div className="text-[8px] text-mail-subtle pl-1">+{evts.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <DayHeader day={selectedDay} count={dayEvents.length} layout={eventLayout} onLayoutChange={setEventLayout} />
                <EventList events={dayEvents} loading={loading} layout={eventLayout} importantIds={importantIds} onToggleImportant={toggleImportant} onSelect={(e) => setRightPanel({ mode: 'detail', event: e })} />
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        {rightPanel.mode !== 'none' && (
          <div className="w-[360px] shrink-0 border-l border-mail-border overflow-y-auto sidebar-scroll bg-mail-bg">
            {rightPanel.mode === 'detail' && <DetailPanel event={rightPanel.event} isImportant={importantIds.has(rightPanel.event.id)} onToggleImportant={toggleImportant} onClose={() => setRightPanel({ mode: 'none' })} />}
            {rightPanel.mode === 'create' && <CreatePanel onClose={() => setRightPanel({ mode: 'none' })} onCreated={() => { fetchedRange.current = ''; load(); showToast('Event created', 'success'); setRightPanel({ mode: 'none' }); }} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day header + Event list
// ---------------------------------------------------------------------------

function DayHeader({ day, count, layout, onLayoutChange }: { day: Date; count: number; layout: 'list' | 'grid'; onLayoutChange: (l: 'list' | 'grid') => void }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[15px] font-semibold m-0">{DAY_FULL[(day.getDay() + 6) % 7]}, {MONTH_FULL[day.getMonth()]} {day.getDate()}</h2>
      {isToday(day) && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">Today</span>}
      <span className="text-xs text-mail-subtle">{count} event{count !== 1 ? 's' : ''}</span>
      <div className="flex-1" />
      <div className="flex rounded-md border border-mail-border overflow-hidden">
        <button onClick={() => onLayoutChange('list')} className={`p-1.5 border-none cursor-pointer transition-colors ${layout === 'list' ? 'bg-mail-hover text-mail-text' : 'bg-transparent text-mail-subtle'}`}><LayoutList size={13} /></button>
        <button onClick={() => onLayoutChange('grid')} className={`p-1.5 border-none cursor-pointer transition-colors ${layout === 'grid' ? 'bg-mail-hover text-mail-text' : 'bg-transparent text-mail-subtle'}`}><LayoutGrid size={13} /></button>
      </div>
    </div>
  );
}

function EventList({ events, loading, layout, importantIds, onToggleImportant, onSelect }: {
  events: CalendarEvent[]; loading: boolean; layout: 'list' | 'grid';
  importantIds: Set<string>; onToggleImportant: (id: string) => void; onSelect: (e: CalendarEvent) => void;
}) {
  if (loading) return <div className="py-8 text-center text-mail-subtle text-[13px] flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</div>;
  if (events.length === 0) return <div className="py-8 text-center text-mail-subtle text-[13px]">No events scheduled</div>;
  return (
    <div className={layout === 'grid' ? 'grid gap-2' : ''} style={layout === 'grid' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' } : undefined}>
      {events.map((e) => <EventRow key={e.id} event={e} isImportant={importantIds.has(e.id)} onToggleImportant={onToggleImportant} onSelect={() => onSelect(e)} />)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event row
// ---------------------------------------------------------------------------

function EventRow({ event, isImportant, onToggleImportant, onSelect }: { event: CalendarEvent; isImportant: boolean; onToggleImportant: (id: string) => void; onSelect: () => void }) {
  const c = eventColor(event); const ext = event.attendees.filter((a) => !a.self); const past = isPast(event.endTime);
  return (
    <div onClick={onSelect}
      className="flex items-start gap-3 p-3 rounded-xl border border-mail-border bg-mail-surface mb-1.5 cursor-pointer hover:border-mail-subtle transition-colors group"
      style={{ borderLeftWidth: 3, borderLeftColor: c, opacity: past ? 0.5 : 1 }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {event.isAllDay ? <span className="text-xs font-medium" style={{ color: c }}>All Day</span> : (
            <>
              <span className="text-xs font-semibold text-mail-text font-mono">{fmtTime(event.startTime)}</span>
              <span className="text-[10px] text-mail-subtle">→</span>
              <span className="text-xs text-mail-subtle font-mono">{fmtTime(event.endTime)}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-mail-chip text-mail-subtle">{fmtDuration(event.startTime, event.endTime)}</span>
            </>
          )}
          {event.status === 'tentative' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">Tentative</span>}
          {past && <span className="text-[9px] px-1.5 py-0.5 rounded bg-mail-chip text-mail-subtle">Past</span>}
        </div>
        <div className="text-[14px] font-medium text-mail-text mb-1">{event.summary}</div>
        <div className="flex items-center gap-3 text-[11px] text-mail-subtle">
          {event.location && <span className="flex items-center gap-1"><MapPin size={10} /> {event.location}</span>}
          {event.hangoutLink && <span className="flex items-center gap-1 text-blue-400"><Video size={10} /> Meet</span>}
          {ext.length > 0 && <span className="flex items-center gap-1"><Users size={10} /> {ext.length}</span>}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggleImportant(event.id); }} title={isImportant ? 'Remove star' : 'Star'}
        className={`p-1 rounded transition-colors cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100 ${isImportant ? '!opacity-100' : ''}`}>
        <Star size={14} className={isImportant ? 'text-yellow-400 fill-yellow-400' : 'text-mail-subtle hover:text-yellow-400'} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DetailPanel({ event, isImportant, onToggleImportant, onClose }: { event: CalendarEvent; isImportant: boolean; onToggleImportant: (id: string) => void; onClose: () => void }) {
  const c = eventColor(event); const ext = event.attendees.filter((a) => !a.self);
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-mail-subtle">Event Details</span>
        <button onClick={onClose} className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent"><X size={15} /></button>
      </div>
      <div className="w-full h-1 rounded-full mb-4" style={{ background: c }} />
      <h3 className="text-[17px] font-semibold m-0 mb-3">{event.summary}</h3>

      <div className="flex flex-col gap-2 text-[13px] text-mail-muted mb-4">
        <div className="flex items-center gap-2"><CalendarDays size={14} className="text-mail-subtle" />{new Date(event.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div className="flex items-center gap-2"><Clock size={14} className="text-mail-subtle" />{event.isAllDay ? 'All Day' : `${fmtTime(event.startTime)} – ${fmtTime(event.endTime)} (${fmtDuration(event.startTime, event.endTime)})`}</div>
        {event.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-mail-subtle" />{event.location}</div>}
        {event.hangoutLink && <div className="flex items-center gap-2"><Video size={14} className="text-blue-400" /><a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 no-underline hover:underline">Join Google Meet</a></div>}
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        <span className="text-[11px] px-2.5 py-1 rounded-md" style={{ background: event.status === 'tentative' ? '#f59e0b15' : '#22c55e15', color: event.status === 'tentative' ? '#f59e0b' : '#22c55e' }}>{cap(event.status)}</span>
        {isPast(event.endTime) && <span className="text-[11px] px-2.5 py-1 rounded-md bg-mail-chip text-mail-subtle">Completed</span>}
        <button onClick={() => onToggleImportant(event.id)} className={`text-[11px] px-2.5 py-1 rounded-md border-none cursor-pointer transition-colors ${isImportant ? 'bg-yellow-500/15 text-yellow-400' : 'bg-mail-chip text-mail-subtle hover:text-yellow-400'}`}>
          {isImportant ? '★ Important' : '☆ Star'}
        </button>
      </div>

      {event.description && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2">Description</div>
          <div className="text-[13px] text-mail-muted leading-relaxed"><MarkdownRenderer content={event.description} /></div>
        </div>
      )}

      {ext.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2">Attendees ({ext.length})</div>
          {ext.map((a) => {
            const resp = RESP_EMOJI[a.responseStatus] ?? RESP_EMOJI.needsAction;
            return (
              <div key={a.email} className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-mail-hover flex items-center justify-center text-[10px] font-bold text-mail-muted shrink-0">{nameOf(a.displayName, a.email).slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-mail-text truncate">{nameOf(a.displayName, a.email)}</div>
                  <div className="text-[11px] text-mail-subtle truncate">{a.email}</div>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: resp.color }}>{resp.icon}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-mail-border text-mail-muted no-underline hover:bg-mail-hover transition-colors"><ExternalLink size={12} /> Open in Calendar</a>}
        {event.hangoutLink && <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border-none bg-blue-500 text-white no-underline hover:bg-blue-600 transition-colors"><Video size={12} /> Join Meet</a>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create panel
// ---------------------------------------------------------------------------

function CreatePanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toLocalKey(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [attendees, setAttendees] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingType, setMeetingType] = useState<'none' | 'meet' | 'zoom' | 'custom'>('none');
  const [customLink, setCustomLink] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [zoomLoading, setZoomLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [descLoading, setDescLoading] = useState(false);

  const generateZoom = async () => {
    setZoomLoading(true); setErr('');
    try {
      const res = await fetch('/api/v1/calendar/zoom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: title || 'Meeting', duration: 60 }) });
      const data = await res.json();
      if (!res.ok) { if (data.fallback) { setErr('Zoom not configured.'); setMeetingType('custom'); } else throw new Error(data.error ?? 'Failed'); return; }
      setZoomLink(data.joinUrl);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setZoomLoading(false); }
  };

  const handleCreate = async () => {
    if (!title.trim()) { setErr('Title required'); return; }
    setSaving(true); setErr('');
    try {
      const startDT = `${date}T${startTime}:00`; const endDT = `${date}T${endTime}:00`;
      const emails = attendees.split(',').map((s) => s.trim()).filter(Boolean);
      const payload: Record<string, unknown> = { summary: title.trim(), startDateTime: startDT, endDateTime: endDT, attendeeEmails: emails, meetingType };
      if (description) payload.description = description;
      if (meetingType === 'zoom' && zoomLink) payload.zoomLink = zoomLink;
      if (meetingType === 'custom' && customLink) payload.location = customLink;
      if (meetingType === 'none' && location) payload.location = location;
      const res = await fetch('/api/v1/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const data = await res.json();
      if (data.meetLink) { setSuccess(data.meetLink); setTimeout(onCreated, 2000); return; }
      onCreated();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const generateDescription = async () => {
    setDescLoading(true);
    try {
      const emails = attendees.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/v1/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a brief meeting agenda for: "${title || 'Meeting'}". Attendees: ${emails.length > 0 ? emails.join(', ') : 'TBD'}. Include purpose, discussion points, and action items. Keep it concise.`,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDescription(data.message ?? '');
    } catch {
      setDescription('Failed to generate.');
    } finally {
      setDescLoading(false);
    }
  };

  const meetOpts: { key: typeof meetingType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'none', label: 'No Link', icon: X, color: '#6b7280' },
    { key: 'meet', label: 'Google Meet', icon: Video, color: '#22c55e' },
    { key: 'zoom', label: 'Zoom', icon: Globe, color: '#2d8cf0' },
    { key: 'custom', label: 'Custom URL', icon: Link2, color: '#a78bfa' },
  ];

  if (success) return (
    <div className="p-6 text-center">
      <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-green-400 m-0 mb-2">Event Created!</h3>
      <a href={success} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 break-all">{success}</a>
      <button onClick={() => navigator.clipboard.writeText(success)} className="flex items-center gap-1.5 mx-auto mt-3 px-3 py-1.5 rounded-md border border-mail-border bg-transparent text-mail-muted text-[11px] cursor-pointer hover:bg-mail-hover transition-colors"><Copy size={12} /> Copy Link</button>
    </div>
  );

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs font-bold text-mail-accent uppercase tracking-wider">Create Event</span>
        <button onClick={onClose} className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent"><X size={15} /></button>
      </div>

      <div className="flex flex-col gap-3.5">
        <div>
          <Label>Title</Label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title..." autoFocus className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none focus:border-mail-accent/40 transition-colors" />
        </div>
        <div>
          <Label>Date</Label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none focus:border-mail-accent/40 transition-colors" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1"><Label>Start</Label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none" /></div>
          <div className="flex-1"><Label>End</Label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none" /></div>
        </div>
        <div>
          <Label>Participants</Label>
          <input value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="email1, email2" className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none" />
        </div>
        <div>
          <Label>Meeting Link</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {meetOpts.map((opt) => { const Icon = opt.icon; const sel = meetingType === opt.key; return (
              <button key={opt.key} onClick={() => { setMeetingType(opt.key); setErr(''); }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium cursor-pointer border transition-colors"
                style={{ borderColor: sel ? opt.color : 'var(--mail-border)', background: sel ? `${opt.color}12` : 'transparent', color: sel ? opt.color : 'var(--mail-subtle)' }}>
                <Icon size={12} /> {opt.label}
              </button>
            ); })}
          </div>
          {meetingType === 'meet' && <div className="flex items-center gap-1.5 mt-2 text-[10px] text-green-400"><Video size={10} /> Auto-generated on create</div>}
          {meetingType === 'zoom' && !zoomLink && <button onClick={generateZoom} disabled={zoomLoading} className="w-full mt-2 py-2 rounded-lg border text-[11px] cursor-pointer transition-colors" style={{ borderColor: '#2d8cf030', background: '#2d8cf008', color: '#2d8cf0' }}>{zoomLoading ? 'Creating...' : 'Generate Zoom Link'}</button>}
          {meetingType === 'zoom' && zoomLink && <div className="mt-2 text-[10px] text-blue-400 truncate">✅ {zoomLink}</div>}
          {meetingType === 'custom' && <input value={customLink} onChange={(e) => setCustomLink(e.target.value)} placeholder="https://..." className="w-full mt-2 px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none" />}
        </div>
        {meetingType === 'none' && <div><Label>Location</Label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office or room" className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none" /></div>}
        <div>
        {/* <button onClick={generateDescription} disabled={descLoading}
          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-mail-accent/20 bg-mail-accent-soft text-mail-accent cursor-pointer hover:bg-mail-accent/15 transition-colors disabled:opacity-60">
          <Sparkles size={10} /> {descLoading ? 'Generating...' : 'AI Generate'}
        </button> */}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add notes..." rows={3} className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] outline-none resize-y font-[inherit]" />
        </div>
      </div>

      {err && <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-[11px] text-red-400">{err}</div>}

      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-subtle text-xs cursor-pointer hover:bg-mail-hover transition-colors">Cancel</button>
        <button onClick={handleCreate} disabled={saving || !title.trim()}
          className={`flex-1 py-2.5 rounded-lg border-none text-xs font-semibold cursor-pointer transition-all ${title.trim() ? 'bg-mail-accent hover:bg-mail-accent-hover text-white' : 'bg-mail-chip text-mail-subtle cursor-default'} disabled:opacity-60`}>
          {saving ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-mail-border bg-mail-surface">
      <span className="text-[10px] text-mail-subtle font-medium">{label}</span>
      <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-mail-subtle mb-1.5">{children}</label>;
}