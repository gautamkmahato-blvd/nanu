'use client';

import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  HelpCircle,
  Zap,
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
  '/mails/v1/contacts': { title: 'Contacts', subtitle: 'Relationship intelligence' },
  '/mails/v1/calendar': { title: 'Calendar', subtitle: 'Events & scheduling' },
  '/mails/v1/meeting-prep': { title: 'Meeting Prep', subtitle: 'AI-powered briefings' },
};

function getPageInfo(pathname: string): { title: string; subtitle?: string } {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Prefix match for dynamic routes
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
  const { title, subtitle } = getPageInfo(pathname);

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
        <button
          title="Search"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none"
        >
          <Search size={17} strokeWidth={1.7} />
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none"
        >
          <Bell size={17} strokeWidth={1.7} />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-mail-bg" />
        </button>

        {/* Help */}
        <button
          title="Help"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none"
        >
          <HelpCircle size={17} strokeWidth={1.7} />
        </button>

        {/* Divider */}
        <span className="w-px h-6 bg-mail-border mx-1.5" />

        {/* Profile */}
        <button
          title="Profile"
          className="w-8 h-8 rounded-full bg-mail-accent flex items-center justify-center text-white text-[12px] font-bold cursor-pointer border-2 border-mail-accent-soft hover:border-mail-accent transition-colors duration-150"
        >
          G
        </button>
      </div>
    </div>
  );
}
