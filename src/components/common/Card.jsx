import clsx from 'clsx';

const Card = ({ title, subtitle, action, className = '', children }) => (
  <section className={clsx('glass-card fade-layout', className)}>
    {(title || subtitle || action) && (
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

export default Card;
