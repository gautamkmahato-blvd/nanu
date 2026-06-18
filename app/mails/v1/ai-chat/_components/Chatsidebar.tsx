// app/mails/v1/ai-chat/_components/ChatSidebar.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft,
  Loader2, Search, MoreHorizontal, Pencil, Check, X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Conversation = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

type ChatSidebarProps = {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatSidebar({ activeConversationId, onSelectConversation, onNewChat, onDeleteConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/ai-chat/conversations');
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Refresh when active conversation changes (new messages might update title)
  useEffect(() => { if (activeConversationId) loadConversations(); }, [activeConversationId, loadConversations]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/ai-chat/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      onDeleteConversation(id);
    } catch { /* silent */ }
    setMenuOpenId(null);
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      await fetch(`/api/v1/ai-chat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: editTitle.trim() } : c));
    } catch { /* silent */ }
    setEditingId(null);
  };

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const filtered = searchQuery.trim()
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // ── Collapsed state ──
  if (collapsed) {
    return (
      <div className="w-[48px] shrink-0 border-r border-mail-border bg-mail-sidebar flex flex-col items-center py-3 h-full">
        <button onClick={() => setCollapsed(false)} title="Expand chat history"
          className="p-2 rounded-lg text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent mb-3">
          <PanelLeft size={16} />
        </button>
        <button onClick={onNewChat} title="New chat"
          className="p-2 rounded-lg text-mail-accent hover:bg-mail-accent-soft transition-colors cursor-pointer border-none bg-transparent">
          <Plus size={16} />
        </button>
      </div>
    );
  }

  // ── Expanded state ──
  return (
    <div className="w-[240px] shrink-0 border-r border-mail-border bg-mail-sidebar flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-mail-border shrink-0">
        <span className="text-[12px] font-semibold text-mail-text">Chat History</span>
        <div className="flex items-center gap-0.5">
          <button onClick={onNewChat} title="New chat"
            className="p-1.5 rounded-md text-mail-accent hover:bg-mail-accent-soft transition-colors cursor-pointer border-none bg-transparent">
            <Plus size={14} />
          </button>
          <button onClick={() => setCollapsed(true)} title="Collapse"
            className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2 shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mail-subtle" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-[11px] outline-none placeholder:text-mail-subtle focus:border-mail-accent/30 transition-colors"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-1.5">
        {loading && (
          <div className="flex items-center justify-center py-8 text-mail-subtle text-[11px] gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-8 text-mail-subtle text-[11px]">
            {searchQuery ? 'No matches' : 'No conversations yet'}
          </div>
        )}

        {filtered.map((conv) => {
          const isActive = conv.id === activeConversationId;
          const isEditing = editingId === conv.id;
          const isMenuOpen = menuOpenId === conv.id;

          return (
            <div key={conv.id}
              className={`group relative rounded-lg mb-0.5 transition-colors ${isActive ? 'bg-mail-accent-soft' : 'hover:bg-mail-hover'}`}>

              {isEditing ? (
                /* Rename mode */
                <div className="flex items-center gap-1 px-2.5 py-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(conv.id); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 rounded border border-mail-accent/30 bg-mail-bg text-mail-text text-[11px] outline-none"
                  />
                  <button onClick={() => handleRename(conv.id)} className="p-0.5 text-green-400 border-none bg-transparent cursor-pointer"><Check size={12} /></button>
                  <button onClick={() => setEditingId(null)} className="p-0.5 text-mail-subtle border-none bg-transparent cursor-pointer"><X size={12} /></button>
                </div>
              ) : (
                /* Normal mode */
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex items-start gap-2 w-full px-2.5 py-2 text-left cursor-pointer border-none bg-transparent"
                >
                  <MessageSquare size={13} className={`shrink-0 mt-0.5 ${isActive ? 'text-mail-accent' : 'text-mail-subtle'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-medium truncate ${isActive ? 'text-mail-accent' : 'text-mail-text'}`}>
                      {conv.title}
                    </div>
                    <div className="text-[10px] text-mail-subtle mt-0.5">
                      {conv.messageCount} msg · {relTime(conv.updatedAt)}
                    </div>
                  </div>

                  {/* 3-dot menu */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuOpenId(isMenuOpen ? null : conv.id)}
                      className="p-0.5 rounded text-mail-subtle hover:text-mail-muted border-none bg-transparent cursor-pointer">
                      <MoreHorizontal size={12} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-2 top-full mt-0.5 bg-mail-surface border border-mail-border rounded-lg p-1 z-30 min-w-[100px] shadow-xl">
                        <button onClick={() => startRename(conv)}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[10px] text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left">
                          <Pencil size={10} /> Rename
                        </button>
                        <button onClick={() => handleDelete(conv.id)}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[10px] text-red-400 hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent text-left">
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}