// app/mails/v1/ai-chat/page.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '../_components/ui/MarkdownRenderer';
import {
  Send, Sparkles, Loader2, CheckCircle, XCircle, Bot,
  Search, Mail, Calendar, Clock, Reply, Zap, FileText, ListChecks,
  ShieldAlert, ArrowRight, Image, Paperclip,
} from 'lucide-react';
import ChatSidebar from './_components/Chatsidebar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchResultEmail = {
  id: string; thread_id: string; subject: string | null;
  from_email: string; from_name: string | null; snippet: string | null;
  received_at: string; summary: string | null;
  relevance_score: number; match_sources: string[];
};

type AssetResult = {
  id: string;
  emailId: string;
  type: string;
  filename: string | null;
  url: string | null;
  mimeCategory: string;
  size: number | null;
  domain: string | null;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
};

type PendingAction = { callId: string; tool: string; args: Record<string, unknown>; preview: string };

type ChatMessage = {
  role: 'user' | 'assistant'; content: string;
  emails?: SearchResultEmail[]; assets?: AssetResult[]; toolsUsed?: string[]; isPending?: boolean;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SOURCE_BADGE: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  structured: { label: 'AI Fields', icon: Sparkles, color: '#a78bfa' },
  fulltext: { label: 'Keywords', icon: Search, color: '#3b82f6' },
  semantic: { label: 'Semantic', icon: ShieldAlert, color: '#22c55e' },
};

const TOOL_BADGES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  search_inbox: { label: 'Search', icon: Search, color: '#a78bfa' },
  send_email: { label: 'Email', icon: Mail, color: '#3b82f6' },
  create_event: { label: 'Calendar', icon: Calendar, color: '#f59e0b' },
  check_availability: { label: 'Availability', icon: Clock, color: '#06b6d4' },
  search_calendar: { label: 'Cal Search', icon: Calendar, color: '#f59e0b' },
  reply_to_email: { label: 'Reply', icon: Reply, color: '#22c55e' },
  run_script: { label: 'Corsair', icon: Zap, color: '#ec4899' },
  list_operations: { label: 'Discover', icon: ListChecks, color: '#6b7280' },
  get_schema: { label: 'Schema', icon: FileText, color: '#6b7280' },
  search_assets: { label: 'Assets', icon: Paperclip, color: '#f97316' },
};

