// app/mails/v1/_components/topbar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, Search, HelpCircle, User, LogOut, ChevronDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Route → page title mapping
// ---------------------------------------------------------------------------

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/mails/v1/dashboard': { title: 'Dashboard', subtitle: 'Your daily overview' },
  '/mails/v1/ai-inbox': { title: 'Priority Inbox', subtitle: 'AI-ranked by importance' },
  '/mails/v1/ai-chat': { title: 'AI Chat', subtitle: 'Search, send, schedule by chatting' },
  '/mails/v1/inbox': { title: 'Inbox' },
  '/mails/v1/important': { title: 'Important', subtitle: 'High-priority emails' },
  '/mails/v1/sent': { title: 'Sent' },
  '/mails/v1/trash': { title: 'Trash' },
  '/mails/v1/board': { title: 'Kanban Board', subtitle: 'Drag to organize' },
  '/mails/v1/categories': { title: 'Categories', subtitle: 'Custom labels & folders' },
  '/mails/v1/tasks-deadlines': { title: 'Tasks & Deadlines', subtitle: 'Action items from emails' },
  '/mails/v1/assets': { title: 'Assets', subtitle: 'Files & documents from emails' },
  '/mails/v1/contacts': { title: 'Contacts', subtitle: 'Relationship intelligence' },
  '/mails/v1/calendar': { title: 'Calendar', subtitle: 'Events & scheduling' },
  '/mails/v1/meeting-prep': { title: 'Meeting Prep', subtitle: 'AI-powered briefings' },
};

function getPageInfo(pathname: string): { title: string; subtitle?: string } {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/mails/v1/ai-email-details/')) {
    return { title: 'Email Detail', subtitle: 'AI intelligence view' };
  }
  return { title: 'Context Mode' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle } = getPageInfo(pathname);

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      // Fallback: redirect anyway
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex items-center justify-between h-14 px-6 border-b border-mail-border bg-mail-bg shrink-0">
      {/* Left: page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-mail-text m-0">{title}</h1>
        {subtitle && (
          <>
            <span className="w-px h-4 bg-mail-border" />
            <span className="text-[12px] text-mail-subtle">{subtitle}</span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button title="Search"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none">
          <Search size={17} strokeWidth={1.7} />
        </button>

        {/* Notifications */}
        <button title="Notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none">
          <Bell size={17} strokeWidth={1.7} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-mail-bg" />
        </button>

        {/* Help */}
        <button title="Help"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none">
          <HelpCircle size={17} strokeWidth={1.7} />
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-mail-border mx-1.5" />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 group"
          >
            <div className="w-8 h-8 rounded-full bg-mail-accent flex items-center justify-center text-white text-[12px] font-bold border-2 border-mail-accent-soft group-hover:border-mail-accent transition-colors duration-150">
              G
            </div>
            <ChevronDown size={12} className={`text-mail-subtle transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-[180px] bg-mail-surface border border-mail-border rounded-xl p-1.5 shadow-2xl z-50">
              <button
                onClick={() => { setProfileOpen(false); router.push('/mails/v1/profile'); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <User size={14} className="text-mail-subtle" />
                Profile
              </button>

              <div className="h-px bg-mail-border my-1" />

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer border-none bg-transparent text-left disabled:opacity-50"
              >
                <LogOut size={14} />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}