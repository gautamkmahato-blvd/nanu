// app/mails/v1/_components/email-actions/ScheduleReplyPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Clock, X, Loader2, Check, Calendar, Send,
  Reply, ReplyAll, AlertCircle, User, Users,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  threadId: string;
  subject: string | null;
  messages: { fromEmail: string; fromName: string | null; toEmails: string[] }[];
  onClose: () => void;
  onScheduled?: () => void;
};

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

function getPresets(): { label: string; time: Date }[] {
  const now = new Date();
  const presets: { label: string; time: Date }[] = [];

  if (now.getHours() < 17) {
    const d = new Date(now);
    d.setHours(17, 0, 0, 0);
    presets.push({ label: 'Later today · 5:00 PM', time: d });
  }

  if (now.getHours() < 21) {
    const d = new Date(now);
    d.setHours(21, 0, 0, 0);
    presets.push({ label: 'Tonight · 9:00 PM', time: d });
  }

  const tmMorning = new Date(now);
  tmMorning.setDate(tmMorning.getDate() + 1);
  tmMorning.setHours(9, 0, 0, 0);
  presets.push({ label: 'Tomorrow morning · 9:00 AM', time: tmMorning });

  const tmAfternoon = new Date(now);
  tmAfternoon.setDate(tmAfternoon.getDate() + 1);
  tmAfternoon.setHours(14, 0, 0, 0);
  presets.push({ label: 'Tomorrow afternoon · 2:00 PM', time: tmAfternoon });

  const nextMon = new Date(now);
  const daysToMon = ((8 - now.getDay()) % 7) || 7;
  nextMon.setDate(nextMon.getDate() + daysToMon);
  nextMon.setHours(9, 0, 0, 0);
  if (daysToMon <= 6) {
    presets.push({
      label: `Next Monday · ${nextMon.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, 9:00 AM`,
      time: nextMon,
    });
  }

  return presets;
}

function formatScheduleTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScheduleReplyPanel({ threadId, subject, messages, onClose, onScheduled }: Props) {
  const [mode, setMode] = useState<'reply' | 'replyAll'>('reply');
  const [body, setBody] = useState('');
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Derive recipients from messages
  const latestMsg = messages[messages.length - 1];
  const replyTo = latestMsg?.fromEmail ?? '';
  const replyToName = latestMsg?.fromName ?? replyTo.split('@')[0];

  // Reply All: collect all unique participants (excluding self — we don't know self here, but show all)
  const allParticipants = (() => {
    const set = new Set<string>();
    for (const msg of messages) {
      set.add(msg.fromEmail.toLowerCase());
      for (const to of msg.toEmails ?? []) set.add(to.toLowerCase());
    }
    return Array.from(set);
  })();

  const recipients = mode === 'reply' ? [replyTo] : allParticipants;
  const displaySubject = subject
    ? (subject.startsWith('Re:') ? subject : `Re: ${subject}`)
    : 'Re: (No subject)';

  // Default custom date/time
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCustomDate(tomorrow.toISOString().split('T')[0]);
    setCustomTime('09:00');
  }, []);

  // Reset on thread change
  useEffect(() => {
    setBody('');
    setError('');
    setSuccess('');
    setSelectedTime(null);
    setMode('reply');
  }, [threadId]);

  function selectPreset(time: Date) {
    setSelectedTime(time);
    setError('');
  }

  function selectCustom() {
    if (!customDate || !customTime) { setError('Pick a date and time'); return; }
    const d = new Date(`${customDate}T${customTime}`);
    if (isNaN(d.getTime())) { setError('Invalid date/time'); return; }
    if (d.getTime() <= Date.now() + 60_000) { setError('Must be at least 1 minute in the future'); return; }
    setSelectedTime(d);
    setError('');
  }

  async function handleSchedule() {
    if (!body.trim()) { setError('Write your reply first'); return; }
    if (!selectedTime) { setError('Pick a time to send'); return; }
    if (selectedTime.getTime() <= Date.now() + 60_000) { setError('Selected time has passed. Pick a new time.'); return; }

    setScheduling(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/v1/scheduled-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          toEmails: recipients,
          subject: displaySubject,
          body: body.trim(),
          isReply: true,
          scheduledAt: selectedTime.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to schedule');

      setSuccess(formatScheduleTime(selectedTime));
      setBody('');
      setSelectedTime(null);
      onScheduled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setScheduling(false);
    }
  }

  const presets = getPresets();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-mail-border shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-mail-accent" />
          <span className="text-[13px] font-semibold text-mail-text">Schedule Reply</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4">
        {/* Success state */}
        {success && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <Check size={24} className="text-green-400" />
            </div>
            <div className="text-[14px] font-semibold text-green-400 mb-1">Reply Scheduled!</div>
            <div className="text-[12px] text-mail-subtle mb-4">Will be sent {success}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSuccess('')}
                className="px-4 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors"
              >
                Schedule Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border-none bg-mail-accent text-white text-[12px] font-medium cursor-pointer hover:bg-mail-accent-hover transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {!success && (
          <>
            {/* Reply mode toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-mail-bg border border-mail-border mb-4">
              <button
                onClick={() => setMode('reply')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors cursor-pointer border-none ${
                  mode === 'reply'
                    ? 'bg-mail-surface text-mail-text shadow-sm'
                    : 'bg-transparent text-mail-subtle hover:text-mail-muted'
                }`}
              >
                <Reply size={13} /> Reply
              </button>
              <button
                onClick={() => setMode('replyAll')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors cursor-pointer border-none ${
                  mode === 'replyAll'
                    ? 'bg-mail-surface text-mail-text shadow-sm'
                    : 'bg-transparent text-mail-subtle hover:text-mail-muted'
                }`}
              >
                <ReplyAll size={13} /> Reply All
              </button>
            </div>

            {/* Recipients */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mail-subtle mb-1.5">
                {mode === 'reply' ? 'Replying to' : 'Replying to all'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recipients.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-mail-bg border border-mail-border text-[11px] text-mail-muted"
                  >
                    <User size={10} className="text-mail-subtle" />
                    {email}
                  </span>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mail-subtle mb-1.5">Subject</div>
              <div className="text-[12px] text-mail-muted px-3 py-2 rounded-lg bg-mail-bg border border-mail-border truncate">
                {displaySubject}
              </div>
            </div>

            {/* Reply body */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mail-subtle mb-1.5">Your reply</div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your reply..."
                rows={5}
                disabled={scheduling}
                className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] font-[inherit] leading-relaxed resize-y outline-none transition-colors placeholder:text-mail-subtle focus:border-mail-accent/40 disabled:opacity-50"
              />
            </div>

            {/* Time selection */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mail-subtle mb-2">Send at</div>

              {/* Presets */}
              <div className="space-y-1 mb-3">
                {presets.map((preset) => {
                  const isSelected = selectedTime && selectedTime.getTime() === preset.time.getTime();
                  return (
                    <button
                      key={preset.label}
                      onClick={() => selectPreset(preset.time)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] transition-colors cursor-pointer border text-left ${
                        isSelected
                          ? 'border-mail-accent/40 bg-mail-accent-soft text-mail-accent'
                          : 'border-mail-border bg-transparent text-mail-muted hover:bg-mail-hover hover:text-mail-text'
                      }`}
                    >
                      <Clock size={12} className={isSelected ? 'text-mail-accent' : 'text-mail-subtle'} />
                      {preset.label}
                      {isSelected && <Check size={12} className="ml-auto text-mail-accent" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom */}
              <div className="rounded-lg border border-mail-border p-3">
                <div className="text-[10px] font-semibold text-mail-subtle uppercase tracking-wider mb-2">Custom time</div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-2 py-1.5 rounded-md border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none focus:border-mail-accent/40"
                  />
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-[100px] px-2 py-1.5 rounded-md border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none focus:border-mail-accent/40"
                  />
                </div>
                <button
                  onClick={selectCustom}
                  className={`w-full py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                    selectedTime && !presets.some((p) => p.time.getTime() === selectedTime.getTime())
                      ? 'border-mail-accent/40 bg-mail-accent-soft text-mail-accent'
                      : 'border-mail-border bg-transparent text-mail-muted hover:bg-mail-hover'
                  }`}
                >
                  Use custom time
                </button>
              </div>
            </div>

            {/* Selected time confirmation */}
            {selectedTime && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-mail-accent-soft border border-mail-accent/20">
                <Calendar size={13} className="text-mail-accent shrink-0" />
                <span className="text-[12px] text-mail-accent font-medium">
                  Will send {formatScheduleTime(selectedTime)}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-[12px]">
                <AlertCircle size={12} /> {error}
              </div>
            )}

            {/* Schedule button */}
            <button
              onClick={handleSchedule}
              disabled={scheduling || !body.trim() || !selectedTime}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              {scheduling ? (
                <><Loader2 size={14} className="animate-spin" /> Scheduling...</>
              ) : (
                <><Clock size={14} /> Schedule Reply</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
