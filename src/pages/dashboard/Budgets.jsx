import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import BudgetCard from '../../components/dashboard/BudgetCard';
import EmptyState from '../../components/common/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';

const defaultForm = { id: null, title: '', limit: '', spent: '' };

const BudgetsPage = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { budgets, saveBudget, deleteBudget } = useData();
  const [form, setForm] = useState(defaultForm);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: settings.currency || 'AZN'
      }),
    [i18n.language, settings.currency]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    saveBudget({ ...form, title: form.title.trim(), limit: Number(form.limit) || 0, spent: Number(form.spent) || 0 });
    setForm(defaultForm);
  };

  const handleEdit = (budget) => setForm({ ...budget });

  const handleDelete = (id) => {
    if (window.confirm(t('budgets.deleteConfirm'))) {
      deleteBudget(id);
      if (form.id === id) {
        setForm(defaultForm);
      }
    }
  };

  const handleAddExpense = (budget) => {
    const input = window.prompt(t('actions.addExpense'));
    if (!input) return;
    const amount = Number(input);
    if (Number.isNaN(amount) || amount <= 0) return;
    saveBudget({ ...budget, spent: (Number(budget.spent) || 0) + amount });
  };

  return (
    <div className="space-y-6">
      <Card title={form.id ? t('actions.update') : t('budgets.add')}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('forms.name')}</span>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('budgets.limit')}</span>
            <input type="number" value={form.limit} onChange={(event) => setForm((prev) => ({ ...prev, limit: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('budgets.spent')}</span>
            <input type="number" value={form.spent} onChange={(event) => setForm((prev) => ({ ...prev, spent: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" required />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-3">
            <button type="submit" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">{form.id ? t('actions.update') : t('forms.save')}</button>
            {form.id && (
              <button type="button" onClick={() => setForm(defaultForm)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {t('actions.cancel')}
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title={t('budgets.title')} subtitle={t('budgets.monthly')}>
        {budgets.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => (
              <div key={budget.id} className="space-y-3 rounded-3xl border border-slate-100 p-4 dark:border-slate-800">
                <BudgetCard {...budget} formatAmount={(value) => currencyFormatter.format(value)} />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleEdit(budget)} className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200">
                    {t('actions.edit')}
                  </button>
                  <button onClick={() => handleAddExpense(budget)} className="rounded-xl border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-200 dark:hover:bg-amber-500/10">
                    {t('actions.addExpense')}
                  </button>
                  <button onClick={() => handleDelete(budget.id)} className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10">
                    {t('actions.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={t('common.empty')} description={t('budgets.empty')} />
        )}
      </Card>
    </div>
  );
};

export default BudgetsPage;
