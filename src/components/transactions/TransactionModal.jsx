import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';

const getDefaultForm = (statusId, typeSlug) => ({
  title: '',
  type: typeSlug || '',
  categoryId: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  statusId: statusId || ''
});

const composeForm = (payload, statusId, typeSlug) => ({
  ...getDefaultForm(statusId, typeSlug),
  ...(payload || {})
});

const TransactionModal = ({ open, onClose, onSave, initial }) => {
  const { t } = useTranslation();
  const { categories, statuses, types } = useData();
  const fallbackStatusId = statuses[0]?.id || '';
  const fallbackTypeSlug = initial?.type || types[0]?.slug || '';
  const [form, setForm] = useState(composeForm(initial, fallbackStatusId, fallbackTypeSlug));

  useEffect(() => {
    const typeBase = initial?.type || types[0]?.slug || '';
    setForm(composeForm(initial, statuses[0]?.id || '', typeBase));
  }, [initial, statuses, types]);

  useEffect(() => {
    if (!form.type && types.length) {
      setForm((prev) => ({ ...prev, type: types[0].slug }));
    }
  }, [form.type, types]);

  const typeCategories = useMemo(() => categories.filter((category) => category.type === form.type), [categories, form.type]);

  useEffect(() => {
    if (!typeCategories.length) {
      setForm((prev) => ({ ...prev, categoryId: '' }));
      return;
    }
    if (!form.categoryId || !typeCategories.some((category) => category.id === form.categoryId)) {
      setForm((prev) => ({ ...prev, categoryId: typeCategories[0]?.id || '' }));
    }
  }, [typeCategories, form.categoryId]);

  useEffect(() => {
    if (!form.statusId && fallbackStatusId) {
      setForm((prev) => ({ ...prev, statusId: fallbackStatusId }));
    }
  }, [fallbackStatusId, form.statusId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'type') {
      const nextCategories = categories.filter((category) => category.type === value);
      setForm((prev) => ({
        ...prev,
        type: value,
        categoryId: nextCategories[0]?.id || ''
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave?.({ ...form, amount: Number(form.amount) });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('transactions.edit') : t('transactions.add')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['title', 'amount', 'date'].map((field) => (
          <label key={field} className="block space-y-2 text-sm">
            <span className="font-medium">{t(`transactions.fields.${field}`)}</span>
            <input
              name={field}
              value={form[field]}
              type={field === 'amount' ? 'number' : field === 'date' ? 'date' : 'text'}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700"
              required
            />
          </label>
        ))}
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.fields.category')}</span>
          {typeCategories.length ? (
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {typeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {t('categories.emptyDescription')}
            </div>
          )}
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.type')}</span>
          {types.length ? (
            <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
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
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.status')}</span>
          {statuses.length ? (
            <select name="statusId" value={form.statusId || ''} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.slug ? t(`common.status.${status.slug}`, { defaultValue: status.name }) : status.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {t('transactions.emptyDescription')}
            </div>
          )}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onClose} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            {t('forms.cancel')}
          </button>
          <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            {t('forms.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
