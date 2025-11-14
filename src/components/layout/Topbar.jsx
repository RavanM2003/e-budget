import { useState } from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import SearchPalette from '../common/SearchPalette';

const Topbar = ({ onMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'EB';

  return (
    <>
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between rounded-3xl border border-white/60 bg-white/80 px-6 shadow-soft backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="flex flex-1 items-center gap-3">
        <button className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 lg:hidden" onClick={onMobileSidebar}>
          <Menu size={18} />
        </button>
        <button onClick={() => setSearchOpen(true)} className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:inline-flex">
          {t('forms.search')}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button onClick={() => setProfileOpen((prev) => !prev)} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1 pr-4 shadow-sm transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-sm font-semibold text-brand-700 dark:text-brand-100">
              {initials}
            </span>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{t('app.name')}</p>
            </div>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <p className="px-3 py-2 text-xs uppercase text-slate-400">{user?.email}</p>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
                <LogOut size={16} />
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Topbar;
