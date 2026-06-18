'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ElementType };

const ITEMS: NavItem[] = [
  { href: '/mails/v1/contacts', label: 'All Contacts', icon: Users },
];

export function ContactsSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {ITEMS.map((item) => {
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
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}

      {!collapsed && (
        <div className="mx-3 mt-4 p-3 rounded-lg bg-mail-hover/50 border border-mail-border">
          <div className="flex items-center gap-2 text-mail-subtle text-[11px] mb-1">
            <UserPlus size={13} />
            <span>Contact Intelligence</span>
          </div>
          <p className="text-[11px] text-mail-muted leading-relaxed m-0">
            Contacts are auto-enriched from your email interactions with AI relationship scores.
          </p>
        </div>
      )}
    </>
  );
}
