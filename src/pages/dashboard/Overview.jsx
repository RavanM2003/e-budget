import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownRight, ArrowUpRight, CreditCard, PiggyBank } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/common/Card';
import ChartCard from '../../components/dashboard/ChartCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import GoalCard from '../../components/dashboard/GoalCard';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatDate } from '../../utils/date';

const CATEGORY_FALLBACK = {
  income: '#10b981',
  expense: '#ef4444'
};

const buildMonthKey = (year, month) => `${year}-${month}`;
const parseMonthKey = (key) => {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
};
const formatMonthLabel = (year, month) => `${String(month + 1).padStart(2, '0')}/${year}`;

const collectMonthOptions = (transactions, _locale, fallbackKey) => {
  const optionMap = new Map();
  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) return;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = buildMonthKey(year, month);
    if (!optionMap.has(key)) {
      optionMap.set(key, formatMonthLabel(year, month));
    }
  });
  if (!optionMap.has(fallbackKey)) {
    const { year, month } = parseMonthKey(fallbackKey);
    optionMap.set(fallbackKey, formatMonthLabel(year, month));
  }
  return Array.from(optionMap.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => parseMonthKey(b.key).year - parseMonthKey(a.key).year || parseMonthKey(b.key).month - parseMonthKey(a.key).month);
};

const formatDelta = (current, previous) => {
  if (!previous) return '-';
  const value = ((current - previous) / previous) * 100;
  if (!Number.isFinite(value)) return '-';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const aggregateStats = (transactions, additionalExpense = 0) => {
  const stats = transactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === 'income') acc.income += amount;
      else acc.expense += amount;
      acc.count += 1;
      return acc;
    },
    { income: 0, expense: 0, count: 0 }
  );
  if (additionalExpense) {
    stats.expense += additionalExpense;
  }
  stats.net = stats.income - stats.expense;
  return stats;
};

const OverviewPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { transactions, goals, categories, loading: dataLoading, error: dataError } = useData();
  const { settings } = useSettings();
  const now = new Date();
  const currentKey = buildMonthKey(now.getFullYear(), now.getMonth());

  const monthOptions = useMemo(() => collectMonthOptions(transactions, i18n.language, currentKey), [transactions, i18n.language, currentKey]);
  const [primaryMonth, setPrimaryMonth] = useState(monthOptions[0]?.key || currentKey);
  const fallbackComparison = monthOptions[1]?.key || primaryMonth;
  const [comparisonMonth, setComparisonMonth] = useState(fallbackComparison);

  const { year: primaryYear, month: primaryMonthIndex } = parseMonthKey(primaryMonth);
  const primaryTransactions = useMemo(
    () => transactions.filter((tx) => {
      const date = new Date(tx.date);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === primaryYear && date.getMonth() === primaryMonthIndex;
    }),
    [transactions, primaryYear, primaryMonthIndex]
  );

  const previousKey = useMemo(() => {
    const date = new Date(primaryYear, primaryMonthIndex - 1, 1);
    return buildMonthKey(date.getFullYear(), date.getMonth());
  }, [primaryYear, primaryMonthIndex]);

  const previousTransactions = useMemo(
    () => transactions.filter((tx) => {
      const date = new Date(tx.date);
      const { year, month } = parseMonthKey(previousKey);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
    }),
    [transactions, previousKey]
  );

  const comparisonTransactions = useMemo(() => {
    const { year, month } = parseMonthKey(comparisonMonth);
    return transactions.filter((tx) => {
      const date = new Date(tx.date);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
    });
  }, [transactions, comparisonMonth]);

  const extraExpenses = useMemo(() => {
    const goalSavings = goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0);
    return {
      goalSavings,
      total: goalSavings
    };
  }, [goals]);

  const categoryLookup = useMemo(
    () =>
      categories.reduce((acc, category) => {
        if (category.name) {
          acc[category.name] = category;
        }
        return acc;
      }, {}),
    [categories]
  );

  const topExpenseCategory = useMemo(() => {
    const expenses = primaryTransactions.filter((tx) => tx.type === 'expense');
    if (!expenses.length) return null;
    const totalExpense = expenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const grouped = expenses.reduce((acc, tx) => {
      const key = tx.category || t('transactions.filters.all');
      acc[key] = (acc[key] || 0) + (Number(tx.amount) || 0);
      return acc;
    }, {});
    const [name, value] = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    const percent = totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0;
    return { name, value, percent };
  }, [primaryTransactions, t]);


  const primaryStats = useMemo(() => aggregateStats(primaryTransactions, extraExpenses.total), [primaryTransactions, extraExpenses]);
  const previousStats = useMemo(() => aggregateStats(previousTransactions), [previousTransactions]);
  const comparisonStats = useMemo(() => aggregateStats(comparisonTransactions), [comparisonTransactions]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: settings.currency || 'AZN'
      }),
    [i18n.language, settings.currency]
  );

  const stats = [
    { title: t('dashboard.income'), value: primaryStats.income, delta: formatDelta(primaryStats.income, previousStats.income), icon: ArrowUpRight, trend: primaryStats.income >= previousStats.income ? 'up' : 'down' },
    { title: t('dashboard.expenses'), value: primaryStats.expense, delta: formatDelta(primaryStats.expense, previousStats.expense), icon: ArrowDownRight, trend: primaryStats.expense <= previousStats.expense ? 'up' : 'down' },
    { title: t('dashboard.savings'), value: Math.max(primaryStats.net, 0), delta: formatDelta(primaryStats.net, previousStats.net), icon: PiggyBank, trend: primaryStats.net >= previousStats.net ? 'up' : 'down' },
    { title: t('dashboard.availableBudget'), value: Math.max(0, primaryStats.income - primaryStats.expense), delta: formatDelta(primaryStats.income - primaryStats.expense, previousStats.income - previousStats.expense), icon: CreditCard, trend: primaryStats.income - primaryStats.expense >= previousStats.income - previousStats.expense ? 'up' : 'down' }
  ].map((entry) => ({ ...entry, valueLabel: currencyFormatter.format(entry.value) }));

  const monthlyNet = primaryStats.net;
  const yearlyNet = useMemo(() => {
    const { year } = parseMonthKey(primaryMonth);
    const base = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) return acc;
      const amount = Number(tx.amount) || 0;
      return acc + (tx.type === 'income' ? amount : -amount);
    }, 0);
    return base - extraExpenses.total;
  }, [transactions, primaryMonth, extraExpenses]);

  const alerts = useMemo(() => {
    const list = [];
    if (primaryStats.income > 0) {
      const ratio = Math.round((primaryStats.expense / primaryStats.income) * 100);
      if (ratio >= 100) {
        list.push({ type: 'danger', message: t('alerts.monthlyLoss', { value: currencyFormatter.format(Math.abs(primaryStats.expense - primaryStats.income)) }) });
      } else if (ratio >= 80) {
        list.push({ type: 'warning', message: t('alerts.highSpending', { percent: ratio }) });
      } else if (monthlyNet > 0) {
        list.push({ type: 'positive', message: t('alerts.profit', { value: currencyFormatter.format(monthlyNet) }) });
      }
    } else if (monthlyNet > 0) {
      list.push({ type: 'positive', message: t('alerts.profit', { value: currencyFormatter.format(monthlyNet) }) });
    }
    goals
      .filter((goal) => Number(goal.target) > 0)
      .map((goal) => ({ ...goal, progress: Math.round((Number(goal.saved) / Number(goal.target)) * 100) }))
      .filter((goal) => goal.progress >= 70 && goal.progress < 100)
      .slice(0, 2)
      .forEach((goal) => list.push({ type: 'positive', message: t('alerts.goalAlmost', { title: goal.title, progress: goal.progress }) }));
    return list.slice(0, 4);
  }, [monthlyNet, primaryStats, goals, currencyFormatter, t]);

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, { month: 'short' }), [i18n.language]);

  const monthlySeries = useMemo(() => {
    const grouped = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return acc;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!acc[key]) {
        acc[key] = { month: date, income: 0, expense: 0 };
      }
      acc[key][tx.type] += Number(tx.amount) || 0;
      return acc;
    }, {});
    return Object.values(grouped)
      .sort((a, b) => a.month - b.month)
      .slice(-6)
      .map((entry) => ({
        label: monthFormatter.format(entry.month),
        income: entry.income,
        expense: entry.expense
      }));
  }, [transactions, monthFormatter]);

  const weeklySeries = useMemo(() => {
    const grouped = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return acc;
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!acc[weekKey]) acc[weekKey] = { label: weekKey, income: 0, expense: 0 };
      acc[weekKey][tx.type] += Number(tx.amount) || 0;
      return acc;
    }, {});
    return Object.entries(grouped)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, value]) => ({ ...value, expense: -value.expense }))
      .slice(-8);
  }, [transactions]);

  const categorySeries = useMemo(() => {
    const grouped = {
      income: {},
      expense: {}
    };
    transactions.forEach((tx) => {
      if (!tx.category) return;
      const type = tx.type === 'income' ? 'income' : 'expense';
      if (!grouped[type][tx.category]) {
        grouped[type][tx.category] = {
          name: tx.category,
          value: 0,
          color: categoryLookup[tx.category]?.color || CATEGORY_FALLBACK[type]
        };
      }
      grouped[type][tx.category].value += Number(tx.amount) || 0;
    });
    return {
      income: Object.values(grouped.income),
      expense: Object.values(grouped.expense)
    };
  }, [transactions, categoryLookup]);

  const categoryTotals = useMemo(
    () => ({
      income: categorySeries.income.reduce((sum, entry) => sum + entry.value, 0),
      expense: categorySeries.expense.reduce((sum, entry) => sum + entry.value, 0)
    }),
    [categorySeries]
  );

  const hasCategoryData = categorySeries.income.length > 0 || categorySeries.expense.length > 0;

  const recentTransactions = primaryTransactions.slice(0, 4);


  useEffect(() => {
    if (!monthOptions.find((option) => option.key === primaryMonth)) {
      setPrimaryMonth(monthOptions[0]?.key || currentKey);
    }
  }, [monthOptions, primaryMonth, currentKey]);

  useEffect(() => {
    if (!comparisonMonth || comparisonMonth === primaryMonth) {
      const candidate = monthOptions.find((option) => option.key !== primaryMonth);
      if (candidate) {
        setComparisonMonth(candidate.key);
      }
    }
  }, [monthOptions, primaryMonth, comparisonMonth]);

  const quickNavigateOptions = [
    { title: t('dashboard.addTransaction'), description: t('dashboard.quickAdd'), icon: CreditCard, to: '/transactions' },
    { title: t('dashboard.trackGoal'), description: t('dashboard.quickGoal'), icon: PiggyBank, to: '/goals' }
  ];

  const comparisonOptions = monthOptions.filter((option) => option.key !== primaryMonth);

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <Card title={t('dashboard.monthlySummary')}>
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dataError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{dataError}</div>}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs uppercase text-slate-500">{t('dashboard.monthlySummary')}</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{monthOptions.find((option) => option.key === primaryMonth)?.label}</h2>
        </div>
        <select className="rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" value={primaryMonth} onChange={(event) => setPrimaryMonth(event.target.value)}>
          {monthOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.valueLabel} delta={stat.delta} trend={stat.trend} icon={stat.icon} />
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.message}-${index}`}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                alert.type === 'danger'
                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                  : alert.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {[{ title: t('dashboard.monthlyNet'), value: monthlyNet }, { title: t('dashboard.yearlyNet'), value: yearlyNet }].map((entry) => {
          const positive = entry.value >= 0;
          return (
            <Card key={entry.title} title={entry.title} subtitle={positive ? t('dashboard.profit') : t('dashboard.loss')}>
              <p className={`text-3xl font-semibold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {positive ? '+' : '-'}
                {currencyFormatter.format(Math.abs(entry.value))}
              </p>
            </Card>
          );
        })}
        {topExpenseCategory ? (
          <Card title={t('dashboard.topSpending')} subtitle={primaryStats.expense ? t('dashboard.expenses') : undefined}>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{topExpenseCategory.name}</p>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(topExpenseCategory.value)}</p>
              <p className="text-xs text-slate-500">{topExpenseCategory.percent}% {t('dashboard.expenses')}</p>
            </div>
          </Card>
        ) : (
          <Card title={t('dashboard.topSpending')}><p className="text-sm text-slate-500">{t('common.empty')}</p></Card>
        )}
      </div>

      {comparisonOptions.length > 0 && (
        <Card title={t('dashboard.monthlySummary')} subtitle={t('dashboard.incomeVsExpense')}>
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <span className="text-sm font-medium text-slate-500">{t('dashboard.monthlySummary')}</span>
            <select className="rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" value={comparisonMonth} onChange={(event) => setComparisonMonth(event.target.value)}>
              {comparisonOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            {[{ key: 'income', label: t('dashboard.income') }, { key: 'expense', label: t('dashboard.expenses') }, { key: 'net', label: t('dashboard.savings') }].map((row) => (
              <div key={row.key} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-2 dark:border-slate-800">
                <span>{row.label}</span>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(primaryStats[row.key])}</p>
                  <p className="text-xs text-slate-500">
                    {currencyFormatter.format(comparisonStats[row.key])} ({formatDelta(primaryStats[row.key], comparisonStats[row.key])})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ChartCard title={t('dashboard.incomeVsExpense')} subtitle={t('dashboard.lastSixMonths')}>
          {monthlySeries.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries} margin={{ left: 0, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="income" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#income)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </ChartCard>

        <Card title={t('dashboard.quickActions')}>
          <div className="grid gap-3">
            {quickNavigateOptions.map((action) => (
              <QuickActionCard key={action.title} {...action} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title={t('dashboard.cashflow')} subtitle={t('dashboard.weeklyMovement')}>
          {weeklySeries.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySeries}>
                <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [
                    currencyFormatter.format(Math.abs(value)),
                    t(`dashboard.${name === 'income' ? 'income' : 'expenses'}`)
                  ]}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[0, 0, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </ChartCard>
        <ChartCard title={t('dashboard.allocation')} subtitle={t('dashboard.byCategory')}>
          {hasCategoryData ? (
            <div className="grid gap-6 md:grid-cols-2">
              {['income', 'expense'].map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
                    <span>{t(`dashboard.${type === 'income' ? 'income' : 'expenses'}`)}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{currencyFormatter.format(categoryTotals[type] || 0)}</span>
                  </div>
                  {categorySeries[type].length ? (
                    <>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categorySeries[type]} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                              {categorySeries[type].map((entry) => (
                                <Cell key={`${type}-${entry.name}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [currencyFormatter.format(value), name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
                        {categorySeries[type].map((entry) => {
                          const total = categoryTotals[type];
                          const percent = total ? Math.round((entry.value / total) * 100) : 0;
                          return (
                            <li key={`${type}-legend-${entry.name}`} className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                              </span>
                              <span className="font-semibold text-slate-700 dark:text-white">{percent}%</span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
                      {t('dashboard.noDataMessage')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('common.empty')} description={t('dashboard.noDataMessage')} />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('goals.title')} subtitle={t('dashboard.goalsOverview')}>
          {goals.length ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} {...goal} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('common.empty')} description={t('goals.empty')} />
          )}
        </Card>
      </div>

      <Card title={t('transactions.recent')} action={<button className="text-sm font-semibold text-brand-600" onClick={() => navigate('/transactions')}>
        {t('common.viewAll')}
      </button>}>
        {recentTransactions.length ? (
          <div className="grid gap-4">
            {recentTransactions.map((tx) => {
              const badgeColor = categoryLookup[tx.category]?.color || (tx.type === 'income' ? CATEGORY_FALLBACK.income : CATEGORY_FALLBACK.expense);
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: badgeColor }} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{tx.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {currencyFormatter.format(Number(tx.amount) || 0)}
                    </p>
                    <p className="text-xs text-slate-400">{tx.category || t('transactions.filters.all')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title={t('transactions.empty')} description={t('transactions.emptyDescription')} />
        )}
      </Card>
    </div>
  );
};

export default OverviewPage;
