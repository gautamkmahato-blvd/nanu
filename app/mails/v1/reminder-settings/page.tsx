// app/mails/v1/reminder-settings/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Phone, Bell, Clock, Save, Check, TestTube,
  PhoneCall, Shield, Volume2, VolumeX, CheckCircle, XCircle,
} from 'lucide-react';

type Settings = {
  phoneNumber: string | null; callEnabled: boolean; telegramEnabled: boolean;
  reminderMinutes: number; quietHoursStart: string; quietHoursEnd: string; timezone: string;
};

type LogEntry = {
  id: string; eventSummary: string; phoneNumber: string | null; callType: string;
  status: string; createdAt: string; error: string | null;
};

export default function ReminderSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [callEnabled, setCallEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [timezone, setTimezone] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        fetch('/api/v1/reminders/settings'), fetch('/api/v1/reminders/logs'),
      ]);
      const sData = await sRes.json();
      const lData = await lRes.json();
      if (sData.settings) {
        const s = sData.settings;
        setPhoneNumber(s.phoneNumber ?? '');
        setCallEnabled(s.callEnabled);
        setReminderMinutes(s.reminderMinutes);
        setQuietStart(s.quietHoursStart);
        setQuietEnd(s.quietHoursEnd);
        setTimezone(s.timezone);
      } else {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
      setLogs(lData.logs ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/v1/reminders/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() || null, callEnabled, reminderMinutes, quietHoursStart: quietStart, quietHoursEnd: quietEnd, timezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleTestCall = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch('/api/v1/reminders/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setTestResult({ success: true, message: data.message });
    } catch (err) { setTestResult({ success: false, message: err instanceof Error ? err.message : 'Failed' }); }
    finally { setTesting(false); }
  };

  if (loading) return <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle"><Loader2 size={20} className="animate-spin" /></div>;

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[640px] mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold m-0 flex items-center gap-2">
              <PhoneCall size={18} className="text-mail-accent" /> Meeting Reminders
            </h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">Get a phone call before every meeting</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Save size={12} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {error && <div className="px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs mb-4">{error}</div>}

        {/* Phone Number */}
        <Section title="Phone Number">
          <label className="text-[11px] font-medium text-mail-subtle mb-1 block">Your phone number (E.164 format)</label>
          <div className="relative max-w-[300px]">
            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mail-subtle" />
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+919876543210"
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none focus:border-mail-accent/40 font-mono placeholder:text-mail-subtle" />
          </div>
          <div className="text-[10px] text-mail-subtle mt-1">Include country code. India: +91, US: +1</div>
        </Section>

        {/* Toggle */}
        <Section title="Call Reminders">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-mail-text">Phone call before meetings</div>
              <div className="text-xs text-mail-subtle mt-0.5">{callEnabled ? 'AI will call you with meeting details' : 'Disabled'}</div>
            </div>
            <button onClick={() => setCallEnabled(!callEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 cursor-pointer border-none transition-colors ${callEnabled ? 'bg-green-500' : 'bg-neutral-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${callEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {callEnabled && phoneNumber && (
            <div className="flex items-center gap-2">
              <button onClick={handleTestCall} disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
                {testing ? <Loader2 size={12} className="animate-spin" /> : <TestTube size={12} />}
                {testing ? 'Calling...' : 'Send Test Call'}
              </button>
              {testResult && <span className={`text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>{testResult.message}</span>}
            </div>
          )}
        </Section>

        {/* Timing */}
        <Section title="Timing">
          <div className="flex gap-4">
            <div>
              <label className="text-[11px] font-medium text-mail-subtle mb-1 block">Remind before</label>
              <select value={reminderMinutes} onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none cursor-pointer">
                {[1, 2, 3, 5, 10, 15, 20, 30].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-mail-subtle mb-1 block">Timezone</label>
              <input value={timezone} readOnly className="px-3 py-2.5 rounded-lg border border-mail-border bg-mail-surface text-mail-muted text-xs outline-none w-[200px]" />
            </div>
          </div>
        </Section>

        {/* Quiet Hours */}
        <Section title="Quiet Hours">
          <div className="text-xs text-mail-subtle mb-3">No calls during these hours</div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] font-medium text-mail-subtle mb-1 block"><VolumeX size={10} className="inline mr-1" />From</label>
              <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} style={{ colorScheme: 'dark' }}
                className="px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-mail-subtle mb-1 block"><Volume2 size={10} className="inline mr-1" />To</label>
              <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} style={{ colorScheme: 'dark' }}
                className="px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none" />
            </div>
          </div>
        </Section>

        {/* How it works */}
        <Section title="How It Works">
          <div className="text-xs text-mail-muted leading-relaxed space-y-2">
            <p className="flex items-start gap-2 m-0"><Bell size={12} className="text-mail-accent shrink-0 mt-0.5" /> A scheduler checks your Google Calendar every 60 seconds.</p>
            <p className="flex items-start gap-2 m-0"><Phone size={12} className="text-mail-accent shrink-0 mt-0.5" /> {reminderMinutes} minutes before a meeting, an AI calls you with details.</p>
            <p className="flex items-start gap-2 m-0"><Shield size={12} className="text-mail-accent shrink-0 mt-0.5" /> Max 10 calls/hour. No calls during quiet hours. One call per meeting.</p>
          </div>
        </Section>

        {/* Logs */}
        {logs.length > 0 && (
          <Section title="Recent Activity">
            <div className="flex flex-col gap-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mail-surface border border-mail-border text-xs">
                  {log.status === 'triggered' || log.status === 'completed' ? (
                    <CheckCircle size={12} className="text-green-400 shrink-0" />
                  ) : (
                    <XCircle size={12} className="text-red-400 shrink-0" />
                  )}
                  <span className="flex-1 text-mail-muted truncate">{log.eventSummary || 'Meeting'}</span>
                  <span className="text-mail-subtle shrink-0">
                    {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-mail-border last:border-b-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-mail-card-header mb-3">{title}</div>
      {children}
    </div>
  );
}
