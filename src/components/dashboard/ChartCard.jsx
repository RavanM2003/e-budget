import clsx from 'clsx';
import Card from '../common/Card';

const ChartCard = ({ title, subtitle, children, toolbar, autoHeight = false }) => (
  <Card title={title} subtitle={subtitle} action={toolbar}>
    <div className={clsx('w-full', autoHeight ? 'min-h-[20rem]' : 'h-72')}>{children}</div>
  </Card>
);

export default ChartCard;
