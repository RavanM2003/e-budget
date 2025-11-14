import clsx from 'clsx';

const Toggle = ({ checked, onChange, label, description, disabled }) => (
  <label className={clsx('flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition', disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand-200 dark:hover:border-brand-500/40', 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60')}>
    <span>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </span>
    <input
      type="checkbox"
      className="peer hidden"
      checked={checked}
      onChange={(event) => onChange?.(event.target.checked)}
      disabled={disabled}
    />
    <span className={clsx('relative h-6 w-11 rounded-full transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500', checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700')}>
      <span className={clsx('absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition', checked ? 'translate-x-5' : 'translate-x-0')} />
    </span>
  </label>
);

export default Toggle;
