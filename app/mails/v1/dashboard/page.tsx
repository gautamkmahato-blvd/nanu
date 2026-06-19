// app/mails/v1/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, AlertTriangle, Clock, ChevronRight, Info, ArrowRight,
  RefreshCw, Target, Zap, Sparkles, Calendar, Loader2, X,
} from 'lucide-react';
import CalendarWidget from './_components/CalendarWidget';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PriorityLevel = 'urgent' | 'important' | 'normal' | 'low';

type StatCards = { opportunities: number; risks: number; deadlines: number; followUps: number; information: number; actionRequired: number };
type TodaysFocus = { attentionCount: number; urgentCount: number; opportunityCount: number; riskCount: number; followUpCount: number; estimatedWorkloadMinutes: number; headline: string };
type ActionItem = { id: string; threadId: string; subject: string | null; fromName: string | null; fromEmail: string; primaryTag: string | null; attentionLabels: string[]; priorityScore: number; priorityLevel: PriorityLevel; actionTimeframe: string; recommendedAction: string };
type BriefingItem = { emoji: string; text: string };
type DashboardData = { stats: StatCards; todaysFocus: TodaysFocus; actionRequired: { count: number; items: ActionItem[] }; briefing: BriefingItem[]; totalEmails: number };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ATTENTION_BADGE: Record<string, { label: string; color: string }> = {
  risk: { label: 'Risk', color: '#ef4444' }, opportunity: { label: 'Opportunity', color: '#22c55e' },
  deadline: { label: 'Deadline', color: '#f97316' }, action_required: { label: 'Action required', color: '#ef4444' },
  follow_up: { label: 'Follow up', color: '#3b82f6' }, information: { label: 'Information', color: '#6b7280' },
};

const TIMEFRAME_LABELS: Record<string, string> = {
  immediately: 'Immediate', next_1_hour: 'Next 1h', next_6_hours: 'Next 6h', next_12_hours: 'Next 12h',
  next_24_hours: 'Tomorrow', next_3_days: 'Next 3d', next_1_week: 'This week', next_1_month: 'This month', no_action_needed: '',
};

