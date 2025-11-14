import { Ghost } from 'lucide-react';

const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
    <Ghost className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-700" />
    <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h4>
    {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
