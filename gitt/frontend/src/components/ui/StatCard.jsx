import clsx from 'clsx';

export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    green:   'bg-green-50 text-green-600',
    blue:    'bg-blue-50 text-blue-600',
    yellow:  'bg-yellow-50 text-yellow-600',
    red:     'bg-red-50 text-red-600'
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={clsx('h-12 w-12 rounded-lg flex items-center justify-center', colorMap[color])}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-800">{value ?? '-'}</div>
        {trend && <div className="text-xs text-gray-400">{trend}</div>}
      </div>
    </div>
  );
}
