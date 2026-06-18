// app/mails/v1/ai-email-details/[emailId]/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EmailAssistantChat from '../../_components/email-assistant/EmailAssistantChat';
import SaveToCategory from '../../_components/email-actions/SaveToCategory';
import { ToastProvider } from '../../_components/ui/ToastProvider';
import ScheduleMeetingPanel from '../../_components/email-actions/ScheduleMeetingPanel';
import {
  ArrowLeft, Archive, CalendarPlus, CheckCircle2, ChevronDown, Sparkles,
  PanelRightClose, PanelRight, MessageSquare, Star, Reply, ReplyAll, Forward,
  MoreVertical, Trash2, Flag, BellOff, Tag, ExternalLink, Copy, Loader2,
} from 'lucide-react';
import MarkdownRenderer from '../../_components/ui/MarkdownRenderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmailDetail = {
  id: string; threadId: string; subject: string | null; fromEmail: string;
  fromName: string | null; toEmails: string[]; ccEmails: string[];
  snippet: string | null; bodyText: string | null; bodyHtml: string | null;
  receivedAt: string; isRead: boolean; isSent: boolean; hasAttachments: boolean; status: string;
};

type Intelligence = {
  summary: { summary: string | null };
  recommendedAction: { recommendedAction: string | null };
  attentionSignals: { labels: string[] };
  actionTimeframe: { raw: string; label: string; urgency: string; deadline: string | null };
  actionItems: { items: { task: string; owner: string; dueDate: string | null }[] };
  keyInsights: { insights: string[] };
  businessIntelligence: { opportunityScore: number; businessValue: number; riskScore: number };
  relationship: { type: string; sentiment: string; isHumanConversation: boolean };
  classification: { category: string | null; industry: string | null; topicCluster: string | null; primaryTag: string | null };
  tags: { tags: string[]; topics: string[] };
  entities: { entities: { name: string; type: string }[] };
  pipelineStage: { current: string; stages: string[] };
  hasAiData: boolean;
};

type ApiResponse = { email: EmailDetail; threadEmails: EmailDetail[]; intelligence: Intelligence };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SIGNAL_COLORS: Record<string, { bg: string; text: string }> = {
  risk: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  opportunity: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  deadline: { bg: 'rgba(249,115,22,0.15)', text: '#f97316' },
  action_required: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  follow_up: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  information: { bg: 'rgba(107,114,128,0.15)', text: '#6b7280' },
};

const SENTIMENT_CONFIG: Record<string, { emoji: string; color: string }> = {
  positive: { emoji: '🟢', color: '#22c55e' },
  neutral: { emoji: '🟡', color: '#f59e0b' },
  negative: { emoji: '🔴', color: '#ef4444' },
};

