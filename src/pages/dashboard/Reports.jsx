import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatDate } from '../../utils/date';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';

const groupingOptions = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
const chartTypes = ['area', 'line', 'bar'];
const metricOptions = ['income', 'expense', 'net'];
const DEFAULT_CATEGORY_COLOR = '#94a3b8';

const getWeekNumber = (date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - firstDay) / 86400000) + firstDay.getDay();
  return Math.ceil((pastDays + 1) / 7);
};

const buildGroupingKey = (date, grouping, locale, t) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  switch (grouping) {
    case 'daily':
      return {
        key: `${year}-${month}-${day}`,
        label: new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date),
        sortIndex: year * 10000 + (month + 1) * 100 + day
      };
    case 'weekly': {
      const week = getWeekNumber(date);
      return {
        key: `${year}-W${week}`,
        label: `${week}. ${t('reports.views.weekly')}`,
        sortIndex: year * 100 + week
      };
    }
    case 'quarterly': {
      const quarter = Math.floor(month / 3) + 1;
      return {
        key: `${year}-Q${quarter}`,
        label: `${quarter}. ${t('reports.views.quarterly')} ${year}`,
        sortIndex: year * 10 + quarter
      };
    }
    case 'yearly':
      return { key: `${year}`, label: String(year), sortIndex: year };
    default:
      return {
        key: `${year}-${month}`,
        label: new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date),
        sortIndex: year * 100 + month
      };
  }
};

