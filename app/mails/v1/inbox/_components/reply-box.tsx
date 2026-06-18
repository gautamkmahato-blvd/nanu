// app/mails/v1/inbox/_components/reply-box.tsx
'use client';

import { useEffect, useState } from 'react';
import { Send, SendHorizonal, Loader2, AlertCircle } from 'lucide-react';

type ReplyBoxProps = {
  threadId: string;
  onSent?: () => void | Promise<void>;
};

export function ReplyBox({ threadId, onSent }: ReplyBoxProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setBody(''); setError(''); }, [threadId]);

  async function handleReply(mode: 'reply' | 'replyAll') {
    if (sending) return;
    if (!body.trim()) { setError('Write a message first'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch(`/api/v1/threads/${threadId}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Failed to send');
      setBody('');
      await onSent?.();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send'); }
    finally { setSending(false); }
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleReply('reply'); } }}
        placeholder="Write your reply..."
        disabled={sending}
        rows={4}
        className="w-full px-3.5 py-3 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[13px] font-[inherit] leading-relaxed resize-y outline-none transition-colors placeholder:text-mail-subtle focus:border-mail-accent/40 disabled:opacity-50"
      />

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-400 text-[12px]">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-mail-subtle">⌘/Ctrl + Enter to send</span>
        <div className="flex gap-2">
          <button onClick={() => handleReply('replyAll')} disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] font-medium cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50 disabled:cursor-default">
            <SendHorizonal size={13} /> Reply all
          </button>
          <button onClick={() => handleReply('reply')} disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-[12px] font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default">
            {sending ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : <><Send size={13} /> Reply</>}
          </button>
        </div>
      </div>
    </div>
  );
}