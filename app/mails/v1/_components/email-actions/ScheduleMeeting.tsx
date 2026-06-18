// components/email-actions/schedule-meeting.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FreeSlot = { start: string; end: string };
type BusySlot = { start: string; end: string };

type Props = {
  senderEmail: string;
  senderName: string | null;
  subject: string | null;
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
  { value: 90, label: '1.5h' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

// Split free slots into bookable chunks of given duration
function chunkSlots(freeSlots: FreeSlot[], durationMinutes: number, selectedDate: Date): { start: Date; end: Date }[] {
  const chunks: { start: Date; end: Date }[] = [];
  const now = new Date();

  for (const slot of freeSlots) {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // Only show slots for the selected date
    if (!isSameDay(slotStart, selectedDate)) continue;

    let cursor = slotStart;
    // Skip past slots (if today)
    if (cursor < now && isSameDay(cursor, now)) {
      // Round up to next 15-min boundary
      const mins = now.getMinutes();
      const roundedMins = Math.ceil(mins / 15) * 15;
      cursor = new Date(now);
      cursor.setMinutes(roundedMins, 0, 0);
    }

    while (cursor.getTime() + durationMinutes * 60000 <= slotEnd.getTime()) {
      const end = new Date(cursor.getTime() + durationMinutes * 60000);
      chunks.push({ start: new Date(cursor), end });
      cursor = new Date(cursor.getTime() + 15 * 60000); // advance by 15 min
    }
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScheduleMeeting({ senderEmail, senderName, subject, onScheduled }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(`Re: ${subject ?? '(no subject)'}`);
  const [duration, setDuration] = useState(30);
  const [includeMeet, setIncludeMeet] = useState(true);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [success, setSuccess] = useState<{ meetLink?: string } | null>(null);

  // Days to show (next 5 working days)
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < 5) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); // skip weekends
    d.setDate(d.getDate() + 1);
  }

  // Fetch availability when opened
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const res = await fetch(`/api/v1/calendar/availability?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = await res.json();
      setFreeSlots(data.free ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAvailability();
      setSuccess(null);
      setSelectedSlot(null);
    }
  }, [isOpen, fetchAvailability]);

  // Reset selected slot when date or duration changes
  useEffect(() => { setSelectedSlot(null); }, [selectedDate, duration]);

  // Get chunks for selected date
  const availableChunks = chunkSlots(freeSlots, duration, selectedDate);

  // Schedule meeting
  const handleSchedule = async () => {
    if (!selectedSlot) return;
    setScheduling(true);
    setError('');
    try {
      const res = await fetch('/api/v1/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: title.trim() || `Meeting with ${senderName ?? senderEmail}`,
          startDateTime: selectedSlot.start.toISOString(),
          endDateTime: selectedSlot.end.toISOString(),
          attendeeEmails: [senderEmail],
          meetingType: includeMeet ? 'meet' : 'none',
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? 'Failed');
      }
      const data = await res.json();
      setSuccess({ meetLink: data.meetLink });
      onScheduled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setScheduling(false);
    }
  };

  const senderDisplay = senderName ?? senderEmail.split('@')[0];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#a1a1aa',
          cursor: 'pointer',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; }}
      >
        📅 Schedule
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 81,
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 16,
            width: 480,
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 12px 50px rgba(0,0,0,0.6)',
          }}>
            {/* Success state */}
            {success ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: '#22c55e' }}>Meeting Scheduled!</h3>
                <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>
                  Invitation sent to {senderDisplay}
                </p>
                <p style={{ fontSize: 12, color: '#52525b', marginBottom: 16 }}>
                  {selectedSlot && `${fmtTime(selectedSlot.start.toISOString())} – ${fmtTime(selectedSlot.end.toISOString())}`}
                </p>
                {success.meetLink && (
                  <div style={{ marginBottom: 16 }}>
                    <a href={success.meetLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3b82f6', wordBreak: 'break-all' }}>
                      {success.meetLink}
                    </a>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => navigator.clipboard.writeText(success.meetLink!)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #27272a', background: '#0a0a0a', color: '#a1a1aa', fontSize: 11, cursor: 'pointer' }}>📋 Copy Meet Link</button>
                    </div>
                  </div>
                )}
                <button onClick={() => setIsOpen(false)} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: '#a78bfa', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <div style={{ padding: 24 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#fafafa' }}>Schedule Meeting</h3>
                    <p style={{ fontSize: 12, color: '#52525b', margin: '4px 0 0' }}>with {senderDisplay}</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>

                {/* Context badge */}
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#a78bfa08', border: '1px solid #a78bfa20', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>✉️</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 500 }}>Scheduling from email</div>
                    <div style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{subject ?? '(no subject)'}</div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: '#52525b', marginBottom: 4, fontWeight: 500, display: 'block' }}>Meeting Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #27272a', background: '#0a0a0a', color: '#fafafa', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Duration + Meet toggle */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#52525b', marginBottom: 4, fontWeight: 500, display: 'block' }}>Duration</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {DURATIONS.map((d) => (
                        <button key={d.value} onClick={() => setDuration(d.value)}
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: duration === d.value ? 600 : 400,
                            border: duration === d.value ? '1px solid #a78bfa' : '1px solid #27272a',
                            background: duration === d.value ? '#a78bfa15' : 'transparent',
                            color: duration === d.value ? '#a78bfa' : '#52525b',
                            cursor: 'pointer', transition: 'all 150ms',
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setIncludeMeet(!includeMeet)}
                    style={{
                      padding: '7px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      border: includeMeet ? '1px solid #22c55e' : '1px solid #27272a',
                      background: includeMeet ? '#22c55e15' : 'transparent',
                      color: includeMeet ? '#22c55e' : '#52525b',
                      cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
                    }}
                  >
                    📹 {includeMeet ? 'Meet On' : 'Meet Off'}
                  </button>
                </div>

                {/* Day pills */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: '#52525b', marginBottom: 6, fontWeight: 500, display: 'block' }}>Pick a day</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {days.map((day) => {
                      const sel = isSameDay(day, selectedDate);
                      const tod = isToday(day);
                      return (
                        <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                          style={{
                            flex: 1, padding: '8px 4px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                            border: sel ? '1px solid #a78bfa' : '1px solid #27272a',
                            background: sel ? '#a78bfa15' : 'transparent',
                            transition: 'all 150ms',
                          }}
                        >
                          <div style={{ fontSize: 10, color: tod ? '#a78bfa' : '#52525b', fontWeight: 500 }}>{DAY_NAMES[day.getDay()]}</div>
                          <div style={{ fontSize: 16, fontWeight: sel ? 700 : 500, color: sel ? '#a78bfa' : '#a1a1aa' }}>{day.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Free slots */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: '#52525b', marginBottom: 6, fontWeight: 500, display: 'block' }}>
                    Available slots · {dayLabel(selectedDate)}
                  </label>

                  {loading && <div style={{ padding: '20px 0', textAlign: 'center', color: '#52525b', fontSize: 12 }}>Loading availability...</div>}

                  {error && <div style={{ padding: '12px', borderRadius: 8, background: '#ef444410', border: '1px solid #ef444420', color: '#ef4444', fontSize: 12 }}>{error}</div>}

                  {!loading && !error && availableChunks.length === 0 && (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#3f3f46', fontSize: 12 }}>No available slots for this day</div>
                  )}

                  {!loading && availableChunks.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                      {availableChunks.map((chunk, i) => {
                        const sel = selectedSlot && chunk.start.getTime() === selectedSlot.start.getTime();
                        return (
                          <button key={i} onClick={() => setSelectedSlot(chunk)}
                            style={{
                              padding: '8px 4px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
                              border: sel ? '1px solid #a78bfa' : '1px solid #27272a',
                              background: sel ? '#a78bfa' : '#0a0a0a',
                              color: sel ? '#fff' : '#a1a1aa',
                              cursor: 'pointer', fontWeight: sel ? 600 : 400,
                              transition: 'all 100ms',
                            }}
                            onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.background = '#18181b'; } }}
                            onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.background = '#0a0a0a'; } }}
                          >
                            {fmtTime(chunk.start.toISOString())}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected slot summary */}
                {selectedSlot && (
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: '#a78bfa10', border: '1px solid #a78bfa25', marginBottom: 16, fontSize: 12 }}>
                    <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 2 }}>Selected</div>
                    <div style={{ color: '#d4d4d8' }}>
                      {dayLabel(selectedSlot.start)} · {fmtTime(selectedSlot.start.toISOString())} – {fmtTime(selectedSlot.end.toISOString())} · {duration}min
                      {includeMeet && <span style={{ color: '#22c55e', marginLeft: 8 }}>📹 Google Meet</span>}
                    </div>
                  </div>
                )}

                {/* Attendee info */}
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#0a0a0a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#a1a1aa', flexShrink: 0 }}>
                    {senderDisplay.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#d4d4d8', fontWeight: 500 }}>{senderDisplay}</div>
                    <div style={{ color: '#52525b', fontSize: 11 }}>{senderEmail}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#52525b' }}>📧 Invite will be sent</span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setIsOpen(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #27272a', background: 'transparent', color: '#71717a', fontSize: 13, cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
                  >Cancel</button>
                  <button onClick={handleSchedule} disabled={!selectedSlot || scheduling}
                    style={{
                      flex: 2, padding: '10px', borderRadius: 8, border: 'none',
                      background: selectedSlot ? '#a78bfa' : '#27272a',
                      color: selectedSlot ? '#fff' : '#52525b',
                      fontSize: 13, fontWeight: 600,
                      cursor: selectedSlot ? 'pointer' : 'default',
                      opacity: scheduling ? 0.6 : 1,
                      transition: 'background 150ms',
                    }}
                  >
                    {scheduling ? 'Scheduling...' : selectedSlot ? `Schedule for ${fmtTime(selectedSlot.start.toISOString())}` : 'Pick a time slot'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}