
import { SidebarLayout } from './_components/sidebar/sidebar-layout';
import { ThemeProvider } from './_components/theme-provider';
import { Topbar } from './_components/topbar';

export default function MailsV1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-mail-bg overflow-hidden">
        {/* Sidebar: Rail + Module panel */}
        <SidebarLayout />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
