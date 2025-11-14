import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const BudgetCard = ({ title, limit = 0, spent = 0, formatAmount }) => {
  const { t } = useTranslation();
  const safeLimit = Number(limit) || 0;
  const safeSpent = Number(spent) || 0;
  const percentage = safeLimit === 0 ? 0 : Math.min(100, Math.round((safeSpent / safeLimit) * 100));
  const format = typeof formatAmount === 'function' ? formatAmount : (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{format(safeLimit)}</p>
        <p className="text-sm text-slate-500">{percentage}% used</p>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={clsx('h-full rounded-full bg-brand-500')} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {t('budgets.spent')}: {format(safeSpent)}
      </p>
    </div>
  );
};

export default BudgetCard;
