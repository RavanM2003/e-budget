import { useTranslation } from 'react-i18next';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/date';

const statusVariant = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'danger'
};

const sortableColumns = new Set(['title', 'date', 'amount']);

const TransactionsTable = ({ data, onEdit, onDelete, formatCurrency, sortConfig, onSort, categoryColors = {}, typeLookup = {} }) => {
  const { t } = useTranslation();
  const headers = ['title', 'type', 'category', 'date', 'amount', 'status', 'actions'];
  const currency = typeof formatCurrency === 'function' ? formatCurrency : (value) => value;

  const handleEdit = (event, item) => {
    event?.stopPropagation?.();
    onEdit?.(item);
  };

  const handleDelete = (event, id) => {
    event?.stopPropagation?.();
    onDelete?.(id);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-slate-500">
            {headers.map((header) => (
              <th key={header} className="px-6 py-4">
                {sortableColumns.has(header) && onSort ? (
                  <button type="button" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300" onClick={() => onSort(header)}>
                    {t(`transactions.${header}`)}
                    {sortConfig?.key === header && <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                  </button>
                ) : (
                  t(`transactions.${header}`)
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-600 transition hover:bg-slate-50/60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60" onClick={() => onEdit?.(item)}>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.title}</td>
              <td className="px-6 py-4 capitalize">{typeLookup[item.typeKey] || t(`transactions.filters.${item.type}`, { defaultValue: item.typeKey || item.type })}</td>
              <td className="px-6 py-4">
                {item.category ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[item.category] || '#94a3b8' }} />
                    {item.category}
                  </span>
                ) : (
                  <span className="text-slate-400">{t('transactions.filters.all')}</span>
                )}
              </td>
              <td className="px-6 py-4">{formatDate(item.date)}</td>
              <td className="px-6 py-4 font-semibold">{currency(item.amount)}</td>
              <td className="px-6 py-4">
                {item.status ? (
                  <Badge variant={statusVariant[item.status] || 'default'}>{t(`common.status.${item.status}`, { defaultValue: item.status })}</Badge>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button onClick={(event) => handleEdit(event, item)} className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200">
                    {t('actions.edit')}
                  </button>
                  <button onClick={(event) => handleDelete(event, item.id)} className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10">
                    {t('actions.delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
