// app/mails/v1/_components/sidebar/settings-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CalendarDays,
  Zap,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: 'Settings',
    items: [
      { href: '/mails/v1/profile', label: 'Profile', icon: User },
      { href: '/mails/v1/booking-settings', label: 'Booking Page', icon: CalendarDays },
      { href: '/mails/v1/ai-settings', label: 'AI Settings', icon: Zap },
    ],
  },
];

export function SettingsSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <>
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
                      : 'text-mail-text hover:bg-mail-hover hover:text-mail-text'
                    }
                  `}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.7} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}