// app/mails/v1/board/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '../_components/ui/ToastProvider';
import {
  Loader2, RefreshCw, GripVertical, Star, MoreHorizontal,
  Inbox, Clock, Hourglass, CheckCircle2, Archive, Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BoardEmail = {
  id: string; threadId: string; subject: string | null; fromEmail: string;
  fromName: string | null; receivedAt: string; status: string; isStarred: boolean;
  summary: string | null; primaryTag: string | null; sentiment: string | null;
  relationshipType: string | null; urgencyScore: number;
};

type BoardColumn = { key: string; label: string; emails: BoardEmail[]; count: number };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COLUMN_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  new: { icon: Inbox, color: '#3b82f6' },
  in_progress: { icon: Clock, color: '#f59e0b' },
  waiting: { icon: Hourglass, color: '#a78bfa' },
  done: { icon: CheckCircle2, color: '#22c55e' },
  archived: { icon: Archive, color: '#6b7280' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' }, { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' }, { value: 'done', label: 'Done' }, { value: 'archived', label: 'Archived' },
];

const SENTIMENT_EMOJI: Record<string, string> = { positive: '🟢', neutral: '🟡', negative: '🔴' };

const REL_COLORS: Record<string, string> = {
  client: '#22c55e', partner: '#3b82f6', lead: '#8b5cf6', investor: '#f59e0b',
  vendor: '#6366f1', coworker: '#06b6d4', other: '#6b7280',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }
