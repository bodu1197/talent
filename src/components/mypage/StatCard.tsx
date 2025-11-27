import {
  Loader2,
  PackageOpen,
  Star,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: string;
  readonly color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  readonly subtitle?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
};

// Icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  'fa-spinner': Loader2,
  'fa-box-open': PackageOpen,
  'fa-star': Star,
  'fa-shopping-cart': ShoppingCart,
  'fa-chart-line': TrendingUp,
  'fa-dollar-sign': DollarSign,
  'fa-users': Users,
  'fa-clock': Clock,
};

export default function StatCard({ title, value, icon, color = 'blue', subtitle }: StatCardProps) {
  const IconComponent = iconComponents[icon] || TrendingUp;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 card-interactive">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-gray-600">{title}</h3>
        <div
          className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center click-bounce`}
        >
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}
