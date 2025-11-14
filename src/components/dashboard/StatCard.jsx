import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({ title, value, delta, trend = 'up', icon: Icon, subtitle }) => (
  <div className="glass-card h-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-500">
          <Icon size={20} />
        </div>
      )}
    </div>
    {delta && (
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
        <span className={clsx(trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{delta}</span>
        <span className="text-slate-400">vs last month</span>
      </div>
    )}
  </div>
);

export default StatCard;