const ReportsPage = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { transactions, categories, types, loading: dataLoading, error: dataError } = useData();
  const incomeLabel = t('reports.metrics.income');
  const expenseLabel = t('reports.metrics.expense');
  const netLabel = t('reports.metrics.net');

  const typeNatureBySlug = useMemo(
    () =>
      types.reduce((acc, type) => {
        if (type.slug) {
          acc[type.slug] = type.nature || (type.slug.includes('income') ? 'income' : type.slug.includes('expense') ? 'expense' : null);
        }
        return acc;
      }, {}),
    [types]
  );

  const categoryMetaMap = useMemo(
    () =>
      categories.reduce((acc, category) => {
        if (category.name) {
          acc[category.name] = {
            color: category.color,
            type: typeNatureBySlug[category.type] || (category.type === 'income' ? 'income' : category.type === 'expense' ? 'expense' : null)
          };
        }
        return acc;
      }, {}),
    [categories, typeNatureBySlug]
  );

  const defaultStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
    type: 'all',
    category: 'all',
    grouping: 'monthly',
    metric: 'income',
    chartType: 'area'
  });

  const changeFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const availableCategories = categories.length
    ? categories.map((category) => category.name).filter(Boolean)
    : Array.from(new Set(transactions.map((tx) => tx.category).filter(Boolean)));

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return false;
      if (filters.startDate && date < new Date(filters.startDate)) return false;
      if (filters.endDate && date > new Date(filters.endDate)) return false;
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      return true;
    });
  }, [transactions, filters]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: settings.currency || 'AZN'
      }),
    [i18n.language, settings.currency]
  );

  const timeSeries = useMemo(() => {
    const map = new Map();
    filtered.forEach((tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return;
      const { key, label, sortIndex } = buildGroupingKey(date, filters.grouping, i18n.language, t);
      if (!map.has(key)) {
        map.set(key, { label, sortIndex, income: 0, expense: 0, net: 0 });
      }
      const bucket = map.get(key);
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') bucket.income += amount;
      else bucket.expense += amount;
      bucket.net = bucket.income - bucket.expense;
    });
    return Array.from(map.values()).sort((a, b) => a.sortIndex - b.sortIndex);
  }, [filtered, filters.grouping, i18n.language, t]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === 'income') acc.income += amount;
        else acc.expense += amount;
        acc.net = acc.income - acc.expense;
        acc.count += 1;
        return acc;
      },
      { income: 0, expense: 0, net: 0, count: 0 }
    );
  }, [filtered]);

  const summaryCards = [
    { key: 'income', title: t('reports.summary.incomeTotal'), value: totals.income },
    { key: 'expense', title: t('reports.summary.expenseTotal'), value: -Math.abs(totals.expense) },
    { key: 'net', title: t('reports.summary.netTotal'), value: totals.net }
  ];

  const categorySeries = useMemo(() => {
    const grouped = filtered.reduce((acc, tx) => {
      const key = tx.category || t('transactions.filters.all');
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') acc[key].income += amount;
      else acc[key].expense += amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => {
      const meta = categoryMetaMap[name];
      const type = meta?.type || (value.expense > value.income ? 'expense' : 'income');
      return {
        name,
        income: value.income,
        expense: value.expense,
        net: value.income - value.expense,
        color: meta?.color || DEFAULT_CATEGORY_COLOR,
        type,
        chartValue: type === 'income' ? value.income : -Math.abs(value.expense)
      };
    });
  }, [filtered, t, categoryMetaMap]);

  const distributionRows = useMemo(
    () =>
      categorySeries.map((entry) => ({
        ...entry,
        value: entry.net
      })),
    [categorySeries]
  );

  const netSeries = useMemo(() => {
    const grouped = filtered.reduce((acc, tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return acc;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!acc[key]) {
        acc[key] = {
          label: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
          net: 0,
          sortIndex: date.getFullYear() * 100 + date.getMonth()
        };
      }
      const amount = Number(tx.amount) || 0;
      acc[key].net += tx.type === 'income' ? amount : -amount;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.sortIndex - b.sortIndex);
  }, [filtered]);

  const statusSeries = useMemo(() => {
    const grouped = filtered.reduce((acc, tx) => {
      const status = tx.status || 'cleared';
      if (!acc[status]) acc[status] = { status, label: t(`common.status.${status}`, { defaultValue: status }), count: 0, amount: 0 };
      acc[status].count += 1;
      acc[status].amount += Number(tx.amount) || 0;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [filtered, t]);

  const topTransactions = useMemo(() => {
    return filtered
      .slice()
      .sort((a, b) => Math.abs(Number(b.amount) || 0) - Math.abs(Number(a.amount) || 0))
      .slice(0, 6);
  }, [filtered]);

  const yearlyTotals = useMemo(() => {
    const totalsByYear = filtered.reduce((acc, tx) => {
      const year = new Date(tx.date).getFullYear();
      if (!acc[year]) acc[year] = { year, income: 0, expense: 0 };
      acc[year][tx.type] += Number(tx.amount) || 0;
      return acc;
    }, {});
    return Object.values(totalsByYear).sort((a, b) => a.year - b.year);
  }, [filtered]);

  const insights = useMemo(() => {
    const expenses = filtered.filter((tx) => tx.type === 'expense').sort((a, b) => Number(b.amount) - Number(a.amount));
    const incomes = filtered.filter((tx) => tx.type === 'income').sort((a, b) => Number(b.amount) - Number(a.amount));
    const dayMap = filtered.reduce((acc, tx) => {
      const day = new Date(tx.date);
      if (Number.isNaN(day.getTime())) return acc;
      const key = day.toDateString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const busiestEntry = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
    const topCategory = categorySeries
      .slice()
      .sort((a, b) => b.expense - a.expense)
      .find((entry) => entry.expense > 0);
    return [
      {
        label: t('reports.insights.biggestExpense'),
        value: expenses.length ? `${currencyFormatter.format(Number(expenses[0].amount) || 0)} • ${expenses[0].title}` : '—'
      },
      {
        label: t('reports.insights.biggestIncome'),
        value: incomes.length ? `${currencyFormatter.format(Number(incomes[0].amount) || 0)} • ${incomes[0].title}` : '—'
      },
      {
        label: t('reports.insights.busiestDay'),
        value: busiestEntry ? `${formatDate(busiestEntry[0])} • ${busiestEntry[1]}` : '•'
      },
      {
        label: t('reports.insights.topCategory'),
        value: topCategory ? `${topCategory.name} • ${currencyFormatter.format(topCategory.expense)}` : '—'
      }
    ];
  }, [filtered, categorySeries, currencyFormatter, i18n.language, t]);

  const renderTimeSeriesChart = () => {
    if (!timeSeries.length) {
      return <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />;
    }
    const common = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
      </>
    );
    if (filters.chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeries}>
            {common}
            <Line dataKey="income" name={incomeLabel} stroke="#10b981" strokeWidth={2} dot={false} />
            <Line dataKey="expense" name={expenseLabel} stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line dataKey="net" name={netLabel} stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (filters.chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timeSeries}>
            {common}
            <Bar dataKey="income" name={incomeLabel} stackId="time" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" name={expenseLabel} stackId="time" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Bar dataKey="net" name={netLabel} fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeSeries}>
          {common}
          <Area dataKey="income" name={incomeLabel} stroke="#10b981" fill="#10b98166" strokeWidth={2} type="monotone" />
          <Area dataKey="expense" name={expenseLabel} stroke="#ef4444" fill="#ef444466" strokeWidth={2} type="monotone" />
          <Area dataKey="net" name={netLabel} stroke="#6366f1" fill="#6366f166" strokeWidth={2} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <Card title={t('reports.title')}>
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{dataError}</div>}
      <Card title={t('reports.filters.title')}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.from')}</span>
            <input type="date" value={filters.startDate} onChange={(event) => changeFilter('startDate', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.to')}</span>
            <input type="date" value={filters.endDate} onChange={(event) => changeFilter('endDate', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.type')}</span>
            <select value={filters.type} onChange={(event) => changeFilter('type', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              <option value="all">{t('transactions.filters.all')}</option>
              <option value="income">{t('transactions.filters.income')}</option>
              <option value="expense">{t('transactions.filters.expense')}</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.category')}</span>
            <select value={filters.category} onChange={(event) => changeFilter('category', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              <option value="all">{t('transactions.filters.all')}</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.view')}</span>
            <select value={filters.grouping} onChange={(event) => changeFilter('grouping', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {groupingOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`reports.views.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.metric')}</span>
            <select value={filters.metric} onChange={(event) => changeFilter('metric', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {metricOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`reports.metrics.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('reports.filters.chart')}</span>
            <select value={filters.chartType} onChange={(event) => changeFilter('chartType', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {chartTypes.map((option) => (
                <option key={option} value={option}>
                  {t(`reports.charts.${option}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.key} title={card.title}>
            <p className={`text-3xl font-semibold ${card.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {card.value >= 0 ? '+' : '-'}
              {currencyFormatter.format(Math.abs(card.value))}
            </p>
          </Card>
        ))}
      </div>

      <Card title={t('reports.cashflow')} subtitle={t('reports.subtitle')}>
        <div className="h-96">{renderTimeSeriesChart()}</div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('reports.allocation')} subtitle={t('reports.byCategory')}>
          {categorySeries.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => currencyFormatter.format(value)} />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      currencyFormatter.format(Math.abs(value)),
                      props?.payload?.type === 'income' ? t('dashboard.income') : t('dashboard.expenses')
                    ]}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="chartValue" radius={6}>
                    {categorySeries.map((entry) => (
                      <Cell key={entry.name} fill={entry.color || DEFAULT_CATEGORY_COLOR} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </Card>

        <Card title={t('reports.distribution')} subtitle={t('reports.metrics.net')}>
          {distributionRows.length ? (
            <>
              <div className="space-y-3 md:hidden">
                {distributionRows
                  .slice()
                  .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                  .map((row) => (
                    <div key={`mobile-${row.name}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-white">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color || DEFAULT_CATEGORY_COLOR }} />
                          {row.name}
                        </span>
                        <span className={`text-sm font-semibold ${row.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {row.value >= 0 ? '+' : '-'}
                          {currencyFormatter.format(Math.abs(row.value))}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-slate-400">
                        <th className="px-3 py-2">{t('transactions.category')}</th>
                        <th className="px-3 py-2 text-right">{t('reports.metrics.net')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributionRows
                        .slice()
                        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                        .map((row) => (
                          <tr key={row.name} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color || DEFAULT_CATEGORY_COLOR }} />
                                {row.name}
                              </span>
                            </td>
                            <td className={`px-3 py-2 text-right font-semibold ${row.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {row.value >= 0 ? '+' : '-'}
                              {currencyFormatter.format(Math.abs(row.value))}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </Card>

        <Card title={t('reports.statusSummary')}>
          {statusSeries.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusSeries}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </Card>

        <Card title={t('reports.netTrend')}>
          {netSeries.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={netSeries}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="net" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('reports.topTransactions')}>
          {topTransactions.length ? (
            <>
              <div className="space-y-3 md:hidden">
                {topTransactions.map((tx) => (
                  <div key={`report-mobile-${tx.id}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {currencyFormatter.format(Number(tx.amount) || 0)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{t(`transactions.filters.${tx.type}`)}</span>
                      {tx.category && <span>{tx.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[520px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-slate-400">
                        <th className="px-3 py-2">{t('transactions.title')}</th>
                        <th className="px-3 py-2">{t('transactions.type')}</th>
                        <th className="px-3 py-2 text-right">{t('transactions.amount')}</th>
                        <th className="px-3 py-2">{t('transactions.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTransactions.map((tx) => (
                        <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-white">{tx.title}</td>
                          <td className="px-3 py-2 capitalize text-slate-500">{t(`transactions.filters.${tx.type}`)}</td>
                          <td className={`px-3 py-2 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.type === 'income' ? '+' : '-'}
                            {currencyFormatter.format(Number(tx.amount) || 0)}
                          </td>
                          <td className="px-3 py-2 text-slate-500">{formatDate(tx.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </Card>

        <Card title={t('reports.insightsTitle')}>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {insights.map((item) => (
              <li key={item.label} className="flex flex-col rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="text-xs uppercase text-slate-400">{item.label}</span>
                <span className="text-base font-semibold text-slate-800 dark:text-white">{item.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={t('reports.yearly')} subtitle={t('reports.yearlySubtitle')}>
        {yearlyTotals.length ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name={t('reports.metrics.income')} fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" name={t('reports.metrics.expense')} fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
