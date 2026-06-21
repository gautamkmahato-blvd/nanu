// app/mails/v1/scheduled/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Clock, Loader2, Send, Trash2, CheckCircle2,
  AlertCircle, X, Calendar, RefreshCw, Edit3,
  MailPlus, UserCheck, ChevronDown,
} from 'lucide-react';

type ScheduledEmail = {
  id: string;
  type: 'scheduled_send' | 'follow_up';
  threadId: string | null;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  body: string;
  isReply: boolean;
  scheduledAt: string;
  watchEmail: string | null;
  followUpHours: number | null;
  status: 'pending' | 'processing' | 'sent' | 'cancelled' | 'failed';
  sentAt: string | null;
  error: string | null;
  retryCount: number;
  createdAt: string;
};

type TabFilter = 'pending' | 'sent' | 'cancelled' | 'failed' | 'all';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: Clock },
  processing: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: Loader2 },
  sent: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
  cancelled: { bg: 'bg-zinc-500/10 border-zinc-500/20', text: 'text-zinc-400', icon: X },
  failed: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: AlertCircle },
};

const TABS: { value: TabFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

export default function ScheduledPage() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabFilter>('pending');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = tab === 'all' ? '' : `?status=${tab}`;
      const res = await fetch(`/api/v1/scheduled-emails${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setEmails(data.emails ?? []);
      setPendingCount(data.pendingCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/v1/scheduled-emails/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr}`;
  }

  function timeUntil(iso: string): string {
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return 'Due now';
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
    const days = Math.floor(hrs / 24);
    return `in ${days}d ${hrs % 24}h`;
  }

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-lg font-semibold m-0 flex items-center gap-2">
              <Clock size={18} className="text-mail-accent" /> Scheduled Emails
            </h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">
              {pendingCount > 0
                ? `${pendingCount} email${pendingCount > 1 ? 's' : ''} waiting to be sent`
                : 'No pending emails'}
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-mail-border pb-px">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors cursor-pointer bg-transparent ${
                tab === t.value
                  ? 'border-mail-accent text-mail-accent'
                  : 'border-transparent text-mail-subtle hover:text-mail-muted'
              }`}
            >
              {t.label}
              {t.value === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs mb-4">
            {error}
          </div>
        )}

        {/* Email list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-mail-subtle text-[13px] gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </div>
        ) : emails.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={40} strokeWidth={1} className="mx-auto mb-3 text-mail-subtle opacity-30" />
            <p className="text-[14px] text-mail-subtle m-0">
              {tab === 'pending' ? 'No pending scheduled emails' : `No ${tab} emails`}
            </p>
            <p className="text-[12px] text-mail-subtle mt-1 m-0">
              Use the Schedule button in the reply box to schedule emails
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email) => {
              const style = STATUS_STYLES[email.status] ?? STATUS_STYLES.pending;
              const StatusIcon = style.icon;
              const isPending = email.status === 'pending';

              return (
                <div
                  key={email.id}
                  className="rounded-xl border border-mail-border bg-mail-surface p-4 transition-colors hover:border-mail-border"
                >
                  {/* Top row: status + time + actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
                        <StatusIcon size={10} className={email.status === 'processing' ? 'animate-spin' : ''} />
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                      {email.type === 'follow_up' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                          <UserCheck size={10} /> Follow-up
                        </span>
                      )}
                      {email.isReply && (
                        <span className="text-[10px] text-mail-subtle">Reply</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => handleCancel(email.id)}
                          disabled={cancellingId === email.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-red-400 border border-red-500/20 bg-transparent hover:bg-red-500/5 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {cancellingId === email.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Trash2 size={10} />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subject + recipients */}
                  <div className="text-[13px] font-semibold text-mail-text mb-1 truncate">
                    {email.subject}
                  </div>
                  <div className="text-[11px] text-mail-subtle mb-2">
                    To: {email.toEmails.join(', ')}
                    {email.watchEmail && (
                      <span className="ml-2">· Watching: {email.watchEmail}</span>
                    )}
                  </div>

                  {/* Body preview */}
                  <div className="text-[12px] text-mail-muted leading-relaxed mb-3 line-clamp-2">
                    {email.body}
                  </div>

                  {/* Schedule time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-mail-subtle">
                      <Calendar size={11} />
                      {email.status === 'sent' && email.sentAt
                        ? `Sent ${formatTime(email.sentAt)}`
                        : `Scheduled for ${formatTime(email.scheduledAt)}`}
                    </div>
                    {isPending && (
                      <span className="text-[10px] text-mail-accent font-medium">
                        {timeUntil(email.scheduledAt)}
                      </span>
                    )}
                    {email.error && (
                      <span className="text-[10px] text-red-400 truncate max-w-[200px]" title={email.error}>
                        {email.error}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