const STAT_CONFIG: { key: keyof StatCards; label: string; icon: React.ElementType; color: string; filter: string }[] = [
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp, color: '#22c55e', filter: 'opportunity' },
  { key: 'risks', label: 'Risks', icon: AlertTriangle, color: '#ef4444', filter: 'risk' },
  { key: 'deadlines', label: 'Deadlines', icon: Clock, color: '#f97316', filter: 'deadline' },
  { key: 'followUps', label: 'Follow Ups', icon: ChevronRight, color: '#3b82f6', filter: 'follow_up' },
  { key: 'information', label: 'Information', icon: Info, color: '#6b7280', filter: 'information' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function greeting(): string { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function senderName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncModal, setSyncModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/dashboard');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setData(json);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/v1/sync', { method: 'POST' });
      await loadDashboard();
    } catch {}
    finally { setSyncing(false); setSyncModal(false); }
  };

  if (loading && !data) return <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle"><Loader2 size={20} className="animate-spin" /></div>;
  if (error && !data) return <div className="bg-mail-bg h-full flex items-center justify-center text-red-400">{error}</div>;
  if (!data) return null;

  const { stats, todaysFocus, actionRequired, briefing } = data;

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-semibold m-0">{greeting()} 👋</h1>
          <p className="text-sm text-mail-subtle mt-1 m-0">Here&apos;s what&apos;s happening in your inbox today.</p>
        </div>
        <button onClick={() => setSyncModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-mail-border bg-mail-surface text-mail-text text-[13px] cursor-pointer hover:bg-mail-hover transition-colors">
          <RefreshCw size={14} /> Sync now
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-8 pb-5">
      {STAT_CONFIG.map((s) => {
          const Icon = s.icon;
          const count = stats[s.key];
          return (
            <div key={s.key} className="rounded-xl border border-mail-border bg-mail-surface p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-mail-subtle mb-0.5">{s.label}</div>
                <div className='w-full flex items-center gap-1 justify-between'>
                  <div className="text-2xl font-bold">{count}</div>
                  <button onClick={() => router.push(`/mails/v1/ai-inbox?filter=${s.filter}`)}
                    className="text-[11px] font-medium bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 mt-0.5 transition-colors hover:underline"
                    style={{ color: s.color }}>
                    View all <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 px-8 pb-8">
      {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Today's Focus */}
          {/* <div className="rounded-xl border border-mail-border p-6" style={{ background: 'linear-gradient(135deg, var(--mail-surface) 0%, #1a1a2e 100%)' }}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-mail-accent mb-4">
              <Target size={14} />
              <span>Today&apos;s Focus</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">AI Generated</span>
            </div>

            <h2 className="text-xl font-semibold m-0 mb-5 leading-snug">{todaysFocus.headline}</h2>

            <div className="flex gap-8 mb-5">
              <FocusStat icon={Target} count={todaysFocus.attentionCount} label="Need Attention" color="#a78bfa" />
              <FocusStat icon={AlertTriangle} count={todaysFocus.urgentCount} label="Urgent" color="#ef4444" />
              <FocusStat icon={TrendingUp} count={todaysFocus.opportunityCount} label="Opportunities" color="#22c55e" />
              <FocusStat icon={ChevronRight} count={todaysFocus.followUpCount} label="Follow Ups" color="#3b82f6" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[13px] text-mail-subtle">
                <Clock size={13} className="inline mr-1.5" />
                Estimated workload <strong className="text-mail-text">{todaysFocus.estimatedWorkloadMinutes} min</strong>
              </span>
              <button onClick={() => router.push('/mails/v1/ai-inbox')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-mail-accent hover:bg-mail-accent-hover text-white text-[13px] font-medium cursor-pointer border-none transition-colors">
                Review Priority Inbox <ArrowRight size={14} />
              </button>
            </div>
          </div> */}

          {/* Action Required */}
          <div className="rounded-xl border border-mail-border bg-mail-surface p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <Zap size={14} />
                <span className='text-neutral-400'>Action Required</span>
                {/* <span className="text-xs text-mail-subtle font-mono font-normal">{actionRequired.count}</span> */}
              </div>
              <button onClick={() => router.push('/mails/v1/ai-inbox?filter=action_required')}
                className="text-xs text-mail-subtle bg-transparent border-none cursor-pointer hover:text-mail-muted transition-colors flex items-center gap-1">
                View all <ArrowRight size={11} />
              </button>
            </div>

            {actionRequired.count === 0 ? (
              <p className="text-mail-subtle text-[13px] m-0">No actions required right now.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {actionRequired.items.map((item) => <ActionRow key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Calendar */}
          <CalendarWidget />

          {/* AI Briefing */}
          <div className="rounded-xl border border-mail-border bg-mail-surface p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-mail-accent">
                <Sparkles size={14} /> AI Briefing
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">AI Generated</span>
            </div>

            <p className="text-[13px] text-mail-subtle m-0 mb-4">Your AI briefing for today.</p>

            {briefing.length === 0 ? (
              <p className="text-mail-subtle text-[13px] m-0">No notable items today.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {briefing.map((item, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <span className="text-base shrink-0 mt-0.5">{item.emoji}</span>
                    <p className="text-[13px] text-mail-muted m-0 leading-relaxed break-words">{item.text}</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync modal */}
      {syncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl border border-mail-border bg-mail-surface p-6 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold m-0 flex items-center gap-2">
                <RefreshCw size={16} className="text-mail-accent" /> Sync Emails
              </h3>
              <button onClick={() => setSyncModal(false)} className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] text-mail-muted m-0 mb-2">This will sync your latest emails from Gmail and run AI analysis on new messages.</p>
            <p className="text-[12px] text-mail-subtle m-0 mb-5">This may take a few minutes depending on the number of new emails. Avoid clicking multiple times.</p>
            <div className="flex gap-2">
              <button onClick={() => setSyncModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-subtle text-xs cursor-pointer hover:bg-mail-hover transition-colors">
                Cancel
              </button>
              <button onClick={handleSync} disabled={syncing}
                className="flex-[2] py-2.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {syncing ? <><Loader2 size={13} className="animate-spin" /> Syncing...</> : <><RefreshCw size={13} /> Start Sync</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FocusStat({ icon: Icon, count, label, color }: { icon: React.ElementType; count: number; label: string; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={16} style={{ color }} />
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <div className="text-xs text-mail-subtle">{label}</div>
    </div>
  );
}

function ActionRow({ item }: { item: ActionItem }) {
  const router = useRouter();
  const timeLabel = TIMEFRAME_LABELS[item.actionTimeframe] ?? item.actionTimeframe;

  const primaryAttention = item.attentionLabels.find((l) => l !== 'information') ?? 'information';
  const colorMap: Record<string, string> = { risk: '#ef4444', opportunity: '#22c55e', deadline: '#f97316', action_required: '#f59e0b', follow_up: '#3b82f6', information: '#a1a1aa' };
  const accentColor = colorMap[primaryAttention] ?? '#a1a1aa';
  const attentionLabel = ATTENTION_BADGE[primaryAttention]?.label ?? '';

  return (
    <button onClick={() => router.push(`/mails/v1/ai-email-details/${item.id}`)}
      className="flex items-center gap-4 p-4 rounded-xl border border-mail-border bg-mail-surface text-left cursor-pointer hover:border-mail-subtle transition-colors w-full">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0" style={{ background: `${accentColor}20`, color: accentColor }}>
        {senderName(item.fromName, item.fromEmail).slice(0, 1).toUpperCase()}
      </div>

      {/* Sender + category */}
      <div className="w-[100px] shrink-0">
        <div className="text-sm font-semibold text-white">{senderName(item.fromName, item.fromEmail).split(' ')[0]}</div>
        {attentionLabel && (
          <div className="text-[11px] font-medium mt-0.5" style={{ color: accentColor }}>{attentionLabel}</div>        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium truncate text-mail-muted">{item.subject || '(no subject)'}</span>
          {timeLabel && (
            <span className="flex items-center gap-1 text-[10px] font-medium shrink-0 px-2 py-0.5 rounded-full border border-mail-border bg-mail-chip text-mail-muted">
              <Clock size={10} /> {timeLabel}
            </span>
          )}
        </div>
        <div className="text-xs text-mail-subtle leading-relaxed truncate">{item.recommendedAction}</div>
      </div>

      {/* Arrow */}
      <ChevronRight size={16} className="text-mail-subtle shrink-0" />
    </button>
  );
}