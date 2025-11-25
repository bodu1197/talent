import { IconType } from 'react-icons';
import {
  FaSpinner,
  FaBoxOpen,
  FaStar,
  FaShoppingCart,
  FaChartLine,
  FaDollarSign,
  FaUsers,
  FaClock,
} from 'react-icons/fa';

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
const iconComponents: Record<string, IconType> = {
  'fa-spinner': FaSpinner,
  'fa-box-open': FaBoxOpen,
  'fa-star': FaStar,
  'fa-shopping-cart': FaShoppingCart,
  'fa-chart-line': FaChartLine,
  'fa-dollar-sign': FaDollarSign,
  'fa-users': FaUsers,
  'fa-clock': FaClock,
};

export default function StatCard({ title, value, icon, color = 'blue', subtitle }: StatCardProps) {
  const IconComponent = iconComponents[icon] || FaChartLine;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 card-interactive">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-gray-600">{title}</h3>
        <div
          className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center click-bounce`}
        >
          <IconComponent className="text-lg" aria-hidden="true" />
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}
