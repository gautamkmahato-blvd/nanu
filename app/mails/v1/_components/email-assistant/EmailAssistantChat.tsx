// components/email-assistant/email-assistant-chat.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import {
  Send, Sparkles, Loader2, CheckCircle, XCircle, X, Zap,
  Mail, Search, Calendar, Clock, Bot,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PendingAction = { callId: string; tool: string; args: Record<string, unknown>; preview: string };
type ChatMessage = { role: 'user' | 'assistant'; content: string; toolsUsed?: string[]; isPending?: boolean };
type EmailContext = { emailId: string; threadId: string; subject: string; fromEmail: string; fromName: string | null; toEmails: string[]; bodySnippet: string };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { label: 'Summarize this email', icon: Sparkles },
  { label: 'What action items are there?', icon: Zap },
  { label: 'Draft a reply', icon: Mail },
  { label: 'Is this urgent?', icon: Clock },
  { label: 'Schedule a meeting', icon: Calendar },
  { label: 'Search related emails', icon: Search },
];

const TOOL_BADGES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  send_email: { label: 'Email', icon: Mail, color: '#3b82f6' },
  reply_to_email: { label: 'Reply', icon: Mail, color: '#22c55e' },
  search_inbox: { label: 'Search', icon: Search, color: '#a78bfa' },
  create_event: { label: 'Calendar', icon: Calendar, color: '#f59e0b' },
  check_availability: { label: 'Availability', icon: Clock, color: '#06b6d4' },
  search_calendar: { label: 'Cal Search', icon: Calendar, color: '#f59e0b' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmailAssistantChat({ emailContext, onClose }: { emailContext: EmailContext; onClose?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || loading || !emailContext) return;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput(''); setLoading(true); scrollToBottom();
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/v1/ai-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg, conversationHistory: history, emailContext }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Failed');
      const data = await res.json();
      if (data.status === 'needs_confirmation') {
        setPendingAction(data.pendingAction);
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message, toolsUsed: data.toolsUsed, isPending: true }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message, toolsUsed: data.toolsUsed }]);
      }
    } catch (err) { setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }]); }
    finally { setLoading(false); scrollToBottom(); }
  }, [emailContext, loading, messages, scrollToBottom]);

  const handleConfirm = useCallback(async () => {
    if (!pendingAction || loading) return;
    setLoading(true);
    setMessages((prev) => prev.map((m) => m.isPending ? { ...m, isPending: false } : m));
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/v1/ai-agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'confirmed', conversationHistory: history, emailContext, pendingAction, confirmed: true }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message ?? 'Done.', toolsUsed: data.toolsUsed }]);
    } catch (err) { setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Failed'}` }]); }
    finally { setPendingAction(null); setLoading(false); scrollToBottom(); }
  }, [pendingAction, loading, messages, emailContext, scrollToBottom]);

  const handleCancel = useCallback(() => {
    setMessages((prev) => [...prev.map((m) => m.isPending ? { ...m, isPending: false } : m), { role: 'assistant' as const, content: 'Action cancelled.' }]);
    setPendingAction(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-mail-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-mail-border shrink-0">
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-lg bg-mail-accent-soft flex items-center justify-center">
      <Bot size={14} className="text-mail-accent" />
    </div>
    <span className="text-[13px] font-semibold text-mail-text">AI Assistant</span>
  </div>
  {onClose && (
    <button onClick={onClose} title="Close" className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
      <X size={15} />
    </button>
  )}
</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-3">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="mt-1">
            <p className="text-[11px] text-mail-subtle m-0 mb-1 truncate">Re: {emailContext?.subject ?? ''}</p>
            <p className="text-[11px] text-mail-subtle/60 m-0 mb-4">Ask questions, draft replies, send emails, or schedule meetings.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} onClick={() => sendMessage(action.label)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[11px] text-left cursor-pointer hover:bg-mail-hover hover:text-mail-text hover:border-mail-subtle transition-colors">
                    <Icon size={12} className="text-mail-subtle shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat */}
        {messages.map((msg, i) => (
          <div key={i} className="mb-4">
            {/* Role + badges */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-semibold ${msg.role === 'user' ? 'text-mail-subtle' : 'text-mail-accent'}`}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </span>
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

            {/* Content */}
            {msg.role === 'user' ? (
              <div className="bg-mail-accent-soft text-mail-text text-[13px] leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tl-sm max-w-[90%]">
                {msg.content}
              </div>
            ) : (
              <div className="text-[13px] text-mail-muted leading-relaxed">
                <MarkdownRenderer content={msg.content} />
              </div>
            )}

            {/* Confirm / Cancel */}
            {msg.isPending && pendingAction && (
              <div className="flex gap-2 mt-3">
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-none bg-green-500 hover:bg-green-600 text-white text-[12px] font-semibold cursor-pointer transition-colors disabled:opacity-60">
                  <CheckCircle size={14} /> Confirm
                </button>
                <button onClick={handleCancel} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover transition-colors">
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-mail-subtle mb-3">
            <Loader2 size={14} className="animate-spin text-mail-accent" />
            {pendingAction ? 'Executing...' : 'Thinking...'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
     {/* Input — modern chat style */}
<div className="px-4 py-3 border-t border-mail-border shrink-0">
  <div className="relative rounded-xl border border-mail-border bg-mail-surface focus-within:border-mail-accent/40 transition-colors">
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
      placeholder={pendingAction ? 'Confirm or cancel above...' : 'Ask anything...'}
      disabled={loading || !!pendingAction}
      rows={2}
      className="w-full px-4 pt-3 pb-8 rounded-xl bg-transparent text-mail-text text-[13px] font-[inherit] outline-none resize-none placeholder:text-mail-subtle disabled:opacity-50"
    />
    <div className="absolute bottom-2 right-2 flex items-center gap-2">
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
  );
}