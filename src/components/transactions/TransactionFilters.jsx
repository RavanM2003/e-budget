import { useTranslation } from 'react-i18next';

const TransactionFilters = ({ filters, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 md:grid-cols-4">
      <input
        type="text"
        placeholder={t('forms.search')}
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700"
        value={filters.query}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />
      <select
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
        value={filters.type}
        onChange={(event) => onChange({ ...filters, type: event.target.value })}
      >
        <option value="all">{t('transactions.filters.all')}</option>
        <option value="income">{t('transactions.filters.income')}</option>
        <option value="expense">{t('transactions.filters.expense')}</option>
      </select>
      <input
        type="date"
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
        value={filters.startDate}
        onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
      />
      <input
        type="date"
        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
        value={filters.endDate}
        onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
      />
    </div>
  );
};

export default TransactionFilters;
