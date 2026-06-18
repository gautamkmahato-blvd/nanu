'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Target,
  Clock,
  Plus,
  Users,
  Star,
} from 'lucide-react';


type NavItem = { href: string; label: string; icon: React.ElementType; badge?: string };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: 'Views',
    items: [
      { href: '/mails/v1/calendar', label: 'Calendar', icon: Calendar },
      { href: '/mails/v1/meeting-prep', label: 'Meeting Prep', icon: Target, badge: 'AI' },
      { href: '/mails/v1/priority-contacts', label: 'Priority Contacts', icon: Star }
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/mails/v1/contacts', label: 'Contacts', icon: Users },
    ],
  },
];

export function CalendarSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {/* Quick create */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <Link
            href="/mails/v1/calendar"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-mail-accent hover:bg-mail-accent-hover text-white text-[13px] font-semibold no-underline transition-colors duration-150"
          >
            <Plus size={15} />
            <span>New Event</span>
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mb-3">
          <Link
            href="/mails/v1/calendar"
            title="New Event"
            className="w-9 h-9 rounded-xl bg-mail-accent hover:bg-mail-accent-hover flex items-center justify-center no-underline transition-colors duration-150"
          >
            <Plus size={16} className="text-white" />
          </Link>
        </div>
      )}

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
                        <span className="ml-auto text-[9px] font-semibold px-1.5 py-px rounded-full shrink-0 bg-mail-accent-soft text-mail-accent border border-mail-accent/20">
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

      {/* Mini calendar hint */}
      {!collapsed && (
        <div className="mx-3 mt-2 p-3 rounded-lg bg-mail-hover/50 border border-mail-border">
          <div className="flex items-center gap-2 text-mail-subtle text-[11px] mb-1">
            <Clock size={13} />
            <span>Quick Availability</span>
          </div>
          <p className="text-[11px] text-mail-muted leading-relaxed m-0">
            Use AI Chat to check your schedule and book meetings by chatting.
          </p>
        </div>
      )}
    </>
  );
}
