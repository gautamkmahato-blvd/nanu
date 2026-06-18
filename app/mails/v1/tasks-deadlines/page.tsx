// app/mails/v1/tasks-deadlines/page.tsx
'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2, RefreshCw, ListChecks, AlertCircle, CalendarDays, Clock,
  CalendarClock, Calendar, Pin, ChevronRight, Square, CheckSquare, User,
  PieChart, TrendingUp, Target, ArrowRight, X, Sparkles, BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskItem = { task: string; owner: 'sender' | 'recipient' | 'unknown'; due_date: string | null };
type PriorityLevel = 'urgent' | 'important' | 'normal' | 'low';
type TaskEmailItem = { emailId: string; threadId: string; primaryTag: string; subject: string | null; summary: string; dueDate: string; bucket: string; tasks: TaskItem[]; priorityScore: number; priorityLevel: PriorityLevel };
type GroupedTasks = { overdue: TaskEmailItem[]; today: TaskEmailItem[]; tomorrow: TaskEmailItem[]; next3Days: TaskEmailItem[]; thisWeek: TaskEmailItem[]; later: TaskEmailItem[] };
type ApiResponse = { grouped: GroupedTasks; counts: { overdue: number; today: number; tomorrow: number; next3Days: number; thisWeek: number; later: number; total: number } };

type Intelligence = {
  summary: { summary: string | null };
  recommendedAction: { recommendedAction: string | null };
  actionTimeframe: { raw: string; label: string; urgency: string; deadline: string | null };
  actionItems: { items: { task: string; owner: string; dueDate: string | null }[] };
  keyInsights: { insights: string[] };
  hasAiData: boolean;
};

type DetailResponse = {
  email: { id: string; subject: string | null; fromEmail: string; fromName: string | null; bodyText: string | null; snippet: string | null; receivedAt: string };
  intelligence: Intelligence;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type BucketKey = keyof GroupedTasks | 'all';

const BUCKETS: { key: BucketKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all', label: 'All', icon: ListChecks, color: '#a78bfa' },
  { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: '#ef4444' },
  { key: 'today', label: 'Today', icon: CalendarDays, color: '#f59e0b' },
  { key: 'tomorrow', label: 'Tomorrow', icon: CalendarClock, color: '#f97316' },
  { key: 'next3Days', label: 'Next 3 Days', icon: Calendar, color: '#3b82f6' },
  { key: 'thisWeek', label: 'This Week', icon: Clock, color: '#6366f1' },
  { key: 'later', label: 'Later', icon: Pin, color: '#6b7280' },
];

const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#ef4444' }, important: { label: 'High', color: '#f97316' },
  normal: { label: 'Medium', color: '#3b82f6' }, low: { label: 'Low', color: '#6b7280' },
};

const URGENCY_COLORS: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', none: '#6b7280' };

