import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { resolveTypeLabel } from '../../utils/types';

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
  ...(payload || {}),
  type: payload?.typeKey || payload?.type || typeSlug || ''
});

const CATEGORY_COLOR_DEFAULT = '#5c7cfa';

const TransactionModal = ({ open, onClose, onSave, initial }) => {
  const { t } = useTranslation();
  const { categories, statuses, types, saveCategory } = useData();
  const defaultStatusId = initial?.statusId || statuses[0]?.id || '';
  const defaultTypeSlug = initial?.typeKey || initial?.type || types[0]?.slug || '';
  const [form, setForm] = useState(composeForm(initial, defaultStatusId, defaultTypeSlug));
  const [categoryCreator, setCategoryCreator] = useState({
    open: false,
    name: '',
    color: CATEGORY_COLOR_DEFAULT,
    saving: false
  });

  useEffect(() => {
    if (!open) return;
    const nextType = initial?.typeKey || initial?.type || types[0]?.slug || '';
    const nextStatus = initial?.statusId || statuses[0]?.id || '';
    setForm(composeForm(initial, nextStatus, nextType));
  }, [open, initial, statuses, types]);

  useEffect(() => {
    if (!form.type && types.length) {
      setForm((prev) => ({ ...prev, type: types[0].slug }));
    }
  }, [form.type, types]);

  const typeCategories = useMemo(() => categories.filter((category) => category.type === form.type), [categories, form.type]);

  useEffect(() => {
    setCategoryCreator((prev) => ({
      ...prev,
      open: typeCategories.length === 0 ? true : prev.open
    }));
  }, [typeCategories.length]);

  useEffect(() => {
    setCategoryCreator((prev) => ({
      ...prev,
      name: '',
      color: CATEGORY_COLOR_DEFAULT
    }));
  }, [form.type]);

  useEffect(() => {
    if (!open) {
      setCategoryCreator({ open: false, name: '', color: CATEGORY_COLOR_DEFAULT, saving: false });
    }
  }, [open]);

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
    if (!form.statusId && defaultStatusId) {
      setForm((prev) => ({ ...prev, statusId: defaultStatusId }));
    }
  }, [defaultStatusId, form.statusId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'type') {
      const nextCategories = categories.filter((category) => category.type === value);
      setForm((prev) => ({
        ...prev,
        type: value,
        categoryId: nextCategories[0]?.id || ''
      }));
      setCategoryCreator({
        open: nextCategories.length === 0,
        name: '',
        color: CATEGORY_COLOR_DEFAULT,
        saving: false
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async () => {
    if (!form.type || !categoryCreator.name.trim()) {
      return;
    }
    try {
      setCategoryCreator((prev) => ({ ...prev, saving: true }));
      const created = await saveCategory({
        name: categoryCreator.name.trim(),
        color: categoryCreator.color,
        type: form.type
      });
      if (created?.id) {
        setForm((prev) => ({ ...prev, categoryId: created.id }));
        setCategoryCreator({ open: false, name: '', color: CATEGORY_COLOR_DEFAULT, saving: false });
      } else {
        setCategoryCreator((prev) => ({ ...prev, saving: false }));
      }
    } catch (err) {
      setCategoryCreator((prev) => ({ ...prev, saving: false }));
      window.alert(err.message || t('categories.createError'));
    }
  };

  const toggleCategoryCreator = () =>
    setCategoryCreator((prev) => ({
      ...prev,
      open: !prev.open,
      name: '',
      color: CATEGORY_COLOR_DEFAULT,
      saving: false
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave?.({ ...form, amount: Number(form.amount) });
  };

  const renderCategoryCreator = () => {
    if (!categoryCreator.open) return null;
    const disabled = categoryCreator.saving || !categoryCreator.name.trim();
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!disabled) {
          handleCreateCategory();
        }
      }
    };
    return (
      <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('transactions.categoryCreate')}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={categoryCreator.name}
            onChange={(event) => setCategoryCreator((prev) => ({ ...prev, name: event.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder={t('transactions.categoryNamePlaceholder')}
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700"
          />
          <input
            type="color"
            value={categoryCreator.color}
            onChange={(event) => setCategoryCreator((prev) => ({ ...prev, color: event.target.value }))}
            className="h-11 w-24 cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-700"
          />
        </div>
        <button
          type="button"
          onClick={handleCreateCategory}
          disabled={disabled}
          className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {categoryCreator.saving ? t('forms.save') : t('transactions.categoryCreate')}
        </button>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('transactions.edit') : t('transactions.add')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.fields.title')}</span>
          <input
            name="title"
            value={form.title}
            type="text"
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700"
            required
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.type')}</span>
          {types.length ? (
            <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
              {types.map((type) => (
                <option key={type.id} value={type.slug}>
                  {resolveTypeLabel(type, t) || type.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">{t('categories.emptyDescription')}</div>
          )}
        </label>

        <label className="block space-y-2 text-sm">
          <span className="font-medium">{t('transactions.fields.category')}</span>
          <div className="space-y-2">
            {typeCategories.length ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <select name="categoryId" value={form.categoryId} onChange={handleChange} disabled={!typeCategories.length} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
                  {typeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={toggleCategoryCreator} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200">
                  {categoryCreator.open ? t('forms.cancel') : t('transactions.newCategory')}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                {t('transactions.categoryCreateHint')}
                <div className="mt-3">
                  <button type="button" onClick={toggleCategoryCreator} className="rounded-2xl border border-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700 hover:bg-amber-100 dark:border-amber-300 dark:text-amber-200 dark:hover:bg-amber-500/10">
                    {t('transactions.newCategory')}
                  </button>
                </div>
              </div>
            )}
            {renderCategoryCreator()}
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">{t('transactions.fields.amount')}</span>
            <input name="amount" value={form.amount} type="number" onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">{t('transactions.fields.date')}</span>
            <input name="date" value={form.date} type="date" onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-700" required />
          </label>
        </div>

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
