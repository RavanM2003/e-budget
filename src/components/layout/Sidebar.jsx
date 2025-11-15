import { LayoutDashboard, Shuffle, FolderKanban, Target, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, to: '/dashboard', labelKey: 'navigation.dashboard' },
  { id: 'transactions', icon: Shuffle, to: '/transactions', labelKey: 'navigation.transactions' },
  { id: 'categories', icon: FolderKanban, to: '/categories', labelKey: 'navigation.categories' },
  { id: 'goals', icon: Target, to: '/goals', labelKey: 'navigation.goals' },
  { id: 'reports', icon: BarChart3, to: '/reports', labelKey: 'navigation.reports' }
];

const Sidebar = ({ collapsed, onToggle, onNavigate, hideToggle = false }) => {
  const { t } = useTranslation();
  return (
    <aside
      className={clsx(
        'glass-panel sticky top-4 flex h-[calc(100vh-2rem)] shrink-0 flex-col border border-white/40 transition-[width] duration-300 dark:border-slate-800/80',
        collapsed ? 'w-24 px-4' : 'w-72 px-6'
      )}
    >
      <div className="flex items-center justify-between gap-3 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500/10 px-4 py-3 text-sm font-semibold text-brand-600">EB</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">eBudget</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
            </div>
          )}
        </div>
        {!hideToggle && (
          <button onClick={onToggle} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow dark:border-slate-800 dark:bg-slate-900" aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      <nav className="mt-2 flex-1 space-y-2 overflow-y-auto pb-6">
        {navItems.map(({ id, icon: Icon, to, labelKey }) => (
          <NavLink
            key={id}
            to={to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-white dark:hover:bg-slate-800/60',
                isActive ? 'nav-link-active' : 'text-slate-500 dark:text-slate-400'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{t(labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