function formatDueDate(iso: string): string { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function displayName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }
function formatTime(iso: string): string { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function TasksDeadlinesPage() {
  return (
    <Suspense fallback={
      <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle text-sm">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading...
      </div>
    }>
      <TasksDeadlines />
    </Suspense>
  );
}



function TasksDeadlines() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') ?? 'all') as BucketKey;
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<BucketKey>(initialTab);
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  // Right panel
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/tasks-deadlines');
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      setData(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleTask = (key: string) => {
    setDoneTasks((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  // Fetch detail when selection changes
  useEffect(() => {
    if (!selectedTaskId) { setDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true); setDetail(null);
    fetch(`/api/v1/ai-email-details/${selectedTaskId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedTaskId]);

  if (loading && !data) return <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle"><Loader2 size={20} className="animate-spin" /></div>;
  if (error && !data) return <div className="bg-mail-bg h-full flex items-center justify-center text-red-400">{error}</div>;
  if (!data) return null;

  const { grouped, counts } = data;

  // Compute stats for productivity panel
  const allTasks = Object.values(grouped).flat();
  const selectedTask = allTasks.find((t) => t.emailId === selectedTaskId) ?? null;
  const totalTaskItems = allTasks.reduce((sum, item) => sum + item.tasks.length, 0);
  const doneCount = doneTasks.size;
  const yourTasks = allTasks.reduce((sum, item) => sum + item.tasks.filter((t) => t.owner === 'recipient').length, 0);
  const senderTasks = allTasks.reduce((sum, item) => sum + item.tasks.filter((t) => t.owner === 'sender').length, 0);
  const priorityCounts: Record<PriorityLevel, number> = { urgent: 0, important: 0, normal: 0, low: 0 };
  for (const item of allTasks) priorityCounts[item.priorityLevel]++;

  return (
    <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {counts.overdue > 0 && (
            <div className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={12} /> {counts.overdue} overdue
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-mail-accent-soft text-mail-accent border border-mail-accent/20">
            <ListChecks size={12} /> {counts.total} tasks
          </div>
          {counts.today > 0 && (
            <div className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border" style={{ borderColor: '#f59e0b30', color: '#f59e0b', background: '#f59e0b08' }}>
              <CalendarDays size={12} /> {counts.today} due today
            </div>
          )}
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 px-6 py-3 overflow-x-auto shrink-0">
        {BUCKETS.map((b) => {
          const count = b.key === 'all' ? counts.total : (counts[b.key as keyof typeof counts] ?? 0);
          const isActive = activeTab === b.key;
          const Icon = b.icon;
          return (
            <button key={b.key} onClick={() => setActiveTab(b.key)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border shrink-0"
              style={{ borderColor: isActive ? b.color : 'var(--mail-border)', background: isActive ? `${b.color}12` : 'transparent', color: isActive ? b.color : 'var(--mail-muted)' }}>
              <Icon size={13} /> <span>{b.label}</span>
              {typeof count === 'number' && count > 0 && <span className="text-[10px] opacity-60 font-mono">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* 2-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: task list */}
        <div className="flex-1 min-w-0 overflow-y-auto sidebar-scroll px-6 pb-6">
          {counts.total === 0 && (
            <div className="py-20 text-center text-mail-subtle text-[14px] flex flex-col items-center gap-3">
              <CheckSquare size={32} strokeWidth={1} className="opacity-30" /> No tasks or deadlines.
            </div>
          )}

          {BUCKETS.filter((b) => b.key !== 'all').map((b) => {
            const items = grouped[b.key as keyof GroupedTasks];
            if (!items || items.length === 0) return null;
            if (activeTab !== 'all' && activeTab !== b.key) return null;
            const Icon = b.icon;

            return (
              <div key={b.key} className="mb-6">
                <div className="flex items-center gap-2 py-2.5 mb-2 border-b" style={{ borderColor: `${b.color}20` }}>
                  <Icon size={14} style={{ color: b.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: b.color }}>{b.label}</span>
                  <span className="text-[11px] text-mail-subtle font-mono">{items.length}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {items.map((item) => {
                    const pr = PRIORITY_CONFIG[item.priorityLevel];
                    const isSelected = selectedTaskId === item.emailId;
                    return (
                      <div key={item.emailId} onClick={() => setSelectedTaskId(item.emailId)}
                        className={`rounded-xl border p-4 cursor-pointer transition-all group ${isSelected ? 'border-mail-accent bg-mail-accent-soft' : 'border-mail-border bg-mail-surface hover:border-mail-subtle'}`}>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[14px] font-medium text-mail-text flex-1 truncate">{item.subject || '(no subject)'}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-chip text-mail-subtle shrink-0">{item.primaryTag}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: `${pr.color}12`, color: pr.color }}>{pr.label}</span>
                          <ChevronRight size={14} className="text-mail-subtle shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {item.summary && <div className="text-[12px] text-mail-subtle mb-3 truncate">{item.summary}</div>}

                        <div className="mb-3 flex flex-col gap-1">
                          {item.tasks.map((task, i) => {
                            const taskKey = `${item.emailId}-${i}`;
                            const isDone = doneTasks.has(taskKey);
                            return (
                              <div key={i} className="flex items-start gap-2 text-[13px]" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => toggleTask(taskKey)} className="mt-0.5 p-0 border-none bg-transparent cursor-pointer shrink-0 text-mail-subtle hover:text-mail-accent transition-colors">
                                  {isDone ? <CheckSquare size={14} className="text-green-400" /> : <Square size={14} />}
                                </button>
                                <span className={`flex-1 ${isDone ? 'line-through text-mail-subtle' : 'text-mail-muted'}`}>{task.task}</span>
                                {task.owner !== 'unknown' && (
                                  <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: task.owner === 'recipient' ? '#f59e0b' : '#6b7280' }}>
                                    <User size={10} /> {task.owner === 'recipient' ? 'you' : 'sender'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: b.color }}>
                          <Clock size={11} /> Due: {formatDueDate(item.dueDate)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="w-[340px] shrink-0 border-l border-mail-border overflow-y-auto sidebar-scroll">

          {!selectedTask ? (
            <ProductivityPanel counts={counts} priorityCounts={priorityCounts} totalTaskItems={totalTaskItems} doneCount={doneCount} yourTasks={yourTasks} senderTasks={senderTasks} grouped={grouped} />

          ) : (
            <TaskDetailPanel
              task={selectedTask}
              detail={detail}
              loading={detailLoading}
              onClose={() => setSelectedTaskId(null)}
              onOpenEmail={() => router.push(`/mails/v1/ai-email-details/${selectedTaskId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Productivity Panel (default right panel)
// ---------------------------------------------------------------------------

function ProductivityPanel({ counts, priorityCounts, totalTaskItems, doneCount, yourTasks, senderTasks, grouped }: {
  counts: ApiResponse['counts']; priorityCounts: Record<PriorityLevel, number>;
  totalTaskItems: number; doneCount: number; yourTasks: number; senderTasks: number;
  grouped: GroupedTasks;
}) {
  const pct = totalTaskItems > 0 ? Math.round((doneCount / totalTaskItems) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={15} className="text-mail-accent" />
        <h3 className="text-sm font-semibold m-0">Task Overview</h3>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-5 mb-6 p-4 rounded-xl border border-mail-border bg-mail-surface">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="var(--mail-border)" strokeWidth="6" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="var(--mail-accent)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-mail-text">{pct}%</span>
          </div>
        </div>
        <div>
          <div className="text-[13px] font-medium text-mail-text mb-1">{doneCount} of {totalTaskItems} done</div>
          <div className="text-[11px] text-mail-subtle">Check off tasks to track progress</div>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2.5">By Priority</div>
        <div className="flex flex-col gap-1.5">
          {(['urgent', 'important', 'normal', 'low'] as PriorityLevel[]).map((level) => {
            const cfg = PRIORITY_CONFIG[level];
            const count = priorityCounts[level];
            if (count === 0) return null;
            const maxCount = Math.max(...Object.values(priorityCounts), 1);
            return (
              <div key={level} className="flex items-center gap-2.5">
                <span className="text-[11px] font-medium w-14 shrink-0" style={{ color: cfg.color }}>{cfg.label}</span>
                <div className="flex-1 h-2 rounded-full bg-mail-chip overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(count / maxCount) * 100}%`, background: cfg.color }} />
                </div>
                <span className="text-[11px] text-mail-muted font-mono w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Owner split */}
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2.5">By Owner</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-mail-border bg-mail-surface p-3 text-center">
            <div className="text-xl font-bold text-mail-accent">{yourTasks}</div>
            <div className="text-[10px] text-mail-subtle mt-0.5">Assigned to you</div>
          </div>
          <div className="rounded-lg border border-mail-border bg-mail-surface p-3 text-center">
            <div className="text-xl font-bold text-mail-muted">{senderTasks}</div>
            <div className="text-[10px] text-mail-subtle mt-0.5">Assigned to sender</div>
          </div>
        </div>
      </div>

      {/* Deadline timeline */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2.5">Deadline Timeline</div>
        <div className="flex flex-col gap-1">
          {BUCKETS.filter((b) => b.key !== 'all').map((b) => {
            const count = b.key === 'all' ? 0 : (grouped[b.key as keyof GroupedTasks]?.length ?? 0);
            if (count === 0) return null;
            const Icon = b.icon;
            return (
              <div key={b.key} className="flex items-center gap-2.5 py-1.5">
                <Icon size={12} style={{ color: b.color }} />
                <span className="text-[12px] text-mail-muted flex-1">{b.label}</span>
                <span className="text-[12px] font-bold" style={{ color: b.color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Detail Panel (on task click)
// ---------------------------------------------------------------------------

function TaskDetailPanel({ task, detail, loading, onClose, onOpenEmail }: {
  task: TaskEmailItem; detail: DetailResponse | null; loading: boolean;
  onClose: () => void; onOpenEmail: () => void;
}) {
  const pr = PRIORITY_CONFIG[task.priorityLevel];
  const ai = detail?.intelligence;

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold m-0 flex items-center gap-2">
          <Target size={14} className="text-mail-accent" /> Task Detail
        </h3>
        <button onClick={onClose} title="Back to overview" className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
          <X size={15} />
        </button>
      </div>

      {/* Subject */}
      <div className="text-[14px] font-semibold text-mail-text mb-2">{task.subject || '(no subject)'}</div>

      {/* Meta badges */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-chip text-mail-subtle">{task.primaryTag}</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${pr.color}12`, color: pr.color }}>{pr.label}</span>
        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-mail-border text-mail-subtle">
          <Clock size={9} /> {formatDueDate(task.dueDate)}
        </span>
      </div>

      {/* Summary */}
      {task.summary && (
        <div className="rounded-lg border border-mail-border bg-mail-surface p-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1.5">Summary</div>
          <div className="text-[12px] text-mail-muted leading-relaxed">{task.summary}</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6 text-mail-subtle text-xs gap-2">
          <Loader2 size={13} className="animate-spin" /> Loading details...
        </div>
      )}

      {/* AI Intelligence */}
      {!loading && ai?.hasAiData && (
        <>
          {ai.recommendedAction.recommendedAction && (
            <div className="rounded-lg border border-mail-accent/20 bg-mail-surface p-3 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-mail-accent mb-1.5">Recommended Action</div>
              <div className="text-[12px] text-mail-muted leading-relaxed">{ai.recommendedAction.recommendedAction}</div>
            </div>
          )}

          {ai.actionTimeframe.raw !== 'no_action_needed' && (
            <div className="rounded-lg border border-mail-border bg-mail-surface p-3 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1.5">Timeframe</div>
              <span className="text-[13px] font-semibold" style={{ color: URGENCY_COLORS[ai.actionTimeframe.urgency] ?? '#6b7280' }}>
                {ai.actionTimeframe.label}
              </span>
              {ai.actionTimeframe.deadline && <span className="text-[11px] text-mail-subtle ml-2">by {ai.actionTimeframe.deadline}</span>}
            </div>
          )}

          {ai.keyInsights.insights.length > 0 && (
            <div className="rounded-lg border border-mail-border bg-mail-surface p-3 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1.5">Key Insights</div>
              {ai.keyInsights.insights.map((ins, i) => (
                <div key={i} className="flex gap-1.5 mb-1 text-[12px] text-mail-muted"><span className="text-mail-subtle">•</span><span>{ins}</span></div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Email context */}
      {!loading && detail?.email && (
        <div className="rounded-lg border border-mail-border bg-mail-surface p-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1.5">Email Context</div>
          <div className="text-[12px] text-mail-muted mb-1">
            From: <span className="text-mail-text font-medium">{displayName(detail.email.fromName, detail.email.fromEmail)}</span>
          </div>
          <div className="text-[11px] text-mail-subtle mb-2">{formatTime(detail.email.receivedAt)}</div>
          <div className="text-[12px] text-mail-subtle leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {detail.email.bodyText?.slice(0, 300) || detail.email.snippet || ''}
          </div>
        </div>
      )}

      {/* Open email button */}
      <button onClick={onOpenEmail}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-medium cursor-pointer border-none transition-colors mt-2">
        Open Email <ArrowRight size={12} />
      </button>
    </div>
  );
}