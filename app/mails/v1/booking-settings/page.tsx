// app/mails/v1/booking-settings/page.tsx
// Host configures their public booking profile.
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Calendar, Clock, Globe, Link2, Copy, Check,
  Eye, EyeOff, Save, ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Profile = {
  id: string; slug: string; displayName: string; bio: string; timezone: string;
  availableDays: number[]; hoursStart: string; hoursEnd: string;
  durationOptions: number[]; defaultDuration: number; bufferMinutes: number;
  maxAdvanceDays: number; maxBookingsPerDay: number; meetingTitleTemplate: string;
  includeMeet: boolean; isActive: boolean;
};

const DAY_LABELS = [
  { value: 0, label: 'Sun' }, { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' }, { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const TIMEZONES = Intl.supportedValuesOf?.('timeZone') ?? ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BookingSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('');
  const [availableDays, setAvailableDays] = useState<number[]>([1,2,3,4,5]);
  const [hoursStart, setHoursStart] = useState('09:00');
  const [hoursEnd, setHoursEnd] = useState('17:00');
  const [durationOptions, setDurationOptions] = useState<number[]>([15,30,60]);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(10);
  const [meetingTitleTemplate, setMeetingTitleTemplate] = useState('{{guest_name}} + {{host_name}}');
  const [includeMeet, setIncludeMeet] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/booking/profile');
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        setProfile(p);
        setSlug(p.slug); setDisplayName(p.displayName); setBio(p.bio);
        setTimezone(p.timezone); setAvailableDays(p.availableDays);
        setHoursStart(p.hoursStart); setHoursEnd(p.hoursEnd);
        setDurationOptions(p.durationOptions); setDefaultDuration(p.defaultDuration);
        setBufferMinutes(p.bufferMinutes); setMaxAdvanceDays(p.maxAdvanceDays);
        setMaxBookingsPerDay(p.maxBookingsPerDay); setMeetingTitleTemplate(p.meetingTitleTemplate);
        setIncludeMeet(p.includeMeet); setIsActive(p.isActive);
      } else {
        // Default timezone to browser
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!slug.trim()) { setError('URL slug is required'); return; }
    if (!displayName.trim()) { setError('Display name is required'); return; }
    if (availableDays.length === 0) { setError('Select at least one available day'); return; }
    if (durationOptions.length === 0) { setError('Select at least one duration'); return; }

    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/v1/booking/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug, displayName, bio, timezone, availableDays,
          hoursStart, hoursEnd, durationOptions, defaultDuration,
          bufferMinutes, maxAdvanceDays, maxBookingsPerDay,
          meetingTitleTemplate, includeMeet, isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setProfile(data.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleDay = (day: number) => {
    setAvailableDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const toggleDuration = (dur: number) => {
    setDurationOptions((prev) => {
      const next = prev.includes(dur) ? prev.filter((d) => d !== dur) : [...prev, dur].sort((a,b) => a - b);
      if (next.length === 0) return prev; // Must have at least one
      if (!next.includes(defaultDuration)) setDefaultDuration(next[0]);
      return next;
    });
  };

  const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/book/${slug}` : `/book/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle">
      <Loader2 size={20} className="animate-spin" />
    </div>
  );

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[680px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold m-0 flex items-center gap-2">
              <Calendar size={18} className="text-mail-accent" /> Booking Page
            </h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">Let people book meetings with you</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border text-mail-muted text-xs no-underline hover:bg-mail-hover transition-colors">
                <ExternalLink size={12} /> Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Save size={12} />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {error && <div className="px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs mb-4">{error}</div>}

        {/* Active toggle + URL */}
        <Section title="Status & URL">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-mail-text">Booking page is {isActive ? 'live' : 'offline'}</div>
              <div className="text-xs text-mail-subtle mt-0.5">
                {isActive ? 'Anyone with the link can book a meeting' : 'Only you can see the page'}
              </div>
            </div>
            <button onClick={() => setIsActive(!isActive)}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer border-none transition-colors ${isActive ? 'bg-green-500' : 'bg-neutral-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div>
            <label className="text-[11px] font-medium text-mail-subtle mb-1 block">Your booking URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-lg border border-mail-border bg-mail-bg overflow-hidden">
                <span className="px-3 py-2.5 text-xs text-mail-subtle bg-mail-surface border-r border-mail-border shrink-0">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/book/
                </span>
                <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-name"
                  className="flex-1 px-3 py-2.5 bg-transparent text-mail-text text-xs outline-none border-none" />
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors shrink-0">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </Section>

        {/* Profile */}
        <Section title="Profile">
          <div className="flex flex-col gap-3">
            <Field label="Display Name">
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none focus:border-mail-accent/40" />
            </Field>
            <Field label="Bio (optional)">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short description..."
                rows={2} className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none resize-none font-[inherit] focus:border-mail-accent/40" />
            </Field>
            <Field label="Timezone">
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none cursor-pointer">
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Availability */}
        <Section title="Availability">
          <Field label="Available Days">
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d) => (
                <button key={d.value} onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                    availableDays.includes(d.value)
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-mail-border bg-transparent text-mail-subtle hover:border-mail-subtle'
                  }`}>{d.label}</button>
              ))}
            </div>
          </Field>

          <div className="flex gap-3 mt-3">
            <Field label="Start Time" className="flex-1">
              <input type="time" value={hoursStart} onChange={(e) => setHoursStart(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </Field>
            <Field label="End Time" className="flex-1">
              <input type="time" value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </Field>
          </div>
        </Section>

        {/* Meeting options */}
        <Section title="Meeting Options">
          <Field label="Duration Options (select all that apply)">
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((d) => (
                <button key={d} onClick={() => toggleDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                    durationOptions.includes(d)
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-mail-border bg-transparent text-mail-subtle hover:border-mail-subtle'
                  }`}>{d} min</button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <Field label="Default Duration">
              <select value={defaultDuration} onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none cursor-pointer">
                {durationOptions.map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </Field>
            <Field label="Buffer (min)">
              <input type="number" value={bufferMinutes} onChange={(e) => setBufferMinutes(Number(e.target.value))}
                min={0} max={60}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </Field>
            <Field label="Max/Day">
              <input type="number" value={maxBookingsPerDay} onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))}
                min={1} max={50}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Advance Booking (days)">
              <input type="number" value={maxAdvanceDays} onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                min={1} max={365}
                className="w-full max-w-[150px] px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </Field>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-mail-border">
            <div>
              <div className="text-xs font-medium text-mail-text">Auto-add Google Meet</div>
              <div className="text-[11px] text-mail-subtle mt-0.5">Generate a Meet link for every booking</div>
            </div>
            <button onClick={() => setIncludeMeet(!includeMeet)}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer border-none transition-colors ${includeMeet ? 'bg-green-500' : 'bg-neutral-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${includeMeet ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </Section>

        {/* Meeting title */}
        <Section title="Meeting Title Template">
          <Field label="Template (use {{guest_name}} and {{host_name}})">
            <input value={meetingTitleTemplate} onChange={(e) => setMeetingTitleTemplate(e.target.value)}
              placeholder="{{guest_name}} + {{host_name}}"
              className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none focus:border-mail-accent/40" />
          </Field>
          <div className="text-[10px] text-mail-subtle mt-1">
            Preview: {meetingTitleTemplate.replace('{{guest_name}}', 'John').replace('{{host_name}}', displayName || 'You')}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-mail-border last:border-b-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-mail-card-header mb-3">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="text-[11px] font-medium text-mail-subtle mb-1 block">{label}</label>
      {children}
    </div>
  );
}
