// app/mails/v1/contacts/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MarkdownRenderer from '../_components/ui/MarkdownRenderer';
import {
  Loader2, Search, RefreshCw, Users, Mail, Send, Calendar,
  Clock, AlertTriangle, X, Bot, Sparkles,
  MessageSquare, ArrowRight, Filter,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContactIntelligence = {
  email: string;
  name: string | null;
  emailsReceived: number;
  emailsSent: number;
  totalThreads: number;
  lastEmailAt: string;
  firstEmailAt: string;
  relationshipType: string | null;
  latestSentiment: string | null;
  primaryTag: string | null;
  pendingCount: number;
  topics: string[];
  initials: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RELATIONSHIP_COLORS: Record<string, string> = {
  investor: '#f59e0b', manager: '#f59e0b', founder: '#f59e0b',
  client: '#22c55e', partner: '#3b82f6', lead: '#8b5cf6',
  vendor: '#6366f1', coworker: '#06b6d4', friend: '#ec4899',
  personal_contact: '#ec4899', other: '#6b7280',
};

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '🟢', neutral: '🟡', negative: '🔴',
};

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'emails', label: 'Most Emails' },
  { value: 'threads', label: 'Most Threads' },
  { value: 'name', label: 'Name A-Z' },
];

const TOOL_BADGES: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  search_inbox: { label: 'Search', icon: Search, color: '#a78bfa' },
  search_assets: { label: 'Assets', icon: Mail, color: '#f97316' },
  send_email: { label: 'Email', icon: Mail, color: '#3b82f6' },
  create_event: { label: 'Calendar', icon: Calendar, color: '#f59e0b' },
  check_availability: { label: 'Availability', icon: Clock, color: '#06b6d4' },
  search_calendar: { label: 'Cal Search', icon: Calendar, color: '#f59e0b' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(name: string | null, email: string): string {
  if (name) return name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Side panel: null = closed, 'general' = general chat, ContactIntelligence = specific contact
  const [activeContact, setActiveContact] = useState<ContactIntelligence | 'general' | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/v1/contacts');
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const data = await res.json();
      setContacts(data.contacts);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived filter options
  const relationshipTypes = useMemo(() => {
    const types = new Set(contacts.map((c) => c.relationshipType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [contacts]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...contacts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.email.toLowerCase().includes(q) ||
        (c.name?.toLowerCase().includes(q) ?? false) ||
        (c.relationshipType?.toLowerCase().includes(q) ?? false) ||
        c.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterRelationship) result = result.filter((c) => c.relationshipType === filterRelationship);
    if (filterSentiment) result = result.filter((c) => c.latestSentiment === filterSentiment);
    if (filterPending) result = result.filter((c) => c.pendingCount > 0);

    switch (sortBy) {
      case 'recent': result.sort((a, b) => new Date(b.lastEmailAt).getTime() - new Date(a.lastEmailAt).getTime()); break;
      case 'emails': result.sort((a, b) => (b.emailsReceived + b.emailsSent) - (a.emailsReceived + a.emailsSent)); break;
      case 'threads': result.sort((a, b) => b.totalThreads - a.totalThreads); break;
      case 'name': result.sort((a, b) => displayName(a.name, a.email).localeCompare(displayName(b.name, b.email))); break;
    }

    return result;
  }, [contacts, searchQuery, filterRelationship, filterSentiment, filterPending, sortBy]);

  const hasActiveFilters = filterRelationship || filterSentiment || filterPending;
  const clearFilters = () => { setFilterRelationship(''); setFilterSentiment(''); setFilterPending(false); setSearchQuery(''); };
  const totalEmails = contacts.reduce((s, c) => s + c.emailsReceived + c.emailsSent, 0);
  const pendingTotal = contacts.reduce((s, c) => s + c.pendingCount, 0);
  const isPanelOpen = activeContact !== null;

  return (
    <div className="flex h-full bg-mail-bg text-mail-text font-sans">
      {/* Main content */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto sidebar-scroll">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-mail-border">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-mail-accent" />
                <h1 className="text-lg font-semibold m-0">Contact Intelligence</h1>
              </div>
              <p className="text-xs text-mail-subtle mt-1 m-0 font-mono">
                {contacts.length} contacts · {totalEmails} emails
                {pendingTotal > 0 && <span className="text-yellow-500 ml-2">· {pendingTotal} pending</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveContact(isPanelOpen ? null : 'general')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  isPanelOpen
                    ? 'border-mail-accent/30 bg-transparent text-mail-accent'
                    : 'border-mail-border text-mail-muted hover:bg-mail-hover'
                }`}
              >
                <MessageSquare size={12} /> AI Chat
              </button>
              <button onClick={load} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Search + Sort + Filter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative max-w-[400px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mail-subtle" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, topic..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-mail-border bg-mail-surface text-mail-text text-xs outline-none focus:border-mail-accent/40 transition-colors placeholder:text-mail-subtle" />
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-mail-border bg-mail-surface text-mail-text text-xs outline-none cursor-pointer appearance-none pr-8 bg-no-repeat bg-[length:12px] bg-[position:right_8px_center]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-mail-accent/30 bg-transparent text-mail-accent'
                  : 'border-mail-border text-mail-muted hover:bg-mail-hover'
              }`}>
              <Filter size={12} /> Filters
              {hasActiveFilters && (
                <span onClick={(e) => { e.stopPropagation(); clearFilters(); }} className="ml-1 cursor-pointer">
                  <X size={10} />
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-mail-border">
              {relationshipTypes.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1">Relationship</div>
                  <select value={filterRelationship} onChange={(e) => setFilterRelationship(e.target.value)}
                    className="px-2 py-1.5 rounded-md border border-mail-border bg-mail-surface text-mail-text text-xs outline-none cursor-pointer">
                    <option value="">All</option>
                    {relationshipTypes.map((r) => <option key={r} value={r}>{capitalize(r)}</option>)}
                  </select>
                </div>
              )}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1">Sentiment</div>
                <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}
                  className="px-2 py-1.5 rounded-md border border-mail-border bg-mail-surface text-mail-text text-xs outline-none cursor-pointer">
                  <option value="">All</option>
                  <option value="positive">🟢 Positive</option>
                  <option value="neutral">🟡 Neutral</option>
                  <option value="negative">🔴 Negative</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1">Status</div>
                <button onClick={() => setFilterPending(!filterPending)}
                  className={`px-2 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                    filterPending ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500' : 'border-mail-border bg-mail-surface text-mail-muted'
                  }`}>
                  <AlertTriangle size={10} className="inline mr-1" /> Has Pending
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-[13px]">{error}</div>}

        {/* Loading */}
        {loading && contacts.length === 0 && (
          <div className="flex items-center justify-center py-16 text-mail-subtle text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading contacts...
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Users size={36} strokeWidth={1} className="text-mail-subtle opacity-30" />
            <div className="text-base font-medium text-mail-text">
              {hasActiveFilters || searchQuery ? 'No contacts match' : 'No contacts found'}
            </div>
            <div className="text-[13px] text-mail-subtle">
              {hasActiveFilters || searchQuery ? 'Try adjusting your filters' : 'Sync your emails to build your contact list'}
            </div>
            {(hasActiveFilters || searchQuery) && (
              <button onClick={clearFilters} className="mt-2 px-4 py-2 rounded-lg border border-mail-border text-mail-muted text-xs hover:bg-mail-hover transition-colors cursor-pointer">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((contact) => (
              <ContactCard key={contact.email} contact={contact}
                isActive={activeContact !== 'general' && activeContact !== null && activeContact.email === contact.email}
                onClick={() => setActiveContact(
                  activeContact !== 'general' && activeContact !== null && activeContact.email === contact.email ? null : contact
                )} />
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      {activeContact !== null && (
        <ContactChatPanel
          contact={activeContact === 'general' ? null : activeContact}
          onClose={() => setActiveContact(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact Card
// ---------------------------------------------------------------------------

function ContactCard({ contact, isActive, onClick }: {
  contact: ContactIntelligence; isActive: boolean; onClick: () => void;
}) {
  const relColor = RELATIONSHIP_COLORS[contact.relationshipType ?? 'other'] ?? '#6b7280';
  const sentiment = SENTIMENT_EMOJI[contact.latestSentiment ?? 'neutral'] ?? '🟡';
  const MAX_TAGS = 6;

  return (
    <div onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-colors h-[200px] flex flex-col ${
        isActive ? 'border-mail-accent bg-mail-accent-soft/30' : 'border-mail-border bg-mail-surface hover:border-mail-subtle'
      }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{ background: `${relColor}15`, color: relColor }}>
          {contact.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-mail-text truncate">{displayName(contact.name, contact.email)}</span>
            {contact.relationshipType && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: `${relColor}15`, color: relColor }}>
                {capitalize(contact.relationshipType)}
              </span>
            )}
          </div>
          <div className="text-[11px] text-mail-subtle truncate mt-0.5">{contact.email}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[11px] mb-3">
        <span className="text-mail-muted"><span className="font-semibold text-mail-text font-mono">{contact.emailsReceived + contact.emailsSent}</span> emails</span>
        <span className="text-mail-muted"><span className="font-semibold text-mail-text font-mono">{contact.totalThreads}</span> threads</span>
        <span className="text-mail-subtle">{relativeTime(contact.lastEmailAt)}</span>
        <span>{sentiment}</span>
        {contact.pendingCount > 0 && (
          <span className="text-yellow-500 flex items-center gap-0.5">
            <AlertTriangle size={10} /> {contact.pendingCount}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex-1 min-h-0">
        <div className="flex flex-wrap gap-1 max-h-[40px] overflow-hidden">
          {contact.topics.slice(0, MAX_TAGS).map((topic) => (
            <span key={topic} className="text-[10px] px-2 py-0.5 rounded-md bg-mail-chip text-mail-subtle">{topic}</span>
          ))}
          {contact.topics.length > MAX_TAGS && (
            <span className="text-[10px] text-mail-subtle px-1 py-0.5">+{contact.topics.length - MAX_TAGS}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 text-[10px] text-mail-subtle mt-2">
        <MessageSquare size={10} /> Click to chat
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact Chat Side Panel
// ---------------------------------------------------------------------------

const CONTACT_QUICK_ACTIONS = [
  { label: 'Show recent emails', icon: Mail },
  { label: 'What have we discussed?', icon: Search },
  { label: 'Any pending items?', icon: AlertTriangle },
  { label: 'Draft an email', icon: Send },
  { label: 'Schedule a meeting', icon: Calendar },
];

const GENERAL_QUICK_ACTIONS = [
  { label: 'Who emails me the most?', icon: Users },
  { label: 'Show contacts with pending items', icon: AlertTriangle },
  { label: 'Find emails about pricing discussions', icon: Search },
  { label: 'Who did I last talk to this week?', icon: Clock },
  { label: 'Send an email', icon: Send },
];

function ContactChatPanel({ contact, onClose }: { contact: ContactIntelligence | null; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const isGeneral = contact === null;
  const name = contact ? displayName(contact.name, contact.email) : 'Contacts';
  const relColor = contact ? (RELATIONSHIP_COLORS[contact.relationshipType ?? 'other'] ?? '#6b7280') : '#6b7280';

  // Build context for the agent
  const contactContext = useMemo(() => {
    if (!contact) {
      return 'The user wants to ask about their contacts in general. Use search_inbox to find emails by or about specific people. You can help find contacts, check email history, send emails, or schedule meetings with anyone.';
    }
    const cName = displayName(contact.name, contact.email);
    const parts = [
      `The user is asking about their contact: ${cName} (${contact.email}).`,
      `Email stats: ${contact.emailsReceived} received, ${contact.emailsSent} sent, ${contact.totalThreads} threads.`,
      contact.relationshipType ? `Relationship: ${contact.relationshipType}.` : null,
      contact.latestSentiment ? `Latest sentiment: ${contact.latestSentiment}.` : null,
      contact.pendingCount > 0 ? `${contact.pendingCount} pending items waiting on user.` : null,
      contact.topics.length > 0 ? `Common topics: ${contact.topics.join(', ')}.` : null,
      `Last email: ${relativeTime(contact.lastEmailAt)}.`,
      `Use search_inbox to find specific emails from or about ${contact.email}.`,
      `When the user says "send email" or "draft", use send_email with to: ["${contact.email}"].`,
      `When the user says "schedule meeting", use create_event with attendeeEmails: ["${contact.email}"].`,
    ];
    return parts.filter(Boolean).join(' ');
  }, [contact]);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput(''); setLoading(true); scrollToBottom();

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const isFirst = messages.length === 0;
      const messageToSend = isFirst
        ? `[Contact context: ${contactContext}]\n\nUser question: ${userMsg}`
        : userMsg;

      const res = await fetch('/api/v1/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, conversationHistory: history }),
      });

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Failed');
      const data = await res.json();

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message, toolsUsed: data.toolsUsed }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }]);
    } finally { setLoading(false); scrollToBottom(); }
  }, [loading, messages, contactContext, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // Reset on contact change
  useEffect(() => { setMessages([]); setInput(''); }, [contact?.email]);

  const quickActions = isGeneral ? GENERAL_QUICK_ACTIONS : CONTACT_QUICK_ACTIONS;

  return (
    <div className="w-[380px] shrink-0 h-full border-l border-mail-border bg-mail-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-mail-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {contact ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: `${relColor}15`, color: relColor }}>
                {contact.initials}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-mail-accent-soft flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-mail-accent" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-mail-text truncate">{name}</div>
              <div className="text-[11px] text-mail-subtle truncate">
                {contact ? contact.email : 'Ask about any contact'}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Stats bar (only for specific contact) */}
        {contact && (
          <div className="flex items-center gap-3 text-[10px] text-mail-subtle">
            <span><span className="font-semibold text-mail-text">{contact.emailsReceived + contact.emailsSent}</span> emails</span>
            <span><span className="font-semibold text-mail-text">{contact.totalThreads}</span> threads</span>
            <span>{relativeTime(contact.lastEmailAt)}</span>
            {contact.relationshipType && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{ background: `${relColor}15`, color: relColor }}>
                {capitalize(contact.relationshipType)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center mt-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-mail-accent-soft flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-mail-accent" />
            </div>
            <div className="text-[13px] font-medium text-mail-text mb-1">
              {isGeneral ? 'Contact Intelligence' : `Ask about ${name}`}
            </div>
            <div className="text-[11px] text-mail-subtle mb-4">
              {isGeneral ? 'Search contacts, check history, or take actions' : 'Search emails, check history, or take actions'}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const suffix = !isGeneral && contact ? ` with ${displayName(contact.name, contact.email)}` : '';
                return (
                  <button key={action.label} onClick={() => sendMessage(action.label + suffix)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[12px] cursor-pointer hover:bg-mail-hover hover:text-mail-text transition-colors text-left w-full">
                    <Icon size={13} className="text-mail-subtle shrink-0" />
                    {action.label}
                    <ArrowRight size={10} className="ml-auto text-mail-subtle" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className="mb-4">
            <div className="flex gap-2.5 items-start">
              {msg.role === 'user' ? (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">Y</div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-mail-accent-soft flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-mail-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    {msg.toolsUsed.map((tool) => {
                      const badge = TOOL_BADGES[tool];
                      if (!badge) return null;
                      const Icon = badge.icon;
                      return (
                        <span key={tool} className="inline-flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded"
                          style={{ background: `${badge.color}12`, color: badge.color, border: `1px solid ${badge.color}20` }}>
                          <Icon size={8} /> {badge.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                {msg.role === 'user' ? (
                  <div className="text-[13px] text-mail-text leading-relaxed bg-mail-surface border border-mail-border rounded-xl rounded-tl-sm px-3 py-2">
                    {msg.content}
                  </div>
                ) : (
                  <div className="text-[13px] text-mail-muted leading-relaxed">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-mail-accent-soft flex items-center justify-center shrink-0">
              <Bot size={12} className="text-mail-accent" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-mail-subtle">
              <Loader2 size={12} className="animate-spin text-mail-accent" /> Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-mail-border shrink-0">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGeneral ? 'Ask about your contacts...' : `Ask about ${name}...`}
            disabled={loading}
            className="w-full px-3 py-2.5 pr-10 rounded-lg border border-mail-border bg-mail-surface text-mail-text text-[13px] outline-none focus:border-mail-accent/40 transition-colors placeholder:text-mail-subtle disabled:opacity-50" />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none transition-all ${
              input.trim() ? 'bg-mail-accent text-white' : 'bg-transparent text-mail-subtle'
            }`}>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}