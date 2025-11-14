import clsx from 'clsx';

const styles = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
  brand: 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-200'
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', styles[variant], className)}>
    {children}
  </span>
);

export default Badge;
