// app/mails/v1/ai-inbox/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AttentionType, PriorityLevel } from '@/lib/v1/priority';
import type { TimePeriod } from '@/lib/v1/queries/ai-inbox';
import {
  Loader2, RefreshCw, Sparkles, AlertTriangle, Target, TrendingUp,
  Clock, ArrowRight, CheckCircle2, Star, Circle, Inbox,
  ShieldAlert, Zap, CalendarDays, Info, Filter,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (matching API response)
// ---------------------------------------------------------------------------

type StatusGroup = 'needs_attention' | 'in_progress' | 'waiting' | 'snoozed' | 'done' | 'everything_else';


type EnrichedThread = {
  id: string; threadId: string; subject: string | null;
  fromEmail: string; fromName: string | null; snippet: string | null;
  receivedAt: string; isRead: boolean; status: string;
  messageCount: number; hasUnread: boolean; hasAttachments: boolean;
  priority: { score: number; level: PriorityLevel; attentionType: AttentionType };
  attentionLabels: AttentionType[];
  displaySummary: string;
  statusGroup: StatusGroup;
};

type ThreadGroup = { key: StatusGroup; label: string; threads: EnrichedThread[]; count: number };

type ApiResponse = {
  threads: EnrichedThread[];
  groups: ThreadGroup[];
  counts: {
    total: number; urgent: number; important: number;
    byAttention: Record<AttentionType, number>;
    byGroup: Record<StatusGroup, number>;
  };
  activeTimeFilter: TimePeriod;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ATTENTION_TABS: { key: AttentionType | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all', label: 'For You', icon: Sparkles, color: 'var(--mail-accent)' },
  { key: 'opportunity', label: 'Opportunity', icon: TrendingUp, color: '#22c55e' },
  { key: 'risk', label: 'Risk', icon: ShieldAlert, color: '#ef4444' },
  { key: 'action_required', label: 'Action Required', icon: Zap, color: '#f59e0b' },
  { key: 'deadline', label: 'Deadline', icon: CalendarDays, color: '#f97316' },
  { key: 'follow_up', label: 'Follow Up', icon: ArrowRight, color: '#3b82f6' },
  { key: 'information', label: 'Information', icon: Info, color: '#6b7280' },
];

const TIME_FILTERS: { key: TimePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '3days', label: 'Last 3 days' },
  { key: 'week', label: 'Last week' },
  { key: '15days', label: 'Last 15 days' },
  { key: 'month', label: 'Last month' },
  { key: 'all', label: 'All time' },
];

const GROUP_CONFIG: Record<StatusGroup, { icon: React.ElementType; color: string }> = {
  needs_attention: { icon: Zap, color: 'var(--mail-accent)' },
  in_progress: { icon: Clock, color: '#f59e0b' },
  waiting: { icon: ArrowRight, color: '#a78bfa' },
  everything_else: { icon: Inbox, color: '#6b7280' },
  snoozed: { icon: Clock, color: '#6b7280' },
  done: { icon: CheckCircle2, color: '#22c55e' },
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = { urgent: '#ef4444', important: '#f97316', normal: '#3b82f6', low: '#6b7280' };
const ATTENTION_COLORS: Record<AttentionType, string> = { risk: '#ef4444', opportunity: '#22c55e', deadline: '#f97316', action_required: '#f59e0b', follow_up: '#3b82f6', information: '#6b7280' };

const AVATAR_COLORS = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f'];
function getAvatarColor(name: string): string { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }
function initials(n: string | null, e: string): string { const s = n || e; const p = s.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : s.slice(0, 2).toUpperCase(); }
function displayName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }
function relTime(iso: string): string { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'now'; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; const d = Math.floor(h / 24); return `${d}d`; }
function attentionLabel(type: AttentionType): string { return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIInboxComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') ?? 'all') as AttentionType | 'all';
  const initialTime = (searchParams.get('time') ?? 'all') as TimePeriod;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<AttentionType | 'all'>(initialFilter);
  const [activeTime, setActiveTime] = useState<TimePeriod>(initialTime);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('filter', activeFilter);
      if (activeTime !== 'all') params.set('time', activeTime);
      const res = await fetch(`/api/v1/ai-inbox?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, [activeFilter, activeTime]);

  useEffect(() => { load(); }, [load]);

  const counts = data?.counts;
  const groups = data?.groups ?? [];

  return (
    <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-mail-border shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg font-semibold m-0">AI Priority Inbox</h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">
              {counts ? `${counts.total} conversations · ${counts.urgent} urgent · ${counts.important} important` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Time filter */}
            <select
              value={activeTime}
              onChange={(e) => setActiveTime(e.target.value as TimePeriod)}
              className="px-2.5 py-1.5 rounded-lg border border-mail-border bg-mail-surface text-mail-muted text-xs outline-none cursor-pointer"
            >
              {TIME_FILTERS.map((tf) => (
                <option key={tf.key} value={tf.key}>{tf.label}</option>
              ))}
            </select>
            <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Attention filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {ATTENTION_TABS.map((tab) => {
            const count = tab.key === 'all' ? (counts?.total ?? 0) : (counts?.byAttention[tab.key] ?? 0);
            const isActive = activeFilter === tab.key;
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border shrink-0"
                style={{ borderColor: isActive ? tab.color : 'var(--mail-border)', background: isActive ? `${tab.color}12` : 'transparent', color: isActive ? tab.color : 'var(--mail-muted)' }}>
                <Icon size={13} /> {tab.label} {count > 0 && <span className="text-[10px] opacity-60 font-mono">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {error && <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">{error}</div>}

        {loading && !data && (
          <div className="flex items-center justify-center py-16 text-mail-subtle text-[13px] gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading priority inbox...
          </div>
        )}

        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-mail-subtle">
            <Inbox size={36} strokeWidth={1} className="opacity-30 mb-3" />
            <p className="text-[14px] m-0">No emails for this filter</p>
          </div>
        )}

        {groups.map((group) => {
          const cfg = GROUP_CONFIG[group.key];
          const Icon = cfg.icon;
          return (
            <div key={group.key} className="px-6">
              {/* Group header */}
              <div className="flex items-center gap-2 pt-5 pb-2 sticky top-0 bg-mail-bg z-10">
                <Icon size={14} style={{ color: cfg.color }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{group.label}</span>
                <span className="text-[11px] text-mail-subtle font-mono">({group.count})</span>
              </div>

              {/* Threads */}
                <div className="flex flex-col gap-2.5">
                  {group.threads.map((thread) => (
                    <ThreadRow key={thread.id} thread={thread} activeFilter={activeFilter}
                    onClick={() => router.push(`/mails/v1/ai-email-details/${thread.id}`)} />))}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thread Row
// ---------------------------------------------------------------------------

function ThreadRow({ thread, onClick, activeFilter }: { thread: EnrichedThread; onClick: () => void; activeFilter: AttentionType | 'all' }) {
  const color = getAvatarColor(thread.fromName || thread.fromEmail);
  const prColor = PRIORITY_COLORS[thread.priority.level];
  const attnColor = ATTENTION_COLORS[thread.priority.attentionType];

  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-mail-hover transition-colors mb-0.5 group border border-[var(--mail-border)]">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0" style={{ background: color }}>
        {initials(thread.fromName, thread.fromEmail)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[13px] truncate ${thread.hasUnread ? 'font-semibold text-mail-text' : 'font-medium text-mail-muted'}`}>
            {displayName(thread.fromName, thread.fromEmail)}
          </span>
          {/* Attention badge — show the tab-relevant label, not always the primary type */}
          {(() => {
            const badgeType = activeFilter !== 'all' && thread.attentionLabels.includes(activeFilter)
              ? activeFilter
              : thread.priority.attentionType;
            const badgeColor = ATTENTION_COLORS[badgeType];
            return (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: `${badgeColor}15`, color: badgeColor }}>
                {attentionLabel(badgeType)}
              </span>
            );
          })()}
        </div>
        <div className={`text-[13px] truncate mb-0.5 ${thread.hasUnread ? 'text-mail-text' : 'text-mail-muted'}`}>
          {thread.displaySummary}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-mail-subtle">{relTime(thread.receivedAt)}</span>
        {/* Priority dot */}
        <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: prColor }} title={`Priority: ${thread.priority.level} (${thread.priority.score})`} />
      </div>
    </div>
  );
}
