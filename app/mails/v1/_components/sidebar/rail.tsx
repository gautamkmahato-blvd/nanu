'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../theme-provider';
import {
  Mail,
  Calendar,
  Users,
  Sun,
  Moon,
  Zap,
  Settings,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

export type ModuleId = 'mail' | 'calendar' | 'contacts' | 'settings';

type RailItem = {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  matchPrefixes: string[];
};

const RAIL_ITEMS: RailItem[] = [
  {
    id: 'mail',
    label: 'Mail',
    icon: Mail,
    matchPrefixes: [
      '/mails/v1/dashboard',
      '/mails/v1/ai-inbox',
      '/mails/v1/ai-chat',
      '/mails/v1/inbox',
      '/mails/v1/important',
      '/mails/v1/sent',
      '/mails/v1/trash',
      '/mails/v1/board',
      '/mails/v1/categories',
      '/mails/v1/tasks-deadlines',
      '/mails/v1/ai-email-details',
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    matchPrefixes: ['/mails/v1/calendar', '/mails/v1/meeting-prep', '/mails/v1/contacts', '/mails/v1/priority-contacts', '/mails/v1/bookings',],
  },
  // {
  //   id: 'contacts',
  //   label: 'Contacts',
  //   icon: Users,
  //   matchPrefixes: ['/mails/v1/contacts'],
  // },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    matchPrefixes: ['/mails/v1/profile', '/mails/v1/booking-settings', '/mails/v1/ai-settings'],
  },
  
];

// ---------------------------------------------------------------------------
// Detect active module from URL
// ---------------------------------------------------------------------------

export function getActiveModule(pathname: string): ModuleId {
  for (const item of RAIL_ITEMS) {
    if (item.matchPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return item.id;
    }
  }
  return 'mail'; // default
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type RailProps = {
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
};

export function Rail({ activeModule, onModuleChange }: RailProps) {
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-[56px] h-screen shrink-0 bg-mail-rail border-r border-mail-border py-3">
      {/* Logo */}
      <button onClick={() => router.push('/home')}>
        <span className="w-9 h-9 rounded-xl bg-mail-accent flex items-center justify-center mb-5 shrink-0 cursor-pointer" title="Context Mode">
          <Zap size={18} className="text-white" />
        </span>
      </button>

      {/* Module icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {RAIL_ITEMS.map((item) => {
          const active = activeModule === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              title={item.label}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-150 cursor-pointer border-none
                ${active
                  ? 'bg-mail-accent-soft text-mail-accent'
                  : 'bg-transparent text-mail-text hover:text-mail-muted hover:bg-mail-hover'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-mail-accent -ml-[7px]" />
              )}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-150 cursor-pointer border-none"
      >
        {theme === 'dark' ? <Sun size={18} strokeWidth={1.7} /> : <Moon size={18} strokeWidth={1.7} />}
      </button>
    </div>
  );
}