const SUGGESTIONS = [
  'Show high-risk emails I need to respond to',
  'Find emails about pricing or proposals',
  'What opportunities are in my inbox?',
  'Show unanswered emails from this week',
  'Send an email to piyush about the Q2 report',
  'Schedule a meeting with the team for tomorrow',
  "What's on my calendar this week?",
  'Find emails with deadlines',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function senderName(fromName: string | null, fromEmail: string): string {
  if (fromName) return fromName;
  const at = fromEmail.indexOf('@');
  return at > 0 ? fromEmail.slice(0, at) : fromEmail;
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Conversation persistence helpers
// ---------------------------------------------------------------------------

async function createConversation(title: string): Promise<string | null> {
  try {
    const res = await fetch('/api/v1/ai-chat/conversations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id;
  } catch { return null; }
}

async function saveMessages(conversationId: string, messages: { role: string; content: string; emails?: any[]; toolsUsed?: string[] }[]): Promise<void> {
  try {
    await fetch(`/api/v1/ai-chat/conversations/${conversationId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
  } catch { /* best effort */ }
}

async function loadConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/v1/ai-chat/conversations/${conversationId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.messages ?? []).map((m: any) => ({
      role: m.role,
      content: m.content,
      emails: m.emails ?? undefined,
      toolsUsed: m.toolsUsed ?? undefined,
    }));
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // ── Send message ──
  const sendMessage = useCallback(async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput(''); setLoading(true); scrollToBottom();

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/v1/ai-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg, conversationHistory: history }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Failed');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: 'assistant', content: data.message,
        toolsUsed: data.toolsUsed, emails: data.emails, assets: data.assets,
        isPending: data.status === 'needs_confirmation',
      };

      if (data.status === 'needs_confirmation') setPendingAction(data.pendingAction);

      setMessages((prev) => [...prev, assistantMsg]);

      // ── Persist conversation ──
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(userMsg);
        if (convId) setConversationId(convId);
      }
      if (convId) {
        await saveMessages(convId, [
          { role: 'user', content: userMsg },
          { role: 'assistant', content: data.message, emails: data.emails, toolsUsed: data.toolsUsed },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }]);
    } finally { setLoading(false); scrollToBottom(); }
  }, [loading, messages, scrollToBottom, conversationId]);

  // ── Confirm/Cancel ──
  const handleConfirm = useCallback(async () => {
    if (!pendingAction || loading) return;
    setLoading(true);
    setMessages((prev) => prev.map((m) => m.isPending ? { ...m, isPending: false } : m));
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/v1/ai-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'confirmed', conversationHistory: history, pendingAction, confirmed: true }) });
      const data = await res.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.message ?? 'Action completed.', toolsUsed: data.toolsUsed };
      setMessages((prev) => [...prev, assistantMsg]);
      if (conversationId) {
        await saveMessages(conversationId, [{ role: 'assistant', content: data.message ?? 'Action completed.', toolsUsed: data.toolsUsed }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Failed'}` }]);
    } finally { setPendingAction(null); setLoading(false); scrollToBottom(); }
  }, [pendingAction, loading, messages, scrollToBottom, conversationId]);

  const handleCancel = useCallback(() => {
    setMessages((prev) => [...prev.map((m) => m.isPending ? { ...m, isPending: false } : m), { role: 'assistant' as const, content: 'Action cancelled.' }]);
    setPendingAction(null);
  }, []);

  // ── Conversation switching ──
  const handleSelectConversation = async (id: string) => {
    if (id === conversationId) return;
    setLoadingConv(true); setPendingAction(null);
    const msgs = await loadConversationMessages(id);
    setMessages(msgs);
    setConversationId(id);
    setLoadingConv(false);
    scrollToBottom();
  };

  const handleNewChat = () => {
    setMessages([]); setConversationId(null); setPendingAction(null); setInput('');
  };

  const handleDeleteConversation = (id: string) => {
    if (id === conversationId) handleNewChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const isEmpty = messages.length === 0 && !loadingConv;

  return (
    <div className="flex h-full bg-mail-bg">
      {/* Chat sidebar */}
      <ChatSidebar
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 text-mail-text font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-mail-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-mail-accent-soft flex items-center justify-center">
              <Sparkles size={16} className="text-mail-accent" />
            </div>
            <h1 className="text-base font-semibold m-0">Ask My Inbox</h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">AI Powered</span>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Can act</span>
          </div>
          <span className="text-xs text-mail-subtle">Search · Email · Calendar · Assets · Actions</span>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-6">
          {/* Loading conversation */}
          {loadingConv && (
            <div className="flex items-center justify-center py-16 text-mail-subtle text-sm gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading conversation...
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="max-w-[600px] mx-auto text-center mt-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-mail-accent-soft flex items-center justify-center mx-auto mb-5">
                <Sparkles size={28} className="text-mail-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ask anything about your inbox</h2>
              <p className="text-sm text-mail-subtle mb-8">Search emails, send messages, schedule meetings, and more — all through chat.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="px-3.5 py-2 rounded-full border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:border-mail-subtle hover:text-mail-text transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="max-w-[800px] mx-auto px-6">
            {messages.map((msg, i) => (
              <div key={i} className="mb-6">
                <div className="flex gap-3 items-start">
                  {msg.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">G</div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-mail-accent-soft flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-mail-accent" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-xs text-mail-subtle font-medium">{msg.role === 'user' ? 'You' : 'Context Mode'}</span>
                      {msg.toolsUsed?.map((tool) => {
                        const badge = TOOL_BADGES[tool];
                        if (!badge) return null;
                        const Icon = badge.icon;
                        return (
                          <span key={tool} className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded"
                            style={{ background: `${badge.color}12`, color: badge.color, border: `1px solid ${badge.color}20` }}>
                            <Icon size={9} /> {badge.label}
                          </span>
                        );
                      })}
                    </div>

                    {msg.role === 'user' ? (
                      <div className="text-[14px] text-mail-text leading-relaxed bg-mail-surface border border-mail-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-[14px] text-mail-muted leading-relaxed">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}

                    {msg.isPending && pendingAction && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleConfirm} disabled={loading}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-lg border-none bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-60">
                          <CheckCircle size={14} /> Confirm
                        </button>
                        <button onClick={handleCancel} disabled={loading}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[13px] cursor-pointer hover:bg-mail-hover transition-colors">
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}

                    {/* Email results */}
                    {msg.emails && msg.emails.length > 0 && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        {msg.emails.map((email) => (
                          <EmailCard key={email.id} email={email} onClick={() => router.push(`/mails/v1/ai-email-details/${email.id}`)} />
                        ))}
                      </div>
                    )}

                    {/* Asset results with previews */}
                    {msg.assets && msg.assets.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-2 flex items-center gap-1">
                          <Paperclip size={10} /> Files Found
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {msg.assets.map((asset) => (
                            <AssetCard key={asset.id} asset={asset} onClick={() => router.push(`/mails/v1/ai-email-details/${asset.emailId}`)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-mail-accent-soft flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-mail-accent" />
                </div>
                <div className="flex items-center gap-2 text-sm text-mail-subtle">
                  <Loader2 size={14} className="animate-spin text-mail-accent" />
                  {pendingAction ? 'Executing action...' : 'Thinking...'}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-6 py-4 border-t border-mail-border shrink-0">
          <div className="max-w-[800px] mx-auto">
            <div className="relative rounded-xl border border-mail-border bg-mail-surface focus-within:border-mail-accent/40 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingAction ? 'Confirm or cancel above...' : 'Search emails, send messages, find files...'}
                disabled={loading || !!pendingAction}
                rows={2}
                className="w-full px-4 pt-3 pb-10 rounded-xl bg-transparent text-mail-text text-[14px] font-[inherit] outline-none resize-none placeholder:text-mail-subtle disabled:opacity-50"
              />
              <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                <span className="text-[10px] text-mail-subtle">⏎ Send</span>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim() || !!pendingAction}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all ${
                    input.trim() && !pendingAction
                      ? 'bg-mail-accent hover:bg-mail-accent-hover text-white shadow-sm'
                      : 'bg-mail-hover text-mail-subtle cursor-default'
                  }`}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email Card
// ---------------------------------------------------------------------------

function EmailCard({ email, onClick }: { email: SearchResultEmail; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="px-4 py-3 rounded-xl border border-mail-border bg-mail-surface cursor-pointer hover:border-mail-subtle transition-colors group">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-medium text-mail-text truncate">{senderName(email.from_name, email.from_email)}</span>
          <span className="text-[13px] text-mail-muted truncate">{email.subject || '(no subject)'}</span>
        </div>
        <span className="text-[11px] text-mail-subtle font-mono shrink-0 ml-2">{relativeTime(email.received_at)}</span>
      </div>
      <div className="text-[12px] text-mail-subtle mb-2 truncate">{email.summary || email.snippet || ''}</div>
      <div className="flex gap-1">
        {email.match_sources.map((source) => {
          const badge = SOURCE_BADGE[source];
          if (!badge) return null;
          const Icon = badge.icon;
          return (
            <span key={source} className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded"
              style={{ border: `1px solid ${badge.color}25`, color: badge.color }}>
              <Icon size={9} /> {badge.label}
            </span>
          );
        })}
        <span className="text-[9px] text-mail-subtle font-mono ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <ArrowRight size={9} /> Open
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset Card — with image preview for images
// ---------------------------------------------------------------------------

function AssetCard({ asset, onClick }: { asset: AssetResult; onClick: () => void }) {
  const isImage = asset.mimeCategory === 'image' || asset.type === 'inline_image';
  const [imgError, setImgError] = useState(false);
  const name = asset.filename || 'Untitled';

  const CATEGORY_COLORS: Record<string, string> = {
    pdf: '#ef4444', image: '#3b82f6', document: '#6366f1',
    spreadsheet: '#22c55e', presentation: '#f59e0b', archive: '#8b5cf6',
    video: '#ec4899', audio: '#06b6d4', code: '#a3e635', other: '#6b7280',
  };
  const color = CATEGORY_COLORS[asset.mimeCategory] ?? '#6b7280';

  const formatSize = (bytes: number | null) => {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div onClick={onClick}
      className="rounded-lg border border-mail-border bg-mail-surface overflow-hidden cursor-pointer hover:border-mail-accent/40 transition-colors group">
      {/* Preview area */}
      <div className="h-[80px] flex items-center justify-center bg-mail-bg overflow-hidden relative">
        {isImage && !imgError ? (
          <img
            src={`/api/v1/assets/preview/${asset.id}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: `${color}15` }}>
            {isImage ? <Image size={16} style={{ color }} /> : <Paperclip size={16} style={{ color }} />}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-2.5 py-2">
        <div className="text-[11px] font-medium text-mail-text truncate" title={name}>{name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-medium px-1 py-0.5 rounded"
            style={{ background: `${color}15`, color }}>
            {asset.mimeCategory}
          </span>
          {asset.size && <span className="text-[9px] text-mail-subtle font-mono">{formatSize(asset.size)}</span>}
        </div>
      </div>
    </div>
  );
}