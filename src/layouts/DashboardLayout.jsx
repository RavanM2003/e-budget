import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-6 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-10">
      <div className="flex gap-4 lg:gap-6">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        </div>
        <div className="flex min-h-screen flex-1 flex-col gap-6">
          <Topbar onMobileSidebar={() => setMobileOpen(true)} />
          <main className="fade-layout mb-12 flex-1 space-y-6 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs" onClick={(event) => event.stopPropagation()}>
            <Sidebar collapsed={false} onToggle={() => {}} onNavigate={() => setMobileOpen(false)} hideToggle />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