function relativeTime(iso: string): string { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'now'; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; const d = Math.floor(h / 24); if (d < 7) return `${d}d`; return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function capitalize(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function BoardPage() {
  return <ToastProvider><BoardContent /></ToastProvider>;
}

function BoardContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragEmailRef = useRef<{ id: string; sourceColumn: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/board');
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const data = await res.json();
      setColumns(data.columns); setTotal(data.total);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = useCallback(async (emailId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/emails/${emailId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error('Failed');
      showToast(`Moved to ${capitalize(newStatus)}`, 'success');
      setColumns((prev) => {
        let movedEmail: BoardEmail | undefined;
        const next = prev.map((col) => {
          const found = col.emails.find((e) => e.id === emailId);
          if (found) movedEmail = { ...found, status: newStatus };
          const filtered = col.emails.filter((e) => e.id !== emailId);
          return { ...col, emails: filtered, count: filtered.length };
        });
        if (movedEmail) {
          const target = next.find((c) => c.key === newStatus);
          if (target) { target.emails.unshift(movedEmail); target.count = target.emails.length; }
        }
        return next;
      });
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed', 'error'); }
  }, [showToast]);

  // Drag & Drop
  const handleDragStart = useCallback((e: React.DragEvent, emailId: string, sourceColumn: string) => {
    dragEmailRef.current = { id: emailId, sourceColumn };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', emailId);
    const el = e.currentTarget as HTMLElement | null;
    if (el) setTimeout(() => { el.style.opacity = '0.4'; }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement | null;
    if (el) el.style.opacity = '1';
    dragEmailRef.current = null; setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnKey: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    if (dragEmailRef.current && dragEmailRef.current.sourceColumn !== columnKey) setDragOverColumn(columnKey);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumn: string) => {
    e.preventDefault(); setDragOverColumn(null);
    const data = dragEmailRef.current;
    if (!data || data.sourceColumn === targetColumn) return;
    changeStatus(data.id, targetColumn); dragEmailRef.current = null;
  }, [changeStatus]);

  if (loading) return <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle"><Loader2 size={20} className="animate-spin" /></div>;
  if (error) return <div className="bg-mail-bg h-full flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-mail-border shrink-0">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {columns.map((col) => {
              const cfg = COLUMN_CONFIG[col.key] ?? COLUMN_CONFIG.new;
              const Icon = cfg.icon;
              return (
                <div key={col.key} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${cfg.color}30`, color: cfg.color, background: `${cfg.color}08` }}>
                  <Icon size={12} />
                  <span>{col.label}</span>
                  <span className="font-bold">{col.count}</span>
                </div>
              );
            })}
            <span className="text-[11px] text-mail-subtle font-mono">{total} total</span>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 flex gap-3 px-4 py-4 overflow-x-auto overflow-y-hidden">
        {columns.map((column) => {
          const cfg = COLUMN_CONFIG[column.key] ?? COLUMN_CONFIG.new;
          const Icon = cfg.icon;
          const isDrop = dragOverColumn === column.key;

          return (
            <div key={column.key}
              onDragOver={(e) => handleDragOver(e, column.key)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, column.key)}
              className={`flex flex-col rounded-xl border overflow-hidden shrink-0 w-[280px] transition-all duration-150 ${isDrop ? '' : 'bg-mail-surface border-mail-border'}`}
              style={isDrop ? { background: `${cfg.color}06`, border: `2px dashed ${cfg.color}50` } : undefined}>

              {/* Column header */}
              <div className="flex items-center gap-2 px-3.5 py-3 shrink-0" style={{ borderBottom: `2px solid ${cfg.color}25` }}>
                <Icon size={15} style={{ color: cfg.color }} />
                <span className="text-[13px] font-semibold" style={{ color: cfg.color }}>{column.label}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto font-mono" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                  {column.count}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto sidebar-scroll p-2 flex flex-col gap-1.5 min-h-[100px]">
                {column.emails.length === 0 && (
                  <div className="py-8 text-center text-[12px] transition-colors" style={{ color: isDrop ? cfg.color : 'var(--mail-subtle)' }}>
                    {isDrop ? 'Drop here' : 'No emails'}
                  </div>
                )}

                {column.emails.map((email) => (
                  <KanbanCard key={email.id} email={email} columnKey={column.key} columnColor={cfg.color}
                    onClick={() => router.push(`/mails/v1/ai-email-details/${email.id}`)}
                    onStatusChange={(s) => changeStatus(email.id, s)}
                    onDragStart={(e) => handleDragStart(e, email.id, column.key)}
                    onDragEnd={handleDragEnd} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Card
// ---------------------------------------------------------------------------

function KanbanCard({ email, columnKey, columnColor, onClick, onStatusChange, onDragStart, onDragEnd }: {
  email: BoardEmail; columnKey: string; columnColor: string;
  onClick: () => void; onStatusChange: (s: string) => void;
  onDragStart: (e: React.DragEvent) => void; onDragEnd: (e: React.DragEvent) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const relColor = REL_COLORS[email.relationshipType ?? 'other'] ?? '#6b7280';

  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      className="relative p-3 rounded-lg bg-mail-bg border border-mail-border cursor-grab select-none hover:border-mail-subtle hover:shadow-md transition-all group">

      {/* Drag handle */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={12} className="text-mail-subtle" />
      </div>

      {/* Row 1: sender + meta */}
      <div className="flex items-center gap-1.5 mb-1.5 mt-1">
        <span className="text-[12px] font-medium text-mail-muted flex-1 truncate">{displayName(email.fromName, email.fromEmail)}</span>
        {email.isStarred && <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />}
        {email.sentiment && <span className="text-[10px] shrink-0">{SENTIMENT_EMOJI[email.sentiment] ?? ''}</span>}
        <span className="text-[10px] text-mail-subtle font-mono shrink-0">{relativeTime(email.receivedAt)}</span>
      </div>

      {/* Row 2: subject */}
      <div className="text-[13px] font-medium text-mail-text mb-1 truncate">{email.subject || '(no subject)'}</div>

      {/* Row 3: summary */}
      {email.summary && (
        <div className="text-[11px] text-mail-subtle mb-2 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {email.summary}
        </div>
      )}

      {/* Row 4: tags + menu */}
      <div className="flex items-center gap-1 flex-wrap">
        {email.relationshipType && email.relationshipType !== 'other' && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: `${relColor}15`, color: relColor }}>
            {capitalize(email.relationshipType)}
          </span>
        )}
        {email.primaryTag && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-mail-chip text-mail-subtle">{email.primaryTag}</span>
        )}
        {email.urgencyScore >= 70 && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 bg-red-500/10 text-red-400">
            <Zap size={8} /> Urgent
          </span>
        )}

        {/* Status menu */}
        <div className="ml-auto relative" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1 rounded text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100">
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div onClick={(e) => e.stopPropagation()} onDragStart={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 bg-mail-surface border border-mail-border rounded-lg p-1 z-20 min-w-[140px] shadow-xl">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mail-subtle px-2 py-1">Move to</div>
              {STATUS_OPTIONS.filter((s) => s.value !== email.status).map((opt) => {
                const c = COLUMN_CONFIG[opt.value] ?? COLUMN_CONFIG.new;
                return (
                  <button key={opt.value} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onStatusChange(opt.value); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[11px] text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}