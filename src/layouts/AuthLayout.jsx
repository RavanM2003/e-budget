import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useTranslation } from 'react-i18next';

const AuthLayout = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white lg:flex-row">
      <div className="relative flex flex-1 flex-col justify-between p-10">
        <img src={logo} alt="eBudget" className="h-14 w-14 rounded-3xl bg-white/10 p-3" />
        <div className="max-w-xl space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{t('app.name')}</p>
          <h1 className="text-4xl font-bold">{t('app.tagline')}</h1>
          <p className="text-lg text-slate-300">
            Track spending, automate savings, and stay on top of your financial goals with a modern, data-rich dashboard designed for everyday budgeting.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {['Real-time trends', 'Multi-currency', 'Goal tracking', 'Smart nudges'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} eBudget</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 text-slate-900 dark:text-slate-900">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
