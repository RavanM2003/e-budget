import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';

const getDefaultForm = () => ({
  title: '',
  type: 'expense',
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  status: 'pending'
});

const composeForm = (payload) => ({
  ...getDefaultForm(),
  ...(payload || {})
});

const TransactionModal = ({ open, onClose, onSave, initial }) => {
  const { t } = useTranslation();
  const { categories } = useData();
  const [form, setForm] = useState(composeForm(initial));

  useEffect(() => {
    setForm(composeForm(initial));
  }, [initial, open]);

  const typeCategories = useMemo(() => categories.filter((category) => category.type === form.type), [categories, form.type]);

  useEffect(() => {
    if (!typeCategories.length && !form.category) return;
    if (!form.category || !typeCategories.some((category) => category.name === form.category)) {
      setForm((prev) => ({ ...prev, category: typeCategories[0]?.name || '' }));
    }
  }, [typeCategories, form.category]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'type') {
      const nextCategories = categories.filter((category) => category.type === value);
      setForm((prev) => ({
        ...prev,
        type: value,
        category: nextCategories[0]?.name || ''
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.({ ...form, amount: Number(form.amount) });
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
            <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {typeCategories.map((category) => (
                <option key={category.id} value={category.name}>
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
          <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
            <option value="income">{t('transactions.filters.income')}</option>
            <option value="expense">{t('transactions.filters.expense')}</option>
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.status')}</span>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
            {['pending', 'cleared', 'scheduled'].map((state) => (
              <option key={state} value={state}>
                {t(`common.status.${state}`)}
              </option>
            ))}
          </select>
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
