'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './theme-provider';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  MessageSquare,
  Send,
  Trash2,
  Star,
  KanbanSquare,
  Tags,
  CheckSquare,
  Users,
  Calendar,
  Target,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/mails/v1/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/mails/v1/ai-inbox', label: 'Priority Inbox', icon: Sparkles, badge: 'AI' },
      { href: '/mails/v1/ai-chat', label: 'AI Chat', icon: MessageSquare, badge: 'Agent' },
    ],
  },
  {
    title: 'Email',
    items: [
      { href: '/mails/v1/inbox', label: 'Inbox', icon: Inbox },
      { href: '/mails/v1/important', label: 'Important', icon: Star },
      { href: '/mails/v1/sent', label: 'Sent', icon: Send },
      { href: '/mails/v1/trash', label: 'Trash', icon: Trash2 },
    ],
  },
  {
    title: 'Organize',
    items: [
      { href: '/mails/v1/board', label: 'Kanban Board', icon: KanbanSquare },
      { href: '/mails/v1/categories', label: 'Categories', icon: Tags },
      { href: '/mails/v1/tasks-deadlines', label: 'Tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/mails/v1/contacts', label: 'Contacts', icon: Users },
    ],
  },
  {
    title: 'Calendar',
    items: [
      { href: '/mails/v1/calendar', label: 'Calendar', icon: Calendar },
      { href: '/mails/v1/meeting-prep', label: 'Meeting Prep', icon: Target, badge: 'AI' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MailsSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col h-screen shrink-0 border-r border-mail-border
        bg-mail-sidebar transition-all duration-200 ease-in-out
        ${collapsed ? 'w-[60px]' : 'w-[220px]'}
      `}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-mail-border ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-mail-accent flex items-center justify-center shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-mail-text tracking-tight truncate">
            Context Mode
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-widest text-mail-subtle px-2 mb-1.5">
                {section.title}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      group flex items-center gap-2.5 rounded-lg text-[13px] font-medium
                      transition-colors duration-100 no-underline relative
                      ${collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-[7px]'}
                      ${active
                        ? 'bg-mail-accent-soft text-mail-accent'
                        : 'text-mail-muted hover:bg-mail-hover hover:text-mail-text'
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-mail-accent" />
                    )}
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`
                            ml-auto text-[9px] font-semibold px-1.5 py-px rounded-full shrink-0
                            ${item.badge === 'Agent'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-mail-accent-soft text-mail-accent border border-mail-accent/20'
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="shrink-0 border-t border-mail-border px-2.5 py-2.5 flex flex-col gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`
            flex items-center gap-2.5 rounded-lg text-[13px] font-medium
            text-mail-muted hover:bg-mail-hover hover:text-mail-text
            transition-colors duration-100 cursor-pointer border-none bg-transparent
            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-[7px]'}
          `}
        >
          {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} className="shrink-0" /> : <Moon size={17} strokeWidth={1.8} className="shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`
            flex items-center gap-2.5 rounded-lg text-[13px] font-medium
            text-mail-muted hover:bg-mail-hover hover:text-mail-text
            transition-colors duration-100 cursor-pointer border-none bg-transparent
            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-[7px]'}
          `}
        >
          {collapsed ? <PanelLeft size={17} strokeWidth={1.8} /> : <PanelLeftClose size={17} strokeWidth={1.8} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
