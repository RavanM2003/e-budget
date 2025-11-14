import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../utils/date';

const SearchPalette = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transactions, budgets, categories, goals } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setQuery('');
        inputRef.current?.focus();
      });
    }
  }, [open]);

  const sections = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase();
    return [
      {
        label: t('transactions.title'),
        type: 'transactions',
        items: transactions
          .filter((tx) => tx.title.toLowerCase().includes(term) || (tx.category || '').toLowerCase().includes(term))
          .slice(0, 5)
          .map((tx) => ({ id: tx.id, title: tx.title, subtitle: `${formatDate(tx.date)} • ${tx.category || t('transactions.filters.all')}`, to: '/transactions' }))
      },
      {
        label: t('categories.title'),
        type: 'categories',
        items: categories
          .filter((category) => category.name.toLowerCase().includes(term))
          .slice(0, 5)
          .map((category) => ({ id: category.id, title: category.name, subtitle: category.type === 'income' ? t('transactions.filters.income') : t('transactions.filters.expense'), to: '/categories' }))
      },
      {
        label: t('budgets.title'),
        type: 'budgets',
        items: budgets
          .filter((budget) => budget.title.toLowerCase().includes(term))
          .slice(0, 5)
          .map((budget) => ({ id: budget.id, title: budget.title, subtitle: t('budgets.limit') + ': ' + budget.limit, to: '/budgets' }))
      },
      {
        label: t('goals.title'),
        type: 'goals',
        items: goals
          .filter((goal) => goal.title.toLowerCase().includes(term))
          .slice(0, 5)
          .map((goal) => ({ id: goal.id, title: goal.title, subtitle: `${goal.saved}/${goal.target}`, to: '/goals' }))
      }
    ].filter((section) => section.items.length);
  }, [query, transactions, categories, budgets, goals, t]);

  const handleNavigate = (to) => {
    onClose();
    navigate(to);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur" onClick={onClose}>
      <div className="mx-auto mt-24 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          placeholder={t('forms.search')}
        />
        <div className="mt-4 max-h-80 space-y-4 overflow-auto">
          {sections.length === 0 ? (
            <p className="text-sm text-slate-500">{t('common.empty')}</p>
          ) : (
            sections.map((section) => (
              <div key={section.type}>
                <p className="text-xs uppercase text-slate-400">{section.label}</p>
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button onClick={() => handleNavigate(item.to)} className="w-full rounded-2xl border border-slate-100 px-4 py-2 text-left text-sm shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.subtitle}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPalette;
