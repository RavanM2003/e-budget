import Card from '../common/Card';

const ChartCard = ({ title, subtitle, children, toolbar }) => (
  <Card title={title} subtitle={subtitle} action={toolbar}>
    <div className="h-72 w-full">{children}</div>
  </Card>
);

export default ChartCard;