const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', none: '#6b7280',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#3b82f6' },
  in_progress: { label: 'In Progress', color: '#f59e0b' },
  waiting: { label: 'Waiting', color: '#a78bfa' },
  done: { label: 'Done', color: '#22c55e' },
  archived: { label: 'Archived', color: '#6b7280' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function senderName(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }
function formatTime(iso: string): string { const d = new Date(iso); return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }
function relativeTime(iso: string): string { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }
function capitalize(s: string): string { return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AIEmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const emailId = params.emailId as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(true);
  const [draftReply, setDraftReply] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('new');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [rightPanel, setRightPanel] = useState<'ai' | 'schedule' | 'chat'>('ai');
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusDropdownOpen) return;
    const handler = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusDropdownOpen]);

  const generateDrafts = async () => {
    if (!data) return;
    setDraftLoading(true); setDraftReply(null);
    try {
      // Step 1: Check DB for cached draft
      const cacheRes = await fetch(`/api/v1/emails/${data.email.id}/drafts`);
      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        if (cached.draft) {
          setDraftReply(cached.draft);
          return; // found in DB, done
        }
      }
  
      // Step 2: Not in DB — call AI
      const { email: em } = data;
      const res = await fetch('/api/v1/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Draft 3 reply options with different tones: 1) Professional and detailed 2) Short and direct 3) Friendly and warm. For each, write the label and the full reply text ready to send.',
          emailContext: { emailId: em.id, threadId: em.threadId, subject: em.subject ?? '', fromEmail: em.fromEmail, fromName: em.fromName, toEmails: em.toEmails ?? [], bodySnippet: (em.bodyText ?? '').slice(0, 500) },
        }),
      });
      const result = await res.json();
      const draft = result.message ?? 'Could not generate replies.';
      setDraftReply(draft);
  
      // Step 3: Save to DB for next time
      await fetch(`/api/v1/emails/${em.id}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
    } catch { setDraftReply('Failed to generate replies.'); }
    finally { setDraftLoading(false); }
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/v1/ai-email-details/${emailId}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const result = await res.json();
      setData(result); setEmailStatus((result.email as any).status ?? 'new');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, [emailId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Shell><Loader2 size={20} className="animate-spin" /></Shell>;
  if (error) return <Shell><span className="text-red-400">{error}</span></Shell>;
  if (!data) return <Shell>Email not found</Shell>;

  const { email, threadEmails, intelligence: ai } = data;
  const attentionLabels = ai.attentionSignals.labels.filter((l) => l !== 'information');
  const emailContext = { emailId: email.id, threadId: email.threadId, subject: email.subject ?? '', fromEmail: email.fromEmail, fromName: email.fromName, toEmails: email.toEmails ?? [], bodySnippet: (email.bodyText ?? '').slice(0, 500) };
  const sc = STATUS_CONFIG[emailStatus];

  return (
    <ToastProvider>
      <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans">
        {/* ── Top bar ── */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-mail-border text-[13px]">
          <button onClick={() => router.push('/mails/v1/ai-inbox')} title="Back to inbox" className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent flex items-center">
            <ArrowLeft size={17} />
          </button>

          <span className="w-px h-5 bg-mail-border mx-1.5" />

          <TopBtn icon={Archive} label="Archive" />
          <TopBtn icon={CalendarPlus} label="Schedule" onClick={() => { setShowPanel(true); setRightPanel('schedule'); }} />
          <SaveToCategory emailId={emailId} />
          <TopBtn icon={CheckCircle2} label="Done" />

          {/* Status */}
          <div className="relative" ref={statusRef}>
            <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} title="Change status"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
              style={{ border: `1px solid ${sc?.color ?? '#3b82f6'}40`, background: `${sc?.color ?? '#3b82f6'}15`, color: sc?.color ?? '#3b82f6' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc?.color ?? '#3b82f6' }} />
              {sc?.label ?? 'New'}
              <ChevronDown size={12} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-mail-surface border border-mail-border rounded-lg p-1 z-30 min-w-[160px] shadow-xl">
                {STATUS_OPTIONS.filter((s) => s.value !== emailStatus).map((opt) => (
                  <button key={opt.value}
                    onClick={async () => { setStatusDropdownOpen(false); try { const r = await fetch(`/api/v1/emails/${emailId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: opt.value }) }); if (r.ok) setEmailStatus(opt.value); } catch {} }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[opt.value]?.color ?? '#6b7280' }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Ask AI */}
          <button onClick={() => { setShowPanel(true); setRightPanel('chat'); }} title="Ask AI"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer border-none transition-colors ${rightPanel === 'chat' && showPanel ? 'bg-mail-accent-soft text-mail-accent' : 'bg-transparent text-mail-subtle hover:bg-mail-hover hover:text-mail-muted'}`}>
            <MessageSquare size={15} />
            <span>Ask AI</span>
          </button>

          {/* Panel toggle */}
          <button onClick={() => { if (showPanel && rightPanel === 'ai') setShowPanel(false); else { setShowPanel(true); setRightPanel('ai'); } }}
            title={showPanel && rightPanel === 'ai' ? 'Hide panel' : 'Show AI panel'}
            className={`p-1.5 rounded-md cursor-pointer border-none transition-colors ${showPanel && rightPanel === 'ai' ? 'text-mail-accent bg-mail-accent-soft' : 'text-mail-subtle bg-transparent hover:bg-mail-hover hover:text-mail-muted'}`}>
            {showPanel && rightPanel === 'ai' ? <PanelRightClose size={17} /> : <PanelRight size={17} />}
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Email */}
          <div className="flex-1 min-w-0 p-6 overflow-y-auto">
            {/* Subject + badges */}
            <div className="flex items-center gap-2.5 flex-wrap mb-6">
              <h1 className="text-xl font-semibold m-0">{email.subject || '(no subject)'}</h1>
              {attentionLabels.map((label) => {
                const c = SIGNAL_COLORS[label] ?? SIGNAL_COLORS.information;
                return <span key={label} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>{capitalize(label)}</span>;
              })}
            </div>

            {/* Thread */}
            {threadEmails.map((msg) => <MessageCard key={msg.id} msg={msg} />)}

            {/* Actions */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[{ label: 'Reply', icon: Reply }, { label: 'Reply all', icon: ReplyAll }, { label: 'Forward', icon: Forward }].map((a) => {
                const Icon = a.icon;
                return <button key={a.label} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-mail-border bg-mail-surface text-mail-muted text-[13px] cursor-pointer hover:border-mail-subtle transition-colors"><Icon size={15} />{a.label}</button>;
              })}
              <button onClick={generateDrafts} disabled={draftLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-mail-accent/25 bg-mail-accent-soft text-mail-accent text-[13px] font-medium cursor-pointer transition-colors disabled:cursor-default disabled:opacity-70">
                {draftLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Draft Replies</>}
              </button>
            </div>

            {/* Drafts */}
            {draftReply && (
              <div className="mt-4 p-5 rounded-xl bg-mail-surface" style={{ border: '1px solid #a78bfa30' }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2"><Sparkles size={14} /><span className="text-xs font-semibold uppercase tracking-wider">AI Draft Replies</span></div>
                  <button onClick={() => setDraftReply(null)} className="bg-transparent border-none text-mail-subtle cursor-pointer text-sm">×</button>
                </div>
                {/* <div className="text-sm text-mail-muted leading-relaxed whitespace-pre-wrap"></div> */}
                <MarkdownRenderer content={draftReply} />
              </div>
            )}
          </div>

          {/* Right panel */}
          {showPanel && (
            <div className="w-[360px] border-l border-mail-border overflow-y-auto sidebar-scroll">
              {rightPanel === 'chat' ? (
                <EmailAssistantChat emailContext={emailContext} onClose={() => setRightPanel('ai')} />
              ) : rightPanel === 'schedule' ? (
                <div className="p-5"><ScheduleMeetingPanel emailId={email.id} senderEmail={email.fromEmail} senderName={email.fromName} subject={email.subject} onClose={() => setRightPanel('ai')} onScheduled={() => {}} /></div>
              ) : (
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-4">
                    <Sparkles size={14} className="text-mail-accent" />
                    <h2 className="text-sm font-semibold m-0">AI Intelligence</h2>
                  </div>
                  {!ai.hasAiData ? <div className="rounded-xl border border-mail-border bg-mail-surface p-4 text-mail-subtle text-[13px]">AI analysis not available.</div> : <AIPanel ai={ai} />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

// ---------------------------------------------------------------------------
// Top bar button
// ---------------------------------------------------------------------------

function TopBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent text-xs">
      <Icon size={15} /><span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Message card
// ---------------------------------------------------------------------------

function MessageCard({ msg }: { msg: EmailDetail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const menuItems = [
    { label: 'Reply', icon: Reply }, { label: 'Reply all', icon: ReplyAll }, { label: 'Forward', icon: Forward },
    { label: 'Star', icon: Star }, { label: 'Mark important', icon: Flag },
    { label: 'Mute thread', icon: BellOff, divider: true }, { label: 'Label', icon: Tag },
    { label: 'Open in new tab', icon: ExternalLink }, { label: 'Copy link', icon: Copy },
    { label: 'Delete', icon: Trash2, divider: true, danger: true },
  ];

  return (
    <div className="rounded-xl border border-mail-border bg-mail-surface mb-4 overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-start px-5 py-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-mail-hover flex items-center justify-center text-base font-semibold text-mail-muted shrink-0">
            {senderName(msg.fromName, msg.fromEmail).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-mail-text">{senderName(msg.fromName, msg.fromEmail)}</span>
              <span className="text-xs text-mail-subtle">&lt;{msg.fromEmail}&gt;</span>
            </div>
            <div className="text-xs text-mail-subtle mt-0.5">
              to {msg.isSent ? (msg.toEmails.join(', ') || '...') : 'me'}
              {msg.ccEmails.length > 0 && <span>, cc: {msg.ccEmails.join(', ')}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-mail-subtle">{formatTime(msg.receivedAt)} ({relativeTime(msg.receivedAt)})</span>
          <IconBtn icon={Star} title="Star" />
          <IconBtn icon={Reply} title="Reply" />

          {/* 3-dot */}
          <div className="relative" ref={menuRef}>
            <IconBtn icon={MoreVertical} title="More actions" onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-mail-surface border border-mail-border rounded-xl p-1 z-30 min-w-[200px] shadow-2xl">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      {item.divider && <div className="h-px bg-mail-border my-1" />}
                      <button onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-mail-hover ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-mail-muted hover:text-mail-text'}`}>
                        <Icon size={14} strokeWidth={1.7} className={item.danger ? 'text-red-400' : 'text-mail-subtle'} />
                        {item.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        {msg.bodyHtml ? (
          <iframe sandbox="allow-same-origin"
            srcDoc={`<!doctype html><html><head><style>body{margin:0;padding:0;font-family:-apple-system,system-ui,sans-serif;font-size:14px;line-height:1.7;color:#d4d4d8;background:transparent;}a{color:#fbbf24;}img{max-width:100%;height:auto;}blockquote{border-left:2px solid #3f3f46;margin-left:0;padding-left:12px;color:#a1a1aa;}</style></head><body>${msg.bodyHtml}</body></html>`}
            className="w-full border-0 bg-transparent" style={{ minHeight: 80 }} title="Email"
            onLoad={(e) => { try { const h = e.currentTarget.contentDocument?.body?.scrollHeight; if (h) e.currentTarget.style.height = h + 20 + 'px'; } catch {} }} />
        ) : (
          <pre className="text-sm text-mail-muted whitespace-pre-wrap break-words m-0 leading-relaxed font-[inherit]">
            {msg.bodyText || msg.snippet || 'No content'}
          </pre>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small icon button
// ---------------------------------------------------------------------------

function IconBtn({ icon: Icon, title, onClick }: { icon: React.ElementType; title: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={title} className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center">
      <Icon size={15} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// AI Intelligence panel
// ---------------------------------------------------------------------------

function AIPanel({ ai }: { ai: Intelligence }) {
  return (
    <>
      {ai.summary.summary && (
        <Card title="Summary"><p className="text-[13px] text-mail-muted m-0 leading-relaxed">{ai.summary.summary}</p></Card>
      )}
      {ai.recommendedAction.recommendedAction && (
        <Card title="Recommended Action" accent><p className="text-[13px] text-mail-muted m-0 leading-relaxed">{ai.recommendedAction.recommendedAction}</p></Card>
      )}
      {ai.actionTimeframe.raw !== 'no_action_needed' && (
        <Card title="Action Timeframe">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: URGENCY_COLORS[ai.actionTimeframe.urgency] ?? '#6b7280' }}>{ai.actionTimeframe.label}</span>
            {ai.actionTimeframe.deadline && <span className="text-xs text-mail-subtle">Due by {ai.actionTimeframe.deadline}</span>}
          </div>
        </Card>
      )}
      {ai.actionItems.items.length > 0 && (
        <Card title="Action Items">
          {ai.actionItems.items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2 text-[13px]">
              <span className="text-mail-subtle">☐</span>
              <div>
                <span className="text-mail-muted">{item.task}</span>
                {item.owner !== 'unknown' && <span className="text-[11px] ml-1.5" style={{ color: item.owner === 'recipient' ? '#f59e0b' : '#6b7280' }}>({item.owner === 'recipient' ? 'you' : 'sender'})</span>}
                {item.dueDate && <span className="text-[11px] text-mail-subtle ml-1.5">by {item.dueDate}</span>}
              </div>
            </div>
          ))}
        </Card>
      )}
      {ai.keyInsights.insights.length > 0 && (
        <Card title="Key Insights">
          {ai.keyInsights.insights.map((ins, i) => (
            <div key={i} className="flex gap-1.5 mb-1 text-[13px] text-mail-muted"><span className="text-mail-subtle">•</span><span>{ins}</span></div>
          ))}
        </Card>
      )}
      <Card title="Business Intelligence">
        <div className="grid grid-cols-3 gap-3">
          <ScoreBar label="Opportunity" value={ai.businessIntelligence.opportunityScore} color="#22c55e" />
          <ScoreBar label="Business Value" value={ai.businessIntelligence.businessValue} color="#3b82f6" />
          <ScoreBar label="Risk" value={ai.businessIntelligence.riskScore} color="#ef4444" />
        </div>
      </Card>
      <Card title="Relationship">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-mail-text">{capitalize(ai.relationship.type)}</span>
          <span className="text-[13px]">{SENTIMENT_CONFIG[ai.relationship.sentiment]?.emoji ?? '🟡'} <span style={{ color: SENTIMENT_CONFIG[ai.relationship.sentiment]?.color ?? '#f59e0b' }}>{capitalize(ai.relationship.sentiment)}</span></span>
        </div>
      </Card>
      {ai.pipelineStage.current !== 'unknown' && (
        <Card title="Pipeline Stage">
          <div className="flex gap-1 flex-wrap">
            {ai.pipelineStage.stages.map((stage) => (
              <span key={stage} className="text-[11px] px-2 py-0.5 rounded-md"
                style={{ background: stage === ai.pipelineStage.current ? '#a78bfa25' : 'var(--mail-chip)', color: stage === ai.pipelineStage.current ? '#a78bfa' : 'var(--mail-subtle)', fontWeight: stage === ai.pipelineStage.current ? 600 : 400, border: stage === ai.pipelineStage.current ? '1px solid #a78bfa40' : '1px solid transparent' }}>
                {capitalize(stage)}
              </span>
            ))}
          </div>
        </Card>
      )}
      <Card title="Classification">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {ai.classification.category && <Field label="Category" value={capitalize(ai.classification.category)} />}
          {ai.classification.industry && <Field label="Industry" value={capitalize(ai.classification.industry)} />}
          {ai.classification.topicCluster && <Field label="Topic" value={capitalize(ai.classification.topicCluster)} />}
          {ai.classification.primaryTag && <Field label="Tag" value={ai.classification.primaryTag} />}
        </div>
      </Card>
      {ai.tags.tags.length > 0 && (
        <Card title="Tags"><div className="flex flex-wrap gap-1.5">{ai.tags.tags.map((t) => <span key={t} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-mail-chip text-mail-muted">{t}</span>)}</div></Card>
      )}
      {ai.entities.entities.length > 0 && (
        <Card title="Entities"><div className="flex flex-wrap gap-1.5">{ai.entities.entities.map((e, i) => <span key={i} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-mail-chip text-mail-muted">{e.name}<span className="text-[9px] text-mail-subtle ml-1">{e.type}</span></span>)}</div></Card>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function Card({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-mail-surface p-4 mb-2" style={{ border: accent ? '1px solid #a78bfa30' : '1px solid var(--mail-border)' }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: accent ? '#a78bfa' : 'var(--mail-subtle)' }}>{title}</div>
      {children}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="text-[11px] text-mail-subtle mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}<span className="text-xs text-mail-subtle font-normal">/100</span></div>
      <div className="h-1 rounded-full bg-mail-chip mt-1"><div className="h-full rounded-full transition-all duration-300" style={{ background: color, width: `${value}%` }} /></div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[11px] text-mail-subtle mb-0.5">{label}</div><div className="text-[13px] text-mail-muted">{value}</div></div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="bg-mail-bg min-h-screen text-mail-subtle flex items-center justify-center font-sans gap-2">{children}</div>;
}