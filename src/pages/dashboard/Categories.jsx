import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';

const defaultForm = { id: null, name: '', type: 'income', color: '#5c7cfa' };

const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { categories, transactions, saveCategory, deleteCategory } = useData();
  const [form, setForm] = useState(defaultForm);

  const grouped = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        acc[category.type === 'income' ? 'income' : 'expense'].push(category);
        return acc;
      },
      { income: [], expense: [] }
    );
  }, [categories]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: settings.currency || 'AZN'
      }),
    [i18n.language, settings.currency]
  );

  const categoryTotals = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (!tx.category) return acc;
      if (!acc[tx.category]) {
        acc[tx.category] = { income: 0, expense: 0 };
      }
      const bucket = tx.type === 'income' ? 'income' : 'expense';
      acc[tx.category][bucket] += Number(tx.amount) || 0;
      return acc;
    }, {});
  }, [transactions]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    saveCategory({ ...form, name: form.name.trim() });
    setForm(defaultForm);
  };

  const handleEdit = (category) => setForm({ ...category });

  const handleDelete = (id) => {
    if (window.confirm(t('categories.deleteConfirm'))) {
      deleteCategory(id);
      if (form.id === id) {
        setForm(defaultForm);
      }
    }
  };

  const CategoryGrid = ({ items }) =>
    items.length ? (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const totals = categoryTotals[item.name] || { income: 0, expense: 0 };
          const net = totals.income - totals.expense;
          const netClass = net >= 0 ? 'text-emerald-500' : 'text-rose-500';
          return (
            <div key={item.id} className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{item.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{t(`transactions.filters.${item.type || 'expense'}`)}</p>
                </div>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['income', 'expense'].map((kind) => (
                  <div key={kind} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t(`dashboard.${kind === 'income' ? 'income' : 'expenses'}`)}</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(totals[kind] || 0)}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('dashboard.monthlyNet')}</p>
                  <p className={`text-lg font-semibold ${netClass}`}>
                    {net === 0 ? currencyFormatter.format(0) : `${net >= 0 ? '+' : '-'}${currencyFormatter.format(Math.abs(net))}`}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(item)} className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200">
                  {t('actions.edit')}
                </button>
                <button onClick={() => handleDelete(item.id)} className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10">
                  {t('actions.delete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <EmptyState title={t('categories.empty')} description={t('categories.emptyDescription')} />
    );

  return (
    <div className="space-y-6">
      <Card title={form.id ? t('actions.update') : t('categories.add')}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('forms.name')}</span>
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('transactions.type')}</span>
            <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              <option value="income">{t('transactions.filters.income')}</option>
              <option value="expense">{t('transactions.filters.expense')}</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('forms.color')}</span>
            <input type="color" value={form.color} onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))} className="h-12 w-full cursor-pointer rounded-2xl border border-slate-200" />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
              <PlusCircle size={16} />
              {form.id ? t('actions.update') : t('categories.add')}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(defaultForm)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {t('actions.cancel')}
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title={t('categories.income')}>
        <CategoryGrid items={grouped.income} />
      </Card>
      <Card title={t('categories.expense')}>
        <CategoryGrid items={grouped.expense} />
      </Card>
    </div>
  );
};

export default CategoriesPage;
