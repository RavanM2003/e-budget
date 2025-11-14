import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import GoalCard from '../../components/dashboard/GoalCard';
import EmptyState from '../../components/common/EmptyState';
import { useData } from '../../contexts/DataContext';
import { Plus } from 'lucide-react';

const defaultForm = { id: null, title: '', target: '', saved: '', due: '' };

const GoalsPage = () => {
  const { t } = useTranslation();
  const { goals, saveGoal, deleteGoal } = useData();
  const [form, setForm] = useState(defaultForm);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    saveGoal({ ...form, title: form.title.trim(), target: Number(form.target) || 0, saved: Number(form.saved) || 0 });
    setForm(defaultForm);
  };

  const handleEdit = (goal) => setForm({ ...goal, target: String(goal.target), saved: String(goal.saved || '') });

  const handleDelete = (id) => {
    if (window.confirm(t('goals.deleteConfirm'))) {
      deleteGoal(id);
      if (form.id === id) {
        setForm(defaultForm);
      }
    }
  };

  const handleAddSavings = (goal) => {
    const input = window.prompt(t('actions.addSavings'));
    if (!input) return;
    const amount = Number(input);
    if (Number.isNaN(amount) || amount <= 0) return;
    saveGoal({ ...goal, saved: (Number(goal.saved) || 0) + amount });
  };

  return (
    <div className="space-y-6">
      <Card title={form.id ? t('actions.update') : t('goals.add')}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('forms.name')}</span>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('goals.target')}</span>
            <input type="number" value={form.target} onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" required />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('goals.saved')}</span>
            <input type="number" value={form.saved} onChange={(event) => setForm((prev) => ({ ...prev, saved: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-500">{t('goals.due')}</span>
            <input type="date" value={form.due} onChange={(event) => setForm((prev) => ({ ...prev, due: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm" />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-4">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
              <Plus size={16} />
              {form.id ? t('actions.update') : t('forms.save')}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm(defaultForm)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {t('actions.cancel')}
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title={t('goals.title')}>
        {goals.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-3 rounded-3xl border border-slate-100 p-4 dark:border-slate-800">
                <GoalCard {...goal} />
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleEdit(goal)} className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200">
                    {t('actions.edit')}
                  </button>
                  <button onClick={() => handleAddSavings(goal)} className="rounded-xl border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-500/10">
                    {t('actions.addSavings')}
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10">
                    {t('actions.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={t('common.empty')} description={t('goals.empty')} />
        )}
      </Card>
    </div>
  );
};

export default GoalsPage;
