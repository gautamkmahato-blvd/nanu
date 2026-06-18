'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Rail, getActiveModule, type ModuleId } from './rail';
import { MailSidebar } from './mail-sidebar';
import { CalendarSidebar } from './calendar-sidebar';
import { ContactsSidebar } from './contacts-sidebar';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

// Default routes for each module (clicking rail icon navigates here)
const MODULE_DEFAULTS: Record<ModuleId, string> = {
  mail: '/mails/v1/dashboard',
  calendar: '/mails/v1/calendar',
  contacts: '/mails/v1/contacts',
  settings: '/mails/v1/dashboard',
};

// Module labels shown at top of the sidebar panel
const MODULE_LABELS: Record<ModuleId, string> = {
  mail: 'Mail',
  calendar: 'Calendar',
  contacts: 'Contacts',
  settings: 'Settings',
};

export function SidebarLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const activeModule = getActiveModule(pathname);

  const handleModuleChange = (id: ModuleId) => {
    if (id !== activeModule) {
      router.push(MODULE_DEFAULTS[id]);
    }
  };

  return (
    <div className="flex h-screen shrink-0">
      {/* Rail — always visible */}
      <Rail activeModule={activeModule} onModuleChange={handleModuleChange} />

      {/* Module sidebar panel */}
      <div
        className={`
          flex flex-col h-screen bg-mail-sidebar border-r border-mail-border
          transition-all duration-200 ease-in-out overflow-hidden
          ${collapsed ? 'w-[52px]' : 'w-[200px]'}
        `}
      >
        {/* Module header */}
        <div className={`flex items-center shrink-0 h-14 border-b border-mail-border ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!collapsed && (
            <span className="text-[13px] font-semibold text-mail-text tracking-tight">
              {MODULE_LABELS[activeModule]}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-transparent text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors duration-100 cursor-pointer border-none"
          >
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {/* Module nav content */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-3">
          {activeModule === 'mail' && <MailSidebar collapsed={collapsed} />}
          {activeModule === 'calendar' && <CalendarSidebar collapsed={collapsed} />}
          {/* {activeModule === 'contacts' && <ContactsSidebar collapsed={collapsed} />} */}
          {activeModule === 'settings' && (
            <div className={`text-[12px] text-mail-subtle ${collapsed ? 'text-center' : 'px-4'}`}>
              {!collapsed && 'Coming soon'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
