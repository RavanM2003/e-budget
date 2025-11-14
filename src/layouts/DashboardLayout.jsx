import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-6 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        </div>

        <div className="flex min-h-screen flex-col gap-6">
          <Topbar onMobileSidebar={() => setMobileOpen(true)} />
          <main className="fade-layout mb-12 flex-1 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-4 top-4 w-[80%] max-w-xs" onClick={(event) => event.stopPropagation()}>
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
