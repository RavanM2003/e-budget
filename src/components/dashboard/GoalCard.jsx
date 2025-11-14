import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/date';

const GoalCard = ({ title, target = 0, saved = 0, due }) => {
  const { t } = useTranslation();
  const progress = target === 0 ? 0 : Math.min(100, Math.round((saved / target) * 100));
  const formattedDue = due ? formatDate(due) : '—';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-xs text-slate-400">
            {t('goals.due')}: {formattedDue}
          </p>
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{progress}%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {t('goals.saved')}: {saved.toLocaleString()}
        </span>
        <span>
          {t('goals.target')}: {target.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default GoalCard;
