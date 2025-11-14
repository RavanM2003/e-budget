import clsx from 'clsx';

const Skeleton = ({ className = '' }) => (
  <div className={clsx('animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/50', className)} />
);

export default Skeleton;
