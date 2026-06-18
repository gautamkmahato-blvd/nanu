// app/mails/v1/priority-contacts/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  UserPlus, Trash2, Bell, Send, Loader2, Check, AlertCircle,
  Star, Shield, ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PriorityContact = { id: string; email: string; name: string | null; notes: string | null; createdAt: string };
type NotificationSettings = { telegramBotToken: string | null; telegramChatId: string | null; telegramEnabled: boolean };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PriorityContactsPage() {
  const [contacts, setContacts] = useState<PriorityContact[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({ telegramBotToken: null, telegramChatId: null, telegramEnabled: false });
  const [loading, setLoading] = useState(true);

  // Add form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Telegram form
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [contactsRes, settingsRes] = await Promise.all([
        fetch('/api/v1/priority-contacts'),
        fetch('/api/v1/notification-settings'),
      ]);
      if (contactsRes.ok) { const d = await contactsRes.json(); setContacts(d.contacts ?? []); }
      if (settingsRes.ok) { const d = await settingsRes.json(); setSettings(d); }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Add contact
  const handleAdd = async () => {
    if (!newEmail.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch('/api/v1/priority-contacts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() || null, notes: newNotes.trim() || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed'); }
      setNewEmail(''); setNewName(''); setNewNotes('');
      showToast('success', `Added ${newEmail.trim()}`);
      loadData();
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed'); }
    finally { setAdding(false); }
  };

  // Delete contact
  const handleDelete = async (id: string, email: string) => {
    try {
      await fetch(`/api/v1/priority-contacts/${id}`, { method: 'DELETE' });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      showToast('success', `Removed ${email}`);
    } catch { showToast('error', 'Failed to delete'); }
  };

  // Save telegram settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (botToken.trim()) body.telegramBotToken = botToken.trim();
      if (chatId.trim()) body.telegramChatId = chatId.trim();

      const res = await fetch('/api/v1/notification-settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setSettings(data);
      setBotToken(''); setChatId('');
      showToast('success', 'Telegram settings saved');
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  // Toggle telegram
  const handleToggle = async () => {
    try {
      const res = await fetch('/api/v1/notification-settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramEnabled: !settings.telegramEnabled }),
      });
      if (res.ok) { const data = await res.json(); setSettings(data); }
    } catch { /* silent */ }
  };

  // Test telegram
  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/v1/notification-settings', { method: 'POST' });
      const data = await res.json();
      if (res.ok) showToast('success', 'Test message sent to Telegram!');
      else showToast('error', data.error ?? 'Test failed');
    } catch { showToast('error', 'Test failed'); }
    finally { setTesting(false); }
  };

  if (loading) {
    return (
      <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle text-sm">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-medium flex items-center gap-2 shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-500/15 border border-green-500/30 text-green-400' : 'bg-red-500/15 border border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="px-6 pt-5 pb-4 border-b border-mail-border">
        <div className="flex items-center gap-2 mb-1">
          <Star size={18} className="text-mail-accent" />
          <h1 className="text-lg font-semibold m-0">Priority Contacts</h1>
        </div>
        <p className="text-xs text-mail-subtle m-0">Get instant Telegram notifications when VIP contacts email you.</p>
      </div>

      <div className="px-6 py-5 max-w-[800px]">
        {/* ── Telegram Setup ── */}
        <div className="rounded-xl border border-mail-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-400" />
              <span className="text-[14px] font-semibold">Telegram Notifications</span>
            </div>
            <button onClick={handleToggle}
              className={`relative w-10 h-5 rounded-full cursor-pointer border-none transition-colors ${settings.telegramEnabled ? 'bg-green-500' : 'bg-mail-hover'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.telegramEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {settings.telegramBotToken ? (
            <div className="text-[12px] text-mail-subtle mb-3">
              <span className="text-green-400 font-medium">Connected</span> · Token: {settings.telegramBotToken} · Chat ID: {settings.telegramChatId ?? 'not set'}
            </div>
          ) : (
            <div className="text-[12px] text-mail-subtle mb-3">
              Not configured. <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-mail-accent hover:underline inline-flex items-center gap-1">
                Create a bot with @BotFather <ExternalLink size={10} />
              </a>
            </div>
          )}

          <div className="flex gap-2 mb-2">
            <input value={botToken} onChange={(e) => setBotToken(e.target.value)}
              placeholder="Bot token (from @BotFather)"
              className="flex-1 px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none placeholder:text-mail-subtle focus:border-mail-accent/30" />
            <input value={chatId} onChange={(e) => setChatId(e.target.value)}
              placeholder="Chat ID"
              className="w-[140px] px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none placeholder:text-mail-subtle focus:border-mail-accent/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveSettings} disabled={saving || (!botToken.trim() && !chatId.trim())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-medium cursor-pointer border-none transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />} Save
            </button>
            <button onClick={handleTest} disabled={testing || !settings.telegramBotToken}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
              {testing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Test
            </button>
          </div>
        </div>

        {/* ── Add Contact ── */}
        <div className="rounded-xl border border-mail-border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={16} className="text-mail-accent" />
            <span className="text-[14px] font-semibold">Add Priority Contact</span>
          </div>
          <div className="flex flex-col gap-2">
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email address (required)"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className="px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none placeholder:text-mail-subtle focus:border-mail-accent/30" />
            <div className="flex gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Name (optional)"
                className="flex-1 px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none placeholder:text-mail-subtle focus:border-mail-accent/30" />
              <input value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="flex-1 px-3 py-2 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none placeholder:text-mail-subtle focus:border-mail-accent/30" />
            </div>
            <button onClick={handleAdd} disabled={adding || !newEmail.trim()}
              className="self-start flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-medium cursor-pointer border-none transition-colors disabled:opacity-50">
              {adding ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />} Add Contact
            </button>
          </div>
        </div>

        {/* ── Contact List ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-mail-accent" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-mail-subtle">Priority List ({contacts.length})</span>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 text-mail-subtle text-[13px]">
              No priority contacts yet. Add email addresses above to get notified.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-mail-border hover:bg-mail-hover transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-mail-accent-soft flex items-center justify-center text-[12px] font-bold text-mail-accent shrink-0">
                    {(contact.name || contact.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-mail-text">
                      {contact.name || contact.email.split('@')[0]}
                    </div>
                    <div className="text-[11px] text-mail-subtle truncate">{contact.email}</div>
                  </div>
                  {contact.notes && (
                    <span className="text-[10px] text-mail-subtle px-2 py-0.5 rounded bg-mail-hover shrink-0 max-w-[150px] truncate">{contact.notes}</span>
                  )}
                  <button onClick={() => handleDelete(contact.id, contact.email)}
                    className="p-1.5 rounded-md text-mail-subtle hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none bg-transparent">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
