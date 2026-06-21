'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  PenSquare,
  Paperclip,
  Zap,
  Clock,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: string };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
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
      { href: '/mails/v1/scheduled', label: 'Scheduled', icon: Clock },
      { href: '/mails/v1/trash', label: 'Trash', icon: Trash2 },
    ],
  },
  {
    title: 'Organize',
    items: [
      { href: '/mails/v1/board', label: 'Kanban Board', icon: KanbanSquare },
      { href: '/mails/v1/categories', label: 'Categories', icon: Tags },
      { href: '/mails/v1/tasks-deadlines', label: 'Tasks', icon: CheckSquare },
      { href: '/mails/v1/assets', label: 'Assets', icon: Paperclip },
      { href: '/mails/v1/ai-settings', label: 'AI Settings', icon: Zap },
    ],
  },
];

export function MailSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {/* Compose button */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <Link
            href="/mails/v1/ai-chat"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-mail-accent hover:bg-mail-accent-hover text-white text-[13px] font-semibold no-underline transition-colors duration-150"
          >
            <PenSquare size={15} />
            <span>Compose</span>
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mb-3">
          <Link
            href="/mails/v1/ai-chat"
            title="Compose"
            className="w-9 h-9 rounded-xl bg-mail-accent hover:bg-mail-accent-hover flex items-center justify-center no-underline transition-colors duration-150"
          >
            <PenSquare size={16} className="text-white" />
          </Link>
        </div>
      )}

      {/* Nav sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-3">
          {!collapsed && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-mail-subtle px-3 mb-1">
              {section.title}
            </div>
          )}
          <div className="flex flex-col gap-px">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium
                    no-underline transition-colors duration-100
                    ${collapsed ? 'justify-center mx-1 py-2.5' : 'mx-2 px-3 py-[7px]'}
                    ${active
                      ? 'bg-mail-accent-soft text-mail-accent'
                      : 'text-mail-muted hover:bg-mail-hover hover:text-mail-text'
                    }
                  `}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.7} className="shrink-0" />
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
    </>
  );
}
