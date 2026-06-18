// components/email-actions/schedule-meeting-panel.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays, X, Mail, Clock, Video, Globe, Link2, Sparkles,
  CheckCircle, Copy, ArrowLeft, Loader2, Users, FileText,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FreeSlot = { start: string; end: string };

type Props = {
  emailId: string;
  senderEmail: string;
  senderName: string | null;
  subject: string | null;
  onClose: () => void;
  onScheduled?: () => void;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DURATIONS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MEETING_OPTIONS: { key: 'none' | 'meet' | 'zoom' | 'custom'; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'none', label: 'No Link', icon: X, color: '#52525b' },
  { key: 'meet', label: 'Meet', icon: Video, color: '#22c55e' },
  { key: 'zoom', label: 'Zoom', icon: Globe, color: '#2d8cf0' },
  { key: 'custom', label: 'URL', icon: Link2, color: '#a78bfa' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayLabel(d: Date): string {
  if (isToday(d)) return 'Today';
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  if (isSameDay(d, tm)) return 'Tomorrow';
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function chunkSlots(freeSlots: FreeSlot[], durationMin: number, selectedDate: Date): { start: Date; end: Date }[] {
  const chunks: { start: Date; end: Date }[] = [];
  const now = new Date();
  for (const slot of freeSlots) {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    if (!isSameDay(slotStart, selectedDate)) continue;
    let cursor = slotStart;
    if (cursor < now && isSameDay(cursor, now)) {
      const m = now.getMinutes();
      cursor = new Date(now);
      cursor.setMinutes(Math.ceil(m / 15) * 15, 0, 0);
    }
    while (cursor.getTime() + durationMin * 60000 <= slotEnd.getTime()) {
      chunks.push({ start: new Date(cursor), end: new Date(cursor.getTime() + durationMin * 60000) });
      cursor = new Date(cursor.getTime() + 15 * 60000);
    }
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScheduleMeetingPanel({ emailId, senderEmail, senderName, subject, onClose, onScheduled }: Props) {
  const [title, setTitle] = useState(`Re: ${subject ?? '(no subject)'}`);
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState<'none' | 'meet' | 'zoom' | 'custom'>('meet');
  const [customLink, setCustomLink] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [zoomLoading, setZoomLoading] = useState(false);
  const [extraAttendees, setExtraAttendees] = useState('');
  const [description, setDescription] = useState('');
  const [descLoading, setDescLoading] = useState(false);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [success, setSuccess] = useState<{ meetLink?: string } | null>(null);

  const days: Date[] = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (days.length < 5) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const fetchAvailability = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 7);
      const res = await fetch(`/api/v1/calendar/availability?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setFreeSlots(data.free ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);
  useEffect(() => { setSelectedSlot(null); }, [selectedDate, duration]);

  const availableChunks = chunkSlots(freeSlots, duration, selectedDate);

  const generateDescription = async () => {
    setDescLoading(true);
    try {
      const res = await fetch('/api/v1/calendar/generate-description', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailId }) });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDescription(data.description ?? '');
    } catch { setDescription('Failed to generate.'); }
    finally { setDescLoading(false); }
  };

  const generateZoomLink = async () => {
    setZoomLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/calendar/zoom', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: title || 'Meeting', duration: 60 }) });
      const data = await res.json();
      if (!res.ok) { if (data.fallback) { setError('Zoom not configured.'); setMeetingType('custom'); } else throw new Error(data.error ?? 'Failed'); return; }
      setZoomLink(data.joinUrl);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setZoomLoading(false); }
  };

  const handleSchedule = async () => {
    if (!selectedSlot) return;
    setScheduling(true); setError('');
    try {
      const allAttendees = [senderEmail, ...extraAttendees.split(',').map((s) => s.trim()).filter((s) => s.includes('@'))];
      const resolvedMeetLink = meetingType === 'zoom' ? zoomLink : meetingType === 'custom' ? customLink : undefined;
      const resolvedMeetType = meetingType === 'meet' ? 'Google Meet' : meetingType === 'zoom' ? 'Zoom' : meetingType === 'custom' ? 'Custom' : undefined;

      const eventPayload: Record<string, unknown> = {
        summary: title.trim() || `Meeting with ${senderName ?? senderEmail}`,
        startDateTime: selectedSlot.start.toISOString(), endDateTime: selectedSlot.end.toISOString(),
        attendeeEmails: allAttendees, meetingType, description: description || undefined, skipNotification: true,
      };
      if (meetingType === 'zoom' && zoomLink) eventPayload.zoomLink = zoomLink;
      if (meetingType === 'custom' && customLink) eventPayload.location = customLink;

      const eventRes = await fetch('/api/v1/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventPayload) });
      if (!eventRes.ok) throw new Error((await eventRes.json().catch(() => ({}))).error ?? 'Failed');
      const eventData = await eventRes.json();
      const finalMeetLink = eventData.meetLink ?? resolvedMeetLink;

      await fetch('/api/v1/calendar/send-invitation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: allAttendees, title: title.trim() || `Meeting with ${senderName ?? senderEmail}`, startTime: selectedSlot.start.toISOString(), endTime: selectedSlot.end.toISOString(), meetLink: finalMeetLink, meetType: resolvedMeetType, description: description || undefined, attendees: allAttendees }),
      }).catch(() => {});

      setSuccess({ meetLink: finalMeetLink });
      onScheduled?.();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setScheduling(false); }
  };

  const senderDisplay = senderName ?? senderEmail.split('@')[0];

  // ── Success ──
  if (success) {
    return (
      <div className="p-6 flex flex-col items-center text-center">
        <CheckCircle size={40} className="text-green-400 mb-3" />
        <h3 className="text-base font-semibold text-green-400 m-0 mb-1">Meeting Scheduled!</h3>
        <p className="text-xs text-mail-subtle m-0 mb-1">Invitation sent to {senderDisplay}</p>
        {selectedSlot && (
          <p className="text-xs text-mail-subtle m-0">
            {dayLabel(selectedSlot.start)} · {fmtTime(selectedSlot.start.toISOString())} – {fmtTime(selectedSlot.end.toISOString())}
          </p>
        )}
        {success.meetLink && (
          <div className="mt-3">
            <a href={success.meetLink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 break-all">{success.meetLink}</a>
            <button onClick={() => navigator.clipboard.writeText(success.meetLink!)}
              className="mt-2 flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-md border border-mail-border bg-transparent text-mail-muted text-[11px] cursor-pointer hover:bg-mail-hover transition-colors">
              <Copy size={12} /> Copy Link
            </button>
          </div>
        )}
        <button onClick={onClose} className="mt-5 px-5 py-2 rounded-lg border-none bg-mail-accent text-white text-xs font-medium cursor-pointer hover:bg-mail-accent-hover transition-colors">
          <ArrowLeft size={13} className="inline mr-1.5" />Back to Panel
        </button>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-semibold m-0 flex items-center gap-2">
          <CalendarDays size={16} className="text-mail-accent" /> Schedule Meeting
        </h2>
        <button onClick={onClose} title="Close" className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
          <X size={16} />
        </button>
      </div>

      {/* Context */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mail-accent-soft border border-mail-accent/10 mb-5 text-[11px] text-mail-subtle">
        <Mail size={12} />
        <span className="truncate">{subject ?? '(no subject)'}</span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <Label>Title</Label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none focus:border-mail-accent/50 transition-colors" />
      </div>

      {/* Duration */}
      <div className="mb-4">
        <Label>Duration</Label>
        <div className="flex gap-1.5">
          {DURATIONS.map((dur) => (
            <button key={dur.value} onClick={() => setDuration(dur.value)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition-colors border ${
                duration === dur.value
                  ? 'border-mail-accent bg-mail-accent-soft text-mail-accent font-semibold'
                  : 'border-mail-border bg-transparent text-mail-subtle hover:bg-mail-hover'
              }`}>
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting type */}
      <div className="mb-4">
        <Label>Meeting Link</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {MEETING_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const sel = meetingType === opt.key;
            return (
              <button key={opt.key} onClick={() => { setMeetingType(opt.key); setError(''); }}
                className="flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium cursor-pointer transition-colors border"
                style={{ borderColor: sel ? opt.color : 'var(--mail-border)', background: sel ? `${opt.color}12` : 'transparent', color: sel ? opt.color : 'var(--mail-subtle)' }}>
                <Icon size={12} /><span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {meetingType === 'meet' && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-green-400">
            <Video size={10} /> Auto-generated on create
          </div>
        )}
        {meetingType === 'zoom' && (
          <div className="mt-2">
            {zoomLink ? (
              <div className="text-[10px] text-blue-400 truncate">✅ {zoomLink.slice(0, 40)}...</div>
            ) : (
              <button onClick={generateZoomLink} disabled={zoomLoading}
                className="w-full py-1.5 rounded-md border text-[10px] cursor-pointer transition-colors disabled:opacity-60"
                style={{ borderColor: '#2d8cf030', background: '#2d8cf008', color: '#2d8cf0' }}>
                {zoomLoading ? 'Creating...' : 'Generate Zoom Link'}
              </button>
            )}
          </div>
        )}
        {meetingType === 'custom' && (
          <input value={customLink} onChange={(e) => setCustomLink(e.target.value)} placeholder="https://..."
            className="w-full mt-2 px-3 py-1.5 rounded-md border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none" />
        )}
      </div>

      {/* Days */}
      <div className="mb-4">
        <Label>Pick a Day</Label>
        <div className="flex gap-1.5">
          {days.map((day) => {
            const sel = isSameDay(day, selectedDate);
            const tod = isToday(day);
            return (
              <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-colors border ${
                  sel ? 'border-mail-accent bg-mail-accent-soft' : 'border-mail-border bg-transparent hover:bg-mail-hover'
                }`}>
                <div className={`text-[9px] font-medium ${tod ? 'text-mail-accent' : 'text-mail-subtle'}`}>{DAY_NAMES[day.getDay()]}</div>
                <div className={`text-sm font-semibold ${sel ? 'text-mail-accent' : 'text-mail-muted'}`}>{day.getDate()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="mb-4">
        <Label>Available · {dayLabel(selectedDate)}</Label>
        {loading && (
          <div className="py-4 text-center text-mail-subtle text-[11px] flex items-center justify-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Loading...
          </div>
        )}
        {!loading && availableChunks.length === 0 && (
          <div className="py-4 text-center text-mail-subtle text-[11px]">No slots available</div>
        )}
        {!loading && availableChunks.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto sidebar-scroll">
            {availableChunks.map((chunk, i) => {
              const sel = selectedSlot && chunk.start.getTime() === selectedSlot.start.getTime();
              return (
                <button key={i} onClick={() => setSelectedSlot(chunk)}
                  className={`py-2 rounded-lg text-[10px] font-mono cursor-pointer transition-all border ${
                    sel
                      ? 'border-mail-accent bg-mail-accent text-white font-semibold'
                      : 'border-mail-border bg-mail-bg text-mail-muted hover:bg-mail-hover'
                  }`}>
                  {fmtTime(chunk.start.toISOString())}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendees */}
      <div className="mb-4">
        <Label>Attendees</Label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mail-bg border border-mail-border mb-2 text-[11px]">
          <div className="w-6 h-6 rounded-full bg-mail-hover flex items-center justify-center text-[9px] font-bold text-mail-muted shrink-0">
            {senderDisplay.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-mail-text font-medium">{senderDisplay}</span>
          <span className="text-mail-subtle text-[10px]">{senderEmail}</span>
        </div>
        <input value={extraAttendees} onChange={(e) => setExtraAttendees(e.target.value)} placeholder="Add more: email1, email2"
          className="w-full px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none focus:border-mail-accent/50 transition-colors" />
      </div>

      {/* Description */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <Label noMargin>Description</Label>
          <button onClick={generateDescription} disabled={descLoading}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-mail-accent/20 bg-mail-accent-soft text-mail-accent cursor-pointer hover:bg-mail-accent/15 transition-colors disabled:opacity-60">
            <Sparkles size={10} /> {descLoading ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Meeting agenda..." rows={3}
          className="w-full px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none resize-y font-[inherit] focus:border-mail-accent/50 transition-colors" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-[10px] text-red-400">{error}</div>
      )}

      {/* Selected slot preview */}
      {selectedSlot && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-mail-accent-soft border border-mail-accent/15 mb-4 text-[11px]">
          <Clock size={12} className="text-mail-accent shrink-0" />
          <span className="text-mail-accent font-semibold">{dayLabel(selectedSlot.start)}</span>
          <span className="text-mail-muted">· {fmtTime(selectedSlot.start.toISOString())} – {fmtTime(selectedSlot.end.toISOString())}</span>
          {meetingType === 'meet' && <Video size={11} className="text-green-400 ml-auto" />}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-subtle text-xs cursor-pointer hover:bg-mail-hover transition-colors">
          Cancel
        </button>
        <button onClick={handleSchedule} disabled={!selectedSlot || scheduling}
          className={`flex-[2] py-2.5 rounded-lg border-none text-xs font-semibold cursor-pointer transition-all ${
            selectedSlot
              ? 'bg-mail-accent text-white hover:bg-mail-accent-hover'
              : 'bg-mail-chip text-mail-subtle cursor-default'
          } disabled:opacity-60`}>
          {scheduling ? (
            <><Loader2 size={12} className="inline animate-spin mr-1.5" />Scheduling...</>
          ) : selectedSlot ? (
            `Schedule ${fmtTime(selectedSlot.start.toISOString())}`
          ) : 'Pick a slot'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

function Label({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <label className={`block text-[10px] font-medium uppercase tracking-wider text-mail-subtle ${noMargin ? '' : 'mb-1.5'}`}>
      {children}
    </label>
  );
}