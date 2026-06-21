// app/mails/v1/ai-settings/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Key, Save, Check, Trash2, Eye, EyeOff,
  Zap, Shield, RefreshCw, AlertTriangle,
  MessageSquare, Mail, Search, Bot,
} from 'lucide-react';

type ApiKeyStatus = { hasApiKey: boolean; maskedKey: string | null; syncLimit: number };
type UsageLimits = {
  chatLimit: number; chatUsed: number; chatRemaining: number;
  syncLimit: number; isByok: boolean; isUnlimited: boolean;
};

export default function AISettingsPage() {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [syncLimit, setSyncLimit] = useState(20);
  const [savingSync, setSavingSync] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [keyRes, usageRes] = await Promise.all([fetch('/api/v1/settings/api-key'), fetch('/api/v1/settings/usage')]);
      const keyData = await keyRes.json();
      const usageData = await usageRes.json();
      setStatus(keyData); setUsage(usageData); setSyncLimit(keyData.syncLimit ?? 20);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setSaving(true); setError(''); setSuccess(''); setSaved(false);
    try {
      const res = await fetch('/api/v1/settings/api-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: apiKey.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSuccess(data.message); setApiKey(''); setSaved(true); setTimeout(() => setSaved(false), 3000); load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setSaving(false); }
  };

  const handleRemoveKey = async () => {
    if (!confirm('Remove your API key? You will revert to the free tier (20 chats/day, sync limit 20).')) return;
    setRemoving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/v1/settings/api-key', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSuccess(data.message); load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setRemoving(false); }
  };

  const handleSaveSyncLimit = async () => {
    setSavingSync(true); setError('');
    try {
      const res = await fetch('/api/v1/settings/sync-limit', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ syncLimit }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSuccess('Sync limit updated'); setTimeout(() => setSuccess(''), 3000); load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setSavingSync(false); }
  };

  if (loading) return <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle"><Loader2 size={20} className="animate-spin" /></div>;

  const isByok = status?.hasApiKey ?? false;

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[640px] mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold m-0 flex items-center gap-2"><Zap size={18} className="text-mail-accent" /> AI Settings</h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">Manage your API key, usage limits, and sync preferences</p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors"><RefreshCw size={12} /> Refresh</button>
        </div>

        {error && <div className="px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-xs mb-4">{error}</div>}
        {success && <div className="px-4 py-2.5 rounded-lg bg-green-500/5 border border-green-500/20 text-green-400 text-xs mb-4">{success}</div>}

        {/* Plan */}
        <Section title="Current Plan">
          <div className={`rounded-lg border p-4 ${isByok ? 'border-green-500/30 bg-green-500/5' : 'border-mail-border bg-mail-surface'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold ${isByok ? 'text-green-400' : 'text-mail-text'}`}>{isByok ? 'BYOK (Your Own Key)' : 'Free Tier'}</span>
              {isByok && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">Active</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-mail-muted">
              <span className="flex items-center gap-1"><MessageSquare size={11} /> {isByok ? 'Unlimited chats' : `${usage?.chatUsed ?? 0}/20 chats today`}</span>
              <span className="flex items-center gap-1"><Mail size={11} /> Sync: {isByok ? syncLimit : 20}</span>
              <span className="flex items-center gap-1"><Key size={11} /> {isByok ? 'Your key' : 'Platform key'}</span>
            </div>
          </div>
        </Section>

        {/* Usage */}
        {usage && (
          <Section title="Usage Today">
            <div className="flex items-center gap-4">
              <div className="flex-1 rounded-lg border border-mail-border bg-mail-surface p-4 text-center">
                <div className="text-2xl font-bold font-mono text-mail-text">
                  {usage.chatUsed}
                  {!isByok && <span className="text-sm text-mail-subtle font-normal">/20</span>}
                  {isByok && <span className="text-xs text-green-400 font-normal ml-1">∞</span>}
                </div>
                <div className="text-[10px] text-mail-subtle mt-1">AI Chats Used</div>
              </div>
              {!isByok && (
                <div className="flex-1 rounded-lg border border-mail-border bg-mail-surface p-4 text-center">
                  <div className={`text-2xl font-bold font-mono ${usage.chatRemaining <= 5 ? 'text-yellow-400' : 'text-mail-text'}`}>
                    {usage.chatRemaining}
                  </div>
                  <div className="text-[10px] text-mail-subtle mt-1">Remaining</div>
                </div>
              )}
            </div>
            {!isByok && usage.chatUsed >= 15 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
                <AlertTriangle size={12} /> Running low! Add your API key for unlimited access.
              </div>
            )}
          </Section>
        )}

        {/* API Key */}
        <Section title="OpenRouter API Key">
          {isByok && status?.maskedKey ? (
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-mail-muted font-mono">{status.maskedKey}</div>
                <div className="text-[10px] text-mail-subtle mt-1">Encrypted with AES-256-GCM</div>
              </div>
              <button onClick={handleRemoveKey} disabled={removing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs cursor-pointer hover:bg-red-500/5 transition-colors disabled:opacity-50">
                {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove
              </button>
            </div>
          ) : (
            <div className="mb-3">
              <label className="text-[11px] font-medium text-mail-subtle mb-1.5 block">Paste your OpenRouter API key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mail-subtle" />
                  <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..." className="w-full pl-8 pr-10 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-xs outline-none focus:border-mail-accent/40 font-mono placeholder:text-mail-subtle" />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-mail-subtle hover:text-mail-muted border-none bg-transparent cursor-pointer">
                    {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <button onClick={handleSaveKey} disabled={saving || !apiKey.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 shrink-0">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Save size={12} />}
                  {saving ? 'Validating...' : saved ? 'Saved!' : 'Save Key'}
                </button>
              </div>
              <div className="text-[10px] text-mail-subtle mt-1.5">
                Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-mail-accent hover:underline">openrouter.ai/keys</a>. Validated before saving.
              </div>
            </div>
          )}
          <div className="rounded-lg border border-mail-border bg-mail-surface p-3 mt-3">
            <div className="text-[11px] font-semibold text-mail-card-header mb-2">With your own key:</div>
            <div className="text-xs text-mail-muted space-y-1.5">
              <div className="flex items-center gap-2"><Check size={11} className="text-green-400 shrink-0" /> Unlimited AI chats per day</div>
              <div className="flex items-center gap-2"><Check size={11} className="text-green-400 shrink-0" /> Sync up to 500 emails per sync</div>
              <div className="flex items-center gap-2"><Check size={11} className="text-green-400 shrink-0" /> AI analysis on all synced emails</div>
              <div className="flex items-center gap-2"><Shield size={11} className="text-green-400 shrink-0" /> Key encrypted, decrypted only at runtime</div>
            </div>
          </div>
        </Section>

        {/* Sync Limit */}
        <Section title="Email Sync Limit">
          <div className="text-xs text-mail-subtle mb-3">Emails to sync and AI-analyze per sync. Higher = more API usage.</div>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={isByok ? 500 : 20} value={syncLimit} onChange={(e) => setSyncLimit(Number(e.target.value))}
              disabled={!isByok} className="w-[200px] accent-green-500 disabled:opacity-40" />
            <span className="text-sm font-semibold font-mono text-mail-text w-[40px] text-right">{syncLimit}</span>
            {isByok && (
              <button onClick={handleSaveSyncLimit} disabled={savingSync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
                {savingSync ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
            )}
          </div>
          {!isByok && <div className="text-[10px] text-mail-subtle mt-2">Fixed at 20 on free tier. Add your API key to unlock up to 500.</div>}
        </Section>

        {/* Security */}
        <Section title="Security">
          <div className="text-xs text-mail-muted leading-relaxed space-y-2">
            <p className="flex items-start gap-2 m-0"><Shield size={12} className="text-mail-accent shrink-0 mt-0.5" /> Keys are encrypted with AES-256-GCM using your instance's master key.</p>
            <p className="flex items-start gap-2 m-0"><Shield size={12} className="text-mail-accent shrink-0 mt-0.5" /> Decrypted only in server memory during API calls — never logged or sent to frontend.</p>
            <p className="flex items-start gap-2 m-0"><Shield size={12} className="text-mail-accent shrink-0 mt-0.5" /> Remove your key anytime to revert to the free tier.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-mail-border last:border-b-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-mail-card-header mb-3">{title}</div>
      {children}
    </div>
  );
}
