// app/mails/v1/inbox/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InboxThread } from '@/lib/v1/queries/inbox';
import type { ThreadMessage } from '@/lib/v1/queries/thread';
import { ReplyBox } from './_components/reply-box';
import EmailAssistantChat from '../_components/email-assistant/EmailAssistantChat';
import ScheduleMeetingPanel from '../_components/email-actions/ScheduleMeetingPanel';
import SaveToCategory from '../_components/email-actions/SaveToCategory';
import { ToastProvider, useToast } from '../_components/ui/ToastProvider';
import MarkdownRenderer from '../_components/ui/MarkdownRenderer';
import {
  Loader2, Mail, Star, Reply, ReplyAll, Forward, MoreVertical,
  Trash2, CheckCircle2, ChevronDown, ChevronRight, CalendarPlus,
  MessageSquare, Sparkles, Archive, Flag, X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = ['#e57373','#f06292','#ba68c8','#9575cd','#7986cb','#64b5f6','#4fc3f7','#4dd0e1','#4db6ac','#81c784','#aed581','#dce775','#ffd54f','#ffb74d','#ff8a65','#a1887f'];
function getAvatarColor(name: string): string { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }
function initials(n: string | null, e: string): string { const s = n || e; const p = s.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : s.slice(0, 2).toUpperCase(); }
function displayName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }
function formatDate(iso: string): string { const d = new Date(iso); if (isNaN(d.getTime())) return ''; const now = new Date(); const diff = now.getTime() - d.getTime(); if (diff < 86400000 && d.getDate() === now.getDate()) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }); if (Math.floor(diff / 86400000) < 7) return d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function formatFullDate(iso: string): string { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#3b82f6' }, in_progress: { label: 'In Progress', color: '#f59e0b' },
  waiting: { label: 'Waiting', color: '#a78bfa' }, done: { label: 'Done', color: '#22c55e' }, archived: { label: 'Archived', color: '#6b7280' },
};
const STATUS_OPTIONS = [
  { value: 'new', label: 'New' }, { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' }, { value: 'done', label: 'Done' }, { value: 'archived', label: 'Archived' },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function InboxV1Page() {
  return <ToastProvider><InboxInner /></ToastProvider>;
}

function InboxInner() {
  const { showToast } = useToast();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [error, setError] = useState('');
  const [rightPanel, setRightPanel] = useState<'none' | 'schedule' | 'chat'>('none');
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [draftReply, setDraftReply] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [threadStatusOpen, setThreadStatusOpen] = useState(false);
  const [threadStatus, setThreadStatus] = useState('new');
  const threadStatusRef = useRef<HTMLDivElement>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [syncModal, setSyncModal] = useState(false);

  useEffect(() => {
    if (!threadStatusOpen) return;
    const handler = (e: MouseEvent) => { if (threadStatusRef.current && !threadStatusRef.current.contains(e.target as Node)) setThreadStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [threadStatusOpen]);

  const loadInbox = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/inbox');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setThreads(data);
      setSelectedThreadId((cur) => (cur && data.some((t: InboxThread) => t.threadId === cur)) ? cur : data[0]?.threadId ?? null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); setThreads([]); setSelectedThreadId(null); }
    finally { setLoading(false); }
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/v1/threads/${threadId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setMessages(data);
      const map: Record<string, string> = {};
      for (const msg of data) map[msg.id] = (msg as any).status ?? 'new';
      setStatusMap(map);
      setThreadStatus((data[0] as any)?.status ?? 'new');
      setDraftReply(null);
      setShowReplyBox(false);
      if (data.length > 0) {
        setExpandedMessages(new Set([data[data.length - 1].id]));
      } else {
        setExpandedMessages(new Set());
      }
    } catch (err) { setMessages([]); setError(err instanceof Error ? err.message : 'Failed'); }
  }, []);

  useEffect(() => { loadInbox(); }, [loadInbox]);
  useEffect(() => { if (selectedThreadId) loadThread(selectedThreadId); else { setMessages([]); setDraftReply(null); setShowReplyBox(false); } }, [selectedThreadId, loadThread]);

  // ── Simple sync: fire background, poll until done, refresh, close ──
  async function handleSync() {
    setSyncing(true);
    setSyncDone(false);
    setSyncError('');

    try {
      // Fire background sync (limit > 50 triggers background mode)
      const res = await fetch('/api/v1/sync?limit=20', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed to start');

      // Poll until not syncing anymore
      let attempts = 0;
      const MAX_ATTEMPTS = 120; // 120 * 3s = 6 minutes max

      while (attempts < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;

        try {
          const poll = await fetch('/api/v1/sync');
          const data = await poll.json();

          if (data.status === 'done') {
            setSyncDone(true);
            await loadInbox();
            // Auto-close after 1.5 seconds
            setTimeout(() => {
              setSyncModal(false);
              setSyncing(false);
              setSyncDone(false);
            }, 1500);
            return;
          }

          if (data.status === 'error') {
            throw new Error(data.errors?.[0] ?? 'Sync pipeline failed');
          }

          if (data.status === 'idle') {
            // Sync finished before we started polling — just refresh
            setSyncDone(true);
            await loadInbox();
            setTimeout(() => {
              setSyncModal(false);
              setSyncing(false);
              setSyncDone(false);
            }, 1500);
            return;
          }

          // Still syncing — continue polling
        } catch (pollErr) {
          // Single poll failure — retry
          console.warn('[sync] poll failed, retrying...', pollErr);
        }
      }

      // Timed out — refresh anyway
      await loadInbox();
      setSyncModal(false);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  const toggleMessage = (id: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateEmailStatus = async (emailId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/emails/${emailId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Failed');
      setStatusMap((prev) => ({ ...prev, [emailId]: status }));
      showToast(`Status → ${STATUS_CONFIG[status]?.label ?? status}`, 'success');
    } catch { showToast('Failed to update status', 'error'); }
  };

  const markEmailDone = async (emailId: string) => {
    try {
      const res = await fetch(`/api/v1/emails/${emailId}/actions`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_done' }) });
      if (!res.ok) throw new Error('Failed');
      setStatusMap((prev) => ({ ...prev, [emailId]: 'done' }));
      showToast('Marked as done', 'success');
    } catch { showToast('Failed', 'error'); }
  };

  const updateThreadStatus = async (status: string) => {
    setThreadStatusOpen(false);
    const ids = messages.map((m) => m.id);
    let success = 0;
    for (const id of ids) {
      try { const res = await fetch(`/api/v1/emails/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); if (res.ok) { success++; setStatusMap((prev) => ({ ...prev, [id]: status })); } } catch {}
    }
    setThreadStatus(status);
    showToast(`${success} email${success > 1 ? 's' : ''} → ${STATUS_CONFIG[status]?.label ?? status}`, 'success');
  };

  const markThreadDone = async () => {
    const ids = messages.map((m) => m.id);
    for (const id of ids) {
      try { await fetch(`/api/v1/emails/${id}/actions`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark_done' }) }); } catch {}
      setStatusMap((prev) => ({ ...prev, [id]: 'done' }));
    }
    setThreadStatus('done');
    showToast('Thread marked as done', 'success');
  };

  const generateDrafts = async () => {
    if (!selectedThread || messages.length === 0) return;
    setDraftLoading(true); setDraftReply(null);
    const firstEmail = messages[0];
    try {
      const cacheRes = await fetch(`/api/v1/emails/${firstEmail.id}/drafts`);
      if (cacheRes.ok) { const cached = await cacheRes.json(); if (cached.draft) { setDraftReply(cached.draft); return; } }
      const res = await fetch('/api/v1/ai-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Draft 3 reply options with different tones: 1) Professional and detailed 2) Short and direct 3) Friendly and warm.', emailContext: { emailId: firstEmail.id, threadId: selectedThread.threadId, subject: selectedThread.subject ?? '', fromEmail: firstEmail.fromEmail, fromName: firstEmail.fromName, toEmails: (firstEmail as any).toEmails ?? [], bodySnippet: (firstEmail.bodyText ?? '').slice(0, 500) } }) });
      const result = await res.json();
      const draft = result.message ?? 'Could not generate.';
      setDraftReply(draft);
      await fetch(`/api/v1/emails/${firstEmail.id}/drafts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft }) }).catch(() => {});
    } catch { setDraftReply('Failed to generate.'); }
    finally { setDraftLoading(false); }
  };

  const selectedThread = threads.find((t) => t.threadId === selectedThreadId);
  const showRight = rightPanel !== 'none';
  const firstEmail = messages[0];
  const emailContext = firstEmail && selectedThread ? { emailId: firstEmail.id, threadId: selectedThread.threadId, subject: selectedThread.subject ?? '', fromEmail: firstEmail.fromEmail, fromName: firstEmail.fromName, toEmails: (firstEmail as any).toEmails ?? [], bodySnippet: (firstEmail.bodyText ?? '').slice(0, 500) } : null;
  const sc = STATUS_CONFIG[threadStatus];

  return (
    <div className="flex flex-col h-full bg-mail-bg text-mail-text font-sans">
      {error && <div className="mx-4 mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">{error}</div>}

      <div className="flex flex-1 min-h-0">
        {/* ── Left: thread list ── */}
        <div className="w-[380px] shrink-0 border-r border-mail-border flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-mail-border shrink-0">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-mail-subtle" />
              <span className="text-[13px] font-semibold text-mail-text">All Mail</span>
              {!loading && <span className="text-[11px] text-mail-subtle font-mono">{threads.length}</span>}
            </div>
            <button onClick={() => setSyncModal(true)} disabled={syncing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
              {syncing ? <Loader2 size={12} className="animate-spin" /> : null} {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scroll">
            {loading && threads.length === 0 && <div className="flex items-center justify-center py-16 text-mail-subtle text-[13px] gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</div>}
            {!loading && threads.length === 0 && <div className="py-16 text-center text-mail-subtle text-[13px] px-6">No emails yet. Click Sync.</div>}
            {threads.map((thread) => {
              const active = thread.threadId === selectedThreadId;
              const color = getAvatarColor(thread.fromName || thread.fromEmail);
              return (
                <button key={thread.threadId} onClick={() => setSelectedThreadId(thread.threadId)}
                  className={`flex items-start gap-3 w-full px-4 py-3 text-left cursor-pointer border-none transition-colors ${active ? 'bg-mail-accent-soft' : 'bg-transparent hover:bg-mail-hover'}`}
                  style={{ borderBottom: '1px solid var(--mail-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 mt-0.5" style={{ background: color }}>{initials(thread.fromName, thread.fromEmail)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[13px] truncate ${thread.hasUnread ? 'font-semibold text-mail-text' : 'font-medium text-mail-muted'}`}>{displayName(thread.fromName, thread.fromEmail)}</span>
                      <span className="text-[11px] text-mail-subtle shrink-0">{formatDate(thread.receivedAt)}</span>
                    </div>
                    <div className={`text-[13px] truncate mb-0.5 ${thread.hasUnread ? 'font-semibold text-mail-text' : 'text-mail-muted'}`}>{thread.subject || '(No subject)'}</div>
                    <div className="text-[12px] text-mail-subtle truncate">{thread.snippet || ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Center: message detail ── */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {!selectedThread ? (
            <div className="flex flex-col items-center justify-center h-full text-mail-subtle">
              <Mail size={40} strokeWidth={1} className="mb-3 opacity-30" />
              <p className="text-[14px]">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Subject header + thread actions */}
              <div className="px-6 py-3 border-b border-mail-border shrink-0">
                <h2 className="text-lg font-semibold m-0 text-mail-text mb-2">{selectedThread.subject || '(No subject)'}</h2>
                <div className="flex items-center gap-1">
                  <TopBtn icon={CalendarPlus} label="Schedule" onClick={() => setRightPanel(rightPanel === 'schedule' ? 'none' : 'schedule')} />
                  {firstEmail && <SaveToCategory emailId={firstEmail.id} />}
                  <TopBtn icon={CheckCircle2} label="Done" onClick={markThreadDone} />

                  <div className="relative" ref={threadStatusRef}>
                    <button onClick={() => setThreadStatusOpen(!threadStatusOpen)} title="Change status for all"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                      style={{ border: `1px solid ${sc?.color ?? '#3b82f6'}40`, background: `${sc?.color ?? '#3b82f6'}15`, color: sc?.color ?? '#3b82f6' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc?.color ?? '#3b82f6' }} />
                      {sc?.label ?? 'New'} <ChevronDown size={11} />
                    </button>
                    {threadStatusOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-mail-surface border border-mail-border rounded-lg p-1 z-30 min-w-[160px] shadow-xl">
                        {STATUS_OPTIONS.filter((s) => s.value !== threadStatus).map((opt) => (
                          <button key={opt.value} onClick={() => updateThreadStatus(opt.value)}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left">
                            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[opt.value]?.color ?? '#6b7280' }} /> {opt.label} <span className="text-[10px] text-mail-subtle ml-auto">all</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1" />

                  <button onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')} title="Ask AI"
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer border-none transition-colors ${rightPanel === 'chat' ? 'bg-mail-accent-soft text-mail-accent' : 'bg-transparent text-mail-subtle hover:bg-mail-hover hover:text-mail-muted'}`}>
                    <MessageSquare size={14} /> Ask AI
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto sidebar-scroll px-6 py-4">
                {messages.length > 1 && (
                  <div className="text-[11px] text-mail-subtle mb-3">{messages.length} messages in this thread</div>
                )}

                {messages.map((msg, idx) => {
                  const isExpanded = expandedMessages.has(msg.id);
                  const isLast = idx === messages.length - 1;
                  return (
                    <MessageCard key={msg.id} msg={msg} isExpanded={isExpanded} isLast={isLast}
                      onToggle={() => toggleMessage(msg.id)} emailStatus={statusMap[msg.id] ?? 'new'}
                      onStatusChange={(s) => updateEmailStatus(msg.id, s)} onMarkDone={() => markEmailDone(msg.id)} />
                  );
                })}

                {/* Bottom actions */}
                <div className="pl-12 flex gap-2 mb-4 flex-wrap">
                  <button onClick={() => setShowReplyBox(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-mail-border bg-mail-surface text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors"><Reply size={14} /> Reply</button>
                  <button onClick={() => setShowReplyBox(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-mail-border bg-mail-surface text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors"><ReplyAll size={14} /> Reply all</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-mail-border bg-mail-surface text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors"><Forward size={14} /> Forward</button>
                  <button onClick={generateDrafts} disabled={draftLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-mail-accent/25 bg-mail-accent-soft text-mail-accent text-[12px] font-medium cursor-pointer transition-colors disabled:opacity-60">
                    {draftLoading ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Draft Replies</>}
                  </button>
                </div>

                {/* Draft replies */}
                {draftReply && (
                  <div className="pl-12 mb-4">
                    <div className="p-5 rounded-xl bg-mail-surface border border-mail-accent/20">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2"><Sparkles size={14} className="text-mail-accent" /><span className="text-xs font-semibold text-mail-accent uppercase tracking-wider">AI Draft Replies</span></div>
                        <button onClick={() => setDraftReply(null)} className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent"><X size={14} /></button>
                      </div>
                      <MarkdownRenderer content={draftReply} />
                    </div>
                  </div>
                )}

                {/* Reply box */}
                {showReplyBox && (
                  <div className="pl-12 mb-4">
                    <div className="rounded-xl border border-neutral-700 bg-mail-surface p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-mail-muted flex items-center gap-1.5"><Reply size={13} /> Reply</span>
                        <button onClick={() => setShowReplyBox(false)} title="Close" className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent"><X size={14} /></button>
                      </div>
                      <ReplyBox threadId={selectedThread.threadId} onSent={() => { loadThread(selectedThread.threadId); setShowReplyBox(false); }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Right panel ── */}
        {showRight && (
          <div className="w-[360px] border-l border-mail-border overflow-y-auto sidebar-scroll shrink-0">
            {rightPanel === 'chat' && emailContext ? (
              <EmailAssistantChat emailContext={emailContext} onClose={() => setRightPanel('none')} />
            ) : rightPanel === 'schedule' && firstEmail && selectedThread ? (
              <div className="p-4">
                <ScheduleMeetingPanel emailId={firstEmail.id} senderEmail={firstEmail.fromEmail} senderName={firstEmail.fromName} subject={selectedThread.subject} onClose={() => setRightPanel('none')} onScheduled={() => {}} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-mail-subtle text-[13px]">No panel</div>
            )}
          </div>
        )}
      </div>

      {/* ── Sync modal — simple: spinner → done → auto-close ── */}
      {syncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl border border-mail-border bg-mail-surface p-6 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold m-0 flex items-center gap-2">Sync Emails</h3>
              {!syncing && (
                <button onClick={() => { setSyncModal(false); setSyncDone(false); setSyncError(''); }}
                  className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Idle — not started yet */}
            {!syncing && !syncDone && !syncError && (
              <>
                <p className="text-[13px] text-mail-muted m-0 mb-2">Sync your latest emails from Gmail and run AI analysis.</p>
                <p className="text-[12px] text-mail-subtle m-0 mb-5">This may take a few minutes depending on the number of new emails.</p>
                <div className="flex gap-2">
                  <button onClick={() => setSyncModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-subtle text-xs cursor-pointer hover:bg-mail-hover transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSync}
                    className="flex-[2] py-2.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
                    Start Sync
                  </button>
                </div>
              </>
            )}

            {/* Syncing — simple spinner */}
            {syncing && !syncDone && (
              <div className="py-8 flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-mail-accent" />
                <div className="text-[13px] text-mail-muted">Syncing your emails...</div>
                <div className="text-[11px] text-mail-subtle">Fetching from Gmail · AI analysis · Embedding</div>
              </div>
            )}

            {/* Done — auto-closes after 1.5s */}
            {syncDone && (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 size={22} className="text-green-400" />
                </div>
                <div className="text-[13px] text-green-400 font-medium">Sync complete!</div>
              </div>
            )}

            {/* Error */}
            {syncError && (
              <>
                <div className="py-4 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                    <X size={16} className="text-red-400" />
                  </div>
                  <div className="text-[13px] text-red-400">{syncError}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSyncModal(false); setSyncError(''); }}
                    className="flex-1 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-subtle text-xs cursor-pointer hover:bg-mail-hover transition-colors">
                    Close
                  </button>
                  <button onClick={() => { setSyncError(''); handleSync(); }}
                    className="flex-[2] py-2.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors">
                    Retry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TopBtn
// ---------------------------------------------------------------------------

function TopBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent text-xs">
      <Icon size={14} /><span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// MessageCard — collapsible
// ---------------------------------------------------------------------------

function MessageCard({ msg, isExpanded, isLast, onToggle, emailStatus, onStatusChange, onMarkDone }: {
  msg: ThreadMessage; isExpanded: boolean; isLast: boolean;
  onToggle: () => void; emailStatus: string;
  onStatusChange: (status: string) => void; onMarkDone: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!menuOpen) return; const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [menuOpen]);
  useEffect(() => { if (!statusOpen) return; const h = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [statusOpen]);

  const color = getAvatarColor(msg.fromName || msg.fromEmail);
  const sc = STATUS_CONFIG[emailStatus];
  const bodyPreview = (msg.bodyText || msg.snippet || '').replace(/\s+/g, ' ').trim().split(/\s+/).slice(0, 20).join(' ');

  const menuItems = [
    { label: 'Reply', icon: Reply }, { label: 'Reply all', icon: ReplyAll }, { label: 'Forward', icon: Forward },
    { label: 'Star', icon: Star }, { label: 'Mark important', icon: Flag },
    { label: 'Archive', icon: Archive, divider: true },
    { label: 'Delete', icon: Trash2, divider: true, danger: true },
  ];

  return (
    <div className={`rounded-xl border mb-2 transition-all duration-200 ${isExpanded ? 'border-mail-border bg-mail-surface' : 'border-transparent hover:bg-mail-hover'}`}>
      {/* Header — always visible */}
      <div className={`flex items-center gap-3 cursor-pointer select-none ${isExpanded ? 'px-5 py-4' : 'px-3 py-2.5'}`}
        onClick={(e) => { if ((e.target as HTMLElement).closest('[data-actions]')) return; onToggle(); }}>
        <div className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-all duration-200 ${isExpanded ? 'w-10 h-10 text-[13px]' : 'w-8 h-8 text-[11px]'}`} style={{ background: color }}>
          {initials(msg.fromName, msg.fromEmail)}
        </div>

        <div className="flex-1 min-w-0">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-mail-text">{displayName(msg.fromName, msg.fromEmail)}</span>
                <span className="text-[11px] text-mail-subtle truncate">&lt;{msg.fromEmail}&gt;</span>
              </div>
              <div className="text-[11px] text-mail-subtle mt-0.5">to {(msg as any).toEmails?.join(', ') || 'me'}</div>
            </>
          ) : (
            <>
              <div className="text-[13px] font-medium text-mail-muted">{displayName(msg.fromName, msg.fromEmail)}</div>
              <div className="text-[11px] text-mail-subtle truncate">{bodyPreview}{bodyPreview.length > 0 ? '...' : ''}</div>
            </>
          )}
        </div>

        {isExpanded ? (
          <div className="flex items-center gap-1 shrink-0" data-actions>
            <SaveToCategory emailId={msg.id} />
            <button onClick={(e) => { e.stopPropagation(); onMarkDone(); }} title="Mark done"
              className={`p-1.5 rounded-md transition-colors cursor-pointer border-none ${emailStatus === 'done' ? 'text-green-400 bg-green-500/10' : 'text-mail-subtle bg-transparent hover:text-mail-muted hover:bg-mail-hover'}`}>
              <CheckCircle2 size={14} />
            </button>

            <div className="relative" ref={statusRef} data-actions>
              <button onClick={(e) => { e.stopPropagation(); setStatusOpen(!statusOpen); }} title="Status"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer"
                style={{ border: `1px solid ${sc?.color ?? '#3b82f6'}30`, background: `${sc?.color ?? '#3b82f6'}10`, color: sc?.color ?? '#3b82f6' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc?.color ?? '#3b82f6' }} />
                {sc?.label ?? 'New'}
              </button>
              {statusOpen && (
                <div className="absolute right-0 top-full mt-1 bg-mail-surface border border-mail-border rounded-lg p-1 z-30 min-w-[140px] shadow-xl">
                  {STATUS_OPTIONS.filter((s) => s.value !== emailStatus).map((opt) => (
                    <button key={opt.value} onClick={(e) => { e.stopPropagation(); onStatusChange(opt.value); setStatusOpen(false); }}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-[11px] text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[opt.value]?.color ?? '#6b7280' }} /> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[11px] text-mail-subtle ml-1.5">{formatFullDate(msg.receivedAt)}</span>

            <div className="relative" ref={menuRef} data-actions>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} title="More" className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-mail-surface border border-mail-border rounded-xl p-1 z-30 min-w-[180px] shadow-2xl">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label}>
                        {item.divider && <div className="h-px bg-mail-border my-1" />}
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-mail-hover ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-mail-muted hover:text-mail-text'}`}>
                          <Icon size={13} strokeWidth={1.7} className={item.danger ? 'text-red-400' : 'text-mail-subtle'} /> {item.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-mail-subtle shrink-0">{formatDate(msg.receivedAt)}</span>
        )}
      </div>

      {/* Body — only when expanded */}
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 pt-1 pl-[68px]">
          {msg.bodyHtml ? (
            <iframe sandbox="allow-same-origin"
              srcDoc={`<!doctype html><html><head><style>body{margin:0;padding:0;font-family:-apple-system,system-ui,sans-serif;font-size:14px;line-height:1.7;color:var(--mail-text,#d4d4d8);background:transparent;}a{color:var(--mail-accent,#f59e0b);}img{max-width:100%;height:auto;}blockquote{border-left:2px solid var(--mail-border,#3f3f46);margin-left:0;padding-left:12px;color:var(--mail-muted,#a1a1aa);}</style></head><body>${msg.bodyHtml}</body></html>`}
              className="w-full border-0 bg-transparent" style={{ minHeight: 60 }} title="Email"
              onLoad={(e) => { try { const h = e.currentTarget.contentDocument?.body?.scrollHeight; if (h) e.currentTarget.style.height = h + 16 + 'px'; } catch {} }} />
          ) : (
            <pre className="text-[14px] text-mail-muted whitespace-pre-wrap break-words m-0 leading-relaxed font-[inherit]">{msg.bodyText || msg.snippet || '(No content)'}</pre>
          )}
        </div>
      </div>
    </div>
  );
}