// app/book/[slug]/page.tsx
// Public booking page — no auth required.
// Visitors see available slots and can book a meeting.
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2, Calendar, Clock, ChevronLeft, ChevronRight,
  Video, CheckCircle, Shield, Globe, User, Mail,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PublicProfile = {
  slug: string; displayName: string; bio: string; timezone: string;
  availableDays: number[]; hoursStart: string; hoursEnd: string;
  durationOptions: number[]; defaultDuration: number; maxAdvanceDays: number; isActive: boolean;
};
type TimeSlot = { start: string; end: string };
type Step = 'loading' | 'date' | 'time' | 'details' | 'verify' | 'confirmed' | 'error';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/public/booking/${slug}`);
        if (!res.ok) throw new Error('not_found');
        const data = await res.json();
        setProfile(data.profile);
        setSelectedDuration(data.profile.defaultDuration);
        setStep('date');
      } catch { setStep('error'); setError('This booking page was not found or is no longer available.'); }
    })();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !profile) return;
    (async () => {
      setSlotsLoading(true);
      try {
        const res = await fetch(`/api/public/booking/${slug}/availability?date=${selectedDate}&duration=${selectedDuration}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setSlots(data.slots ?? []);
        setBookedSlots(data.bookedSlots ?? []);
      } catch { setSlots([]); }
      finally { setSlotsLoading(false); }
    })();
  }, [selectedDate, selectedDuration, slug, profile]);

  const handleSendOtp = async () => {
    if (!guestEmail.trim()) return;
    setOtpLoading(true); setOtpError('');
    try {
      const res = await fetch(`/api/public/booking/${slug}/otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: guestEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setStep('verify');
    } catch (err) { setOtpError(err instanceof Error ? err.message : 'Failed'); }
    finally { setOtpLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot || !guestName || !guestEmail || !otpCode) return;
    setBooking(true); setOtpError('');
    try {
      const res = await fetch(`/api/public/booking/${slug}/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName, email: guestEmail, otp: otpCode, date: selectedDate, startTime: selectedSlot.start, duration: selectedDuration, notes: guestNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setBookingResult(data.booking); setStep('confirmed');
    } catch (err) { setOtpError(err instanceof Error ? err.message : 'Failed'); }
    finally { setBooking(false); }
  };

  const calendarDays = useMemo(() => {
    if (!profile) return [];
    const y = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const firstDay = new Date(y, mo, 1).getDay();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + profile.maxAdvanceDays);
    const days: { date: Date; key: string; inMonth: boolean; available: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) { const d = new Date(y, mo, -firstDay + i + 1); days.push({ date: d, key: toDateKey(d), inMonth: false, available: false, isToday: false }); }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, mo, d); const key = toDateKey(date);
      const isPast = date < today; const isTooFar = date > maxDate;
      days.push({ date, key, inMonth: true, available: !isPast && !isTooFar && profile.availableDays.includes(date.getDay()), isToday: date.getTime() === today.getTime() });
    }
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) { const d = new Date(y, mo + 1, i); days.push({ date: d, key: toDateKey(d), inMonth: false, available: false, isToday: false }); }
    return days;
  }, [viewMonth, profile]);

  if (step === 'loading') return <Shell><Loader2 size={24} className="animate-spin text-green-500" /><p className="text-neutral-400 text-sm mt-3">Loading...</p></Shell>;
  if (step === 'error') return <Shell><Calendar size={40} strokeWidth={1} className="text-neutral-500 mb-3" /><h2 className="text-lg font-semibold text-white m-0 mb-2">Not Found</h2><p className="text-neutral-400 text-sm m-0">{error}</p></Shell>;
  if (!profile) return null;

  if (step === 'confirmed' && bookingResult) return (
    <Shell>
      <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-green-400" /></div>
      <h2 className="text-xl font-semibold text-white m-0 mb-2">Meeting Booked!</h2>
      <p className="text-neutral-400 text-sm m-0 mb-5">A calendar invite has been sent to your email.</p>
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 w-full max-w-[400px] mb-3">
        <div className="flex items-center gap-2 text-sm text-white mb-2"><Calendar size={14} className="text-green-400" /> {formatDisplayDate(bookingResult.date)}</div>
        <div className="flex items-center gap-2 text-sm text-white mb-2"><Clock size={14} className="text-green-400" /> {formatTime12(bookingResult.startTime)} — {formatTime12(bookingResult.endTime)}</div>
        {bookingResult.meetLink && <a href={bookingResult.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 no-underline hover:underline"><Video size={14} /> Join Google Meet</a>}
      </div>
      <p className="text-[11px] text-neutral-500 m-0">Check your email for the calendar invitation.</p>
    </Shell>
  );

  return (
    <Shell>
      <div className="w-full max-w-[520px]">
        {/* Profile */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center text-green-400 text-lg font-bold mx-auto mb-3">
            {profile.displayName.slice(0, 2).toUpperCase() || 'CM'}
          </div>
          <h1 className="text-xl font-semibold text-white m-0">{profile.displayName}</h1>
          {profile.bio && <p className="text-neutral-400 text-sm m-0 mt-1">{profile.bio}</p>}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 mt-2"><Globe size={10} /> {profile.timezone}</div>
        </div>

        {/* Duration */}
        {profile.durationOptions.length > 1 && (step === 'date' || step === 'time') && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {profile.durationOptions.map((d) => (
              <button key={d} onClick={() => { setSelectedDuration(d); setSelectedSlot(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${selectedDuration === d ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-neutral-700 bg-transparent text-neutral-400 hover:border-neutral-500'
                  }`}>{d} min</button>
            ))}
          </div>
        )}

        {/* Calendar */}
        {(step === 'date' || step === 'time') && (
          <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer border-none bg-transparent"><ChevronLeft size={16} /></button>
              <span className="text-sm font-semibold text-white">{MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
              <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer border-none bg-transparent"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((d) => <div key={d} className="text-center text-[10px] font-medium text-neutral-500 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => (
                <button key={day.key} onClick={() => { if (day.available) { setSelectedDate(day.key); setSelectedSlot(null); setStep('time'); } }}
                  disabled={!day.available}
                  className={`h-9 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all ${!day.inMonth ? 'text-neutral-700 cursor-default' :
                      day.key === selectedDate ? 'bg-green-500 text-white' :
                        day.isToday ? 'bg-neutral-700 text-white' :
                          day.available ? 'bg-transparent text-neutral-300 hover:bg-neutral-700' :
                            'text-neutral-600 cursor-not-allowed'
                    }`}>{day.date.getDate()}</button>
              ))}
            </div>
          </div>
        )}

        {/* Slots */}
        {slotsLoading ? (
          <div className="flex items-center justify-center py-8 text-neutral-400 text-sm gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</div>
        ) : slots.length === 0 && bookedSlots.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">No available times</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">
              {slots.map((slot) => (
                <button key={slot.start} onClick={() => { setSelectedSlot(slot); setStep('details'); }}
                  className={`py-2.5 rounded-lg text-[13px] font-medium cursor-pointer border transition-colors ${selectedSlot?.start === slot.start ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-neutral-700 text-neutral-300 hover:border-green-500/50 hover:text-green-400'
                    }`}>{formatTime12(slot.start)}</button>
              ))}
              {bookedSlots.map((slot) => (
                <div key={`booked-${slot.start}`}
                  className="py-2.5 rounded-lg text-[13px] font-medium border border-neutral-800 text-neutral-600 text-center cursor-not-allowed line-through opacity-50">
                  {formatTime12(slot.start)}
                </div>
              ))}
            </div>
            {bookedSlots.length > 0 && (
              <div className="text-[10px] text-neutral-500 mt-2 text-center">Strikethrough times are unavailable</div>
            )}
          </>
        )}

        {/* Details + OTP */}
        {(step === 'details' || step === 'verify') && selectedSlot && (
          <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5 mb-4">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-neutral-700">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{formatDisplayDate(selectedDate)}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{formatTime12(selectedSlot.start)} — {formatTime12(selectedSlot.end)} · {selectedDuration} min</div>
              </div>
              <button onClick={() => { setStep('time'); setSelectedSlot(null); }} className="text-xs text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent">Change</button>
            </div>

            {step === 'details' && (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  <div><label className="text-[11px] font-medium text-neutral-400 mb-1 block"><User size={10} className="inline mr-1" />Your Name *</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-sm outline-none focus:border-green-500/50 placeholder:text-neutral-600" /></div>
                  <div><label className="text-[11px] font-medium text-neutral-400 mb-1 block"><Mail size={10} className="inline mr-1" />Your Email *</label>
                    <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="john@example.com"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-sm outline-none focus:border-green-500/50 placeholder:text-neutral-600" /></div>
                  <div><label className="text-[11px] font-medium text-neutral-400 mb-1 block">Notes (optional)</label>
                    <textarea value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} placeholder="Anything you'd like to discuss..." rows={2}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-sm outline-none resize-none focus:border-green-500/50 placeholder:text-neutral-600 font-[inherit]" /></div>
                </div>
                {otpError && <div className="text-red-400 text-xs mb-3">{otpError}</div>}
                <button onClick={handleSendOtp} disabled={otpLoading || !guestName.trim() || !guestEmail.trim()}
                  className="w-full py-3 rounded-lg border-none bg-green-500 hover:bg-green-600 text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {otpLoading ? <><Loader2 size={14} className="animate-spin" /> Sending code...</> : <><Shield size={14} /> Verify Email & Book</>}
                </button>
                <p className="text-[10px] text-neutral-500 mt-2 text-center m-0">We'll send a verification code to your email before confirming.</p>
              </>
            )}

            {step === 'verify' && (
              <>
                <div className="text-center mb-4">
                  <Shield size={20} className="text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white">Enter verification code</div>
                  <div className="text-xs text-neutral-400 mt-1">Sent to {guestEmail}</div>
                </div>
                <input type="text" inputMode="numeric" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" maxLength={6} autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-center text-2xl font-mono tracking-[0.3em] outline-none focus:border-green-500/50 placeholder:text-neutral-700 mb-4" />
                {otpError && <div className="text-red-400 text-xs mb-3 text-center">{otpError}</div>}
                <button onClick={handleBook} disabled={booking || otpCode.length !== 6}
                  className="w-full py-3 rounded-lg border-none bg-green-500 hover:bg-green-600 text-white text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {booking ? <><Loader2 size={14} className="animate-spin" /> Confirming...</> : <><CheckCircle size={14} /> Confirm Booking</>}
                </button>
                <button onClick={() => { setStep('details'); setOtpCode(''); setOtpError(''); }}
                  className="w-full mt-2 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent">← Back to details</button>
              </>
            )}
          </div>
        )}

        <div className="text-center text-[10px] text-neutral-600 mt-4">Powered by <span className="text-neutral-400">Context Mode</span></div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 py-12" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
      <div className="w-full max-w-[520px] flex flex-col items-center">{children}</div>
    </div>
  );
}
