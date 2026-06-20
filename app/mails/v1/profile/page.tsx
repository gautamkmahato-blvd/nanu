// app/mails/v1/profile/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, User, Mail, Calendar, MessageSquare, Users,
  ExternalLink, LogOut, Copy, Check, Shield, Clock,
  Inbox, Send, Hash, Link2, Settings,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProfileData = {
  user: { name: string; email: string; tenantId: string; createdAt: string };
  stats: { totalEmails: number; sentEmails: number; receivedEmails: number; threads: number; contacts: number; conversations: number };
  booking: { slug: string; isActive: boolean; displayName: string } | null;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/profile');
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch { window.location.href = '/login'; }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return (
    <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle">
      <Loader2 size={20} className="animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle text-sm">
      Failed to load profile
    </div>
  );

  const { user, stats, booking } = data;
  const initials = user.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: 'long', year: 'numeric',
  });

  const bookingUrl = booking?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${booking.slug}`
    : null;

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[600px] mx-auto px-6 py-8">

        {/* Profile header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-mail-accent flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold m-0 text-mail-text">{user.name || 'User'}</h1>
            <div className="flex items-center gap-1.5 text-sm text-mail-muted mt-1">
              <Mail size={13} /> {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mail-subtle mt-1.5">
              <Clock size={11} /> Member since {memberSince}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={Inbox} label="Emails" value={stats.totalEmails} />
          <StatCard icon={Send} label="Sent" value={stats.sentEmails} />
          <StatCard icon={Hash} label="Threads" value={stats.threads} />
          <StatCard icon={Users} label="Contacts" value={stats.contacts} />
          <StatCard icon={MessageSquare} label="AI Chats" value={stats.conversations} />
          <StatCard icon={Mail} label="Received" value={stats.receivedEmails} />
        </div>

        {/* Connected services */}
        <Section title="Connected Services">
          <div className="flex flex-col gap-2">
            <ServiceRow icon={Mail} name="Gmail" status="Connected" email={user.email} color="#ea4335" />
            <ServiceRow icon={Calendar} name="Google Calendar" status="Connected" email={user.email} color="#4285f4" />
          </div>
        </Section>

        {/* Booking page */}
        <Section title="Booking Page">
          {booking ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-mail-text font-medium">{booking.displayName || user.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    booking.isActive ? 'bg-green-500/10 text-green-400' : 'bg-neutral-500/10 text-neutral-400'
                  }`}>
                    {booking.isActive ? 'Live' : 'Offline'}
                  </span>
                  {bookingUrl && (
                    <span className="text-xs text-mail-subtle font-mono truncate max-w-[250px]">{bookingUrl}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {bookingUrl && (
                  <>
                    <button onClick={() => handleCopy(bookingUrl, 'booking')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[11px] cursor-pointer hover:bg-mail-hover transition-colors">
                      {copied === 'booking' ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      {copied === 'booking' ? 'Copied' : 'Copy'}
                    </button>
                    <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-mail-border text-mail-muted text-[11px] no-underline hover:bg-mail-hover transition-colors">
                      <ExternalLink size={11} /> Open
                    </a>
                  </>
                )}
                <button onClick={() => router.push('/mails/v1/booking-settings')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[11px] cursor-pointer hover:bg-mail-hover transition-colors">
                  <Settings size={11} /> Settings
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-mail-muted">No booking page configured</div>
                <div className="text-xs text-mail-subtle mt-0.5">Let people book meetings with you</div>
              </div>
              <button onClick={() => router.push('/mails/v1/booking-settings')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-xs font-medium cursor-pointer transition-colors">
                <Link2 size={12} /> Set Up
              </button>
            </div>
          )}
        </Section>

        {/* Account info */}
        <Section title="Account">
          <div className="flex flex-col gap-2.5">
            <InfoRow label="Tenant ID" value={user.tenantId} copiable onCopy={() => handleCopy(user.tenantId, 'tenant')} copied={copied === 'tenant'} />
            <InfoRow label="Email" value={user.email} copiable onCopy={() => handleCopy(user.email, 'email')} copied={copied === 'email'} />
            <InfoRow label="Auth" value="Google OAuth 2.0" />
            <InfoRow label="Encryption" value="AES-256-GCM sessions" />
          </div>
        </Section>

        {/* Danger zone */}
        <div className="mt-6 pt-6 border-t border-red-500/10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-400/60 mb-3">Account</div>
          <button onClick={handleLogout} disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-transparent text-red-400 text-xs cursor-pointer hover:bg-red-500/5 transition-colors disabled:opacity-50">
            <LogOut size={13} />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-mail-border bg-mail-surface p-4">
      <div className="flex items-center gap-2 text-mail-subtle mb-2">
        <Icon size={13} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono text-mail-text">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-mail-border">
      <div className="text-[11px] font-bold uppercase tracking-wider text-mail-card-header mb-3">{title}</div>
      {children}
    </div>
  );
}

function ServiceRow({ icon: Icon, name, status, email, color }: {
  icon: React.ElementType; name: string; status: string; email: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-mail-surface border border-mail-border">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-mail-text">{name}</div>
        <div className="text-[11px] text-mail-subtle truncate">{email}</div>
      </div>
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
        {status}
      </span>
    </div>
  );
}

function InfoRow({ label, value, copiable, onCopy, copied }: {
  label: string; value: string; copiable?: boolean; onCopy?: () => void; copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-mail-subtle">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-mail-muted font-mono text-[11px] truncate max-w-[280px]">{value}</span>
        {copiable && onCopy && (
          <button onClick={onCopy}
            className="p-1 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent">
            {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
          </button>
        )}
      </div>
    </div>
  );
}