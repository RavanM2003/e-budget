import { useEffect, useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';

const defaultForm = { id: null, name: '', type: '', color: '#5c7cfa' };

const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { categories, transactions, saveCategory, deleteCategory, loading: dataLoading, error: dataError, types } = useData();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!form.id && !form.type && types.length) {
      setForm((prev) => ({ ...prev, type: types[0].slug }));
    }
  }, [types, form.id, form.type]);

  const grouped = useMemo(() => {
    const bucket = types.reduce((acc, type) => {
      acc[type.slug] = [];
      return acc;
    }, {});
    categories.forEach((category) => {
      const key = category.type || types[0]?.slug || 'expense';
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(category);
    });
    return bucket;
  }, [categories, types]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.type) return;
    try {
      await saveCategory({ ...form, name: form.name.trim() });
      setForm((prev) => ({ ...defaultForm, type: prev.type }));
    } catch (err) {
      window.alert(err.message || 'Unable to save category');
    }
  };

  const handleEdit = (category) => setForm({ ...category, type: category.type });

  const handleDelete = async (category) => {
    const totals = categoryTotals[category.name] || { income: 0, expense: 0 };
    const inUse = (totals.income || 0) + (totals.expense || 0) > 0;
    if (inUse) {
      window.alert(t('categories.deleteBlocked'));
      return;
    }
    if (!window.confirm(t('categories.deleteConfirm'))) {
      return;
    }
    try {
      await deleteCategory(category.id);
      if (form.id === category.id) {
        setForm({ ...defaultForm, type: types[0]?.slug || '' });
      }
    } catch (err) {
      window.alert(err.message || 'Unable to delete category');
    }
  };

  const CategoryGrid = ({ items, label }) =>
    items.length ? (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const totals = categoryTotals[item.name] || { income: 0, expense: 0 };
          const net = totals.income - totals.expense;
          const netClass = net >= 0 ? 'text-emerald-500' : 'text-rose-500';
          const inUse = (totals.income || 0) + (totals.expense || 0) > 0;
          return (
            <div key={item.id} className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{item.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label || t('transactions.type')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {inUse && <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{t('categories.inUse')}</span>}
                </div>
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
                <button
                  onClick={() => handleDelete(item)}
                  disabled={inUse}
                  title={inUse ? t('categories.deleteBlocked') : undefined}
                  className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
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

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <Card title={t('categories.add')}>
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{dataError}</div>}
      <Card title={form.id ? t('actions.update') : t('categories.add')}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('forms.name')}</span>
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('transactions.type')}</span>
            {types.length ? (
              <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
                {types.map((type) => (
                  <option key={type.id} value={type.slug}>
                    {type.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">{t('categories.emptyDescription')}</div>
            )}
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
              <button type="button" onClick={() => setForm({ ...defaultForm, type: types[0]?.slug || '' })} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {t('actions.cancel')}
              </button>
            )}
          </div>
        </form>
      </Card>

      {types.length ? (
        types.map((type) => (
          <Card key={type.id} title={type.name}>
            <CategoryGrid items={grouped[type.slug] || []} label={type.name} />
          </Card>
        ))
      ) : (
        <Card>
          <EmptyState title={t('common.empty')} description={t('categories.emptyDescription')} />
        </Card>
      )}
    </div>
  );
};

export default CategoriesPage;
