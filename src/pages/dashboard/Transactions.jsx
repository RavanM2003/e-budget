import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionsTable from '../../components/transactions/TransactionsTable';
import TransactionModal from '../../components/transactions/TransactionModal';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveTypeLabel } from '../../utils/types';
import { formatDate } from '../../utils/date';

const pageSize = 10;

const aggregateCategory = (list) => {
  return list.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
};

const TransactionsPage = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { transactions, saveTransaction, deleteTransaction, goals, saveGoal, categories, loading: dataLoading, error: dataError, types } = useData();
  const [filters, setFilters] = useState({ query: '', type: 'all', startDate: '', endDate: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [categoryInsight, setCategoryInsight] = useState({ category: 'all', startDate: '', endDate: '' });
  const [goalAdjust, setGoalAdjust] = useState({ id: '', amount: '' });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: settings.currency || 'AZN'
      }),
    [i18n.language, settings.currency]
  );

  const typeLookup = useMemo(
    () =>
      types.reduce((acc, type) => {
        acc[type.slug] = resolveTypeLabel(type, t) || type.name;
        return acc;
      }, {}),
    [types, t]
  );

  const categoryColors = useMemo(
    () =>
      categories.reduce((acc, category) => {
        if (category.name) {
          acc[category.name] = category.color || '#94a3b8';
        }
        return acc;
      }, {}),
    [categories]
  );

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesQuery = tx.title.toLowerCase().includes(filters.query.toLowerCase());
      const matchesType = filters.type === 'all' || tx.typeKey === filters.type;
      const date = new Date(tx.date);
      const afterStart = !filters.startDate || date >= new Date(filters.startDate);
      const beforeEnd = !filters.endDate || date <= new Date(filters.endDate);
      return matchesQuery && matchesType && afterStart && beforeEnd;
    });
  }, [transactions, filters]);

  const sortedTransactions = useMemo(() => {
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valueA = a[key];
      let valueB = b[key];
      if (key === 'amount') {
        valueA = Number(valueA) || 0;
        valueB = Number(valueB) || 0;
      }
      if (key === 'date') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  const paginated = useMemo(() => sortedTransactions.slice((page - 1) * pageSize, page * pageSize), [sortedTransactions, page]);
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  useEffect(() => {
    if (filters.type !== 'all' && !types.some((type) => type.slug === filters.type)) {
      setFilters((prev) => ({ ...prev, type: 'all' }));
    }
  }, [types, filters.type]);

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
    setPage(1);
  };

  const handleSave = async (payload) => {
    const base = selected ? { id: selected.id } : {};
    try {
      await saveTransaction({ ...base, ...payload, amount: Number(payload.amount) });
      setSelected(null);
      setModalOpen(false);
    } catch (err) {
      window.alert(err.message || 'Unable to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('transactions.deleteConfirm'))) {
      return;
    }
    try {
      await deleteTransaction(id);
    } catch (err) {
      window.alert(err.message || 'Unable to delete transaction');
    }
  };

  const categoryInsightResult = useMemo(() => {
    if (!categoryInsight.category || categoryInsight.category === 'all') return null;
    const subset = transactions.filter((tx) => {
      if (tx.category !== categoryInsight.category) return false;
      const date = new Date(tx.date);
      if (categoryInsight.startDate && date < new Date(categoryInsight.startDate)) return false;
      if (categoryInsight.endDate && date > new Date(categoryInsight.endDate)) return false;
      return true;
    });
    return aggregateCategory(subset);
  }, [transactions, categoryInsight]);

  const handleGoalAdjust = async (event) => {
    event.preventDefault();
    const goal = goals.find((item) => item.id === goalAdjust.id);
    if (!goal || !goalAdjust.amount) return;
    const amount = Number(goalAdjust.amount);
    if (Number.isNaN(amount)) return;
    try {
      await saveGoal({ ...goal, saved: Math.max(0, Number(goal.saved) + amount) });
      setGoalAdjust((prev) => ({ ...prev, amount: '' }));
    } catch (err) {
      window.alert(err.message || 'Unable to update goal');
    }
  };

  const categoryOptions = useMemo(() => Array.from(new Set(transactions.map((tx) => tx.category).filter(Boolean))), [transactions]);

  const showingFrom = sortedTransactions.length ? (page - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(sortedTransactions.length, page * pageSize);

  const renderMobileTransaction = (item) => (
    <div key={item.id} className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</p>
          <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
        </div>
        <div className="text-right">
          <p className={`text-base font-semibold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {item.type === 'income' ? '+' : '-'}
            {currencyFormatter.format(Number(item.amount) || 0)}
          </p>
          <p className="text-xs text-slate-400">{typeLookup[item.typeKey] || t(`transactions.filters.${item.type}`, { defaultValue: item.type })}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[item.category] || '#94a3b8' }} />
          {item.category || t('transactions.filters.all')}
        </span>
        {item.status && <span>{t(`common.status.${item.status}`, { defaultValue: item.status })}</span>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => { setSelected(item); setModalOpen(true); }} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200">
          {t('actions.edit')}
        </button>
        <button onClick={() => handleDelete(item.id)} className="flex-1 rounded-2xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:text-rose-300">
          {t('actions.delete')}
        </button>
      </div>
    </div>
  );

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <Card title={t('transactions.title')}>
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{dataError}</div>}
      <Card
        title={t('transactions.title')}
        action={
          <button onClick={() => setModalOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 sm:w-auto">
            <Plus size={16} />
            {t('transactions.add')}
          </button>
        }
      >
        <TransactionFilters filters={filters} onChange={handleFilterChange} types={types} />
        <div className="mt-6 space-y-4">
          {sortedTransactions.length ? (
            <>
              <div className="space-y-3 md:hidden">
                {paginated.map((item) => renderMobileTransaction(item))}
              </div>
              <div className="hidden md:block">
                <TransactionsTable
                  data={paginated}
                  onEdit={(item) => {
                    setSelected(item);
                    setModalOpen(true);
                  }}
                  onDelete={handleDelete}
                  formatCurrency={(value) => currencyFormatter.format(value)}
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  categoryColors={categoryColors}
                  typeLookup={typeLookup}
                />
              </div>
              <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p>
                  {t('transactions.showing', {
                    from: showingFrom,
                    to: showingTo,
                    total: sortedTransactions.length
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="flex-1 rounded-2xl border border-slate-200 px-3 py-1 text-center text-sm font-medium disabled:opacity-50 dark:border-slate-700 sm:flex-initial">
                    {t('common.prev')}
                  </button>
                  <span className="text-center sm:inline">
                    {page}/{totalPages}
                  </span>
                  <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="flex-1 rounded-2xl border border-slate-200 px-3 py-1 text-center text-sm font-medium disabled:opacity-50 dark:border-slate-700 sm:flex-initial">
                    {t('common.next')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title={t('transactions.empty')}
              description={t('transactions.emptyDescription')}
              action={
                <button onClick={() => setModalOpen(true)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  {t('transactions.add')}
                </button>
              }
            />
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('categories.title')} subtitle={t('transactions.category')}>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
            <label className="space-y-1 text-xs uppercase text-slate-400">
              {t('transactions.category')}
              <select className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" value={categoryInsight.category} onChange={(event) => setCategoryInsight((prev) => ({ ...prev, category: event.target.value }))}>
                <option value="all">{t('transactions.filters.all')}</option>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase text-slate-400">
              {t('reports.filters.from')}
              <input type="date" className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" value={categoryInsight.startDate} onChange={(event) => setCategoryInsight((prev) => ({ ...prev, startDate: event.target.value }))} />
            </label>
            <label className="space-y-1 text-xs uppercase text-slate-400">
              {t('reports.filters.to')}
              <input type="date" className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" value={categoryInsight.endDate} onChange={(event) => setCategoryInsight((prev) => ({ ...prev, endDate: event.target.value }))} />
            </label>
          </form>
          {categoryInsight.category !== 'all' && categoryInsightResult ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span>{t('dashboard.income')}</span>
                  <strong>{currencyFormatter.format(categoryInsightResult.income)}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{t('dashboard.expenses')}</span>
                  <strong>{currencyFormatter.format(categoryInsightResult.expense)}</strong>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/60">
                {t('transactions.category')}: <strong>{categoryInsight.category}</strong>
                </div>
              </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t('categories.emptyDescription')}</p>
          )}
        </Card>

        <Card title={t('transactions.title')} subtitle={t('dashboard.quickActions')}>
          <div className="space-y-4">
            <form className="grid gap-3" onSubmit={handleGoalAdjust}>
              <p className="text-xs uppercase text-slate-400">{t('goals.title')}</p>
              <select className="rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" value={goalAdjust.id} onChange={(event) => setGoalAdjust((prev) => ({ ...prev, id: event.target.value }))}>
                <option value="">{t('transactions.filters.all')}</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input type="number" className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" placeholder="0.00" value={goalAdjust.amount} onChange={(event) => setGoalAdjust((prev) => ({ ...prev, amount: event.target.value }))} />
                <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  {t('actions.addSavings')}
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        initial={selected}
        onSave={handleSave}
      />
    </div>
  );
};

export default TransactionsPage;
