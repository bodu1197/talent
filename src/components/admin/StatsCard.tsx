import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  iconColorClass: string;
  iconBgClass: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  href,
  iconColorClass,
  iconBgClass,
}: StatsCardProps) {
  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgClass}`}>
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
      </div>
    </div>
  );

  const cardClasses = 'bg-white rounded-lg border border-gray-200 p-6';

  if (href) {
    return (
      <Link href={href} className={`${cardClasses} hover:border-brand-primary transition-colors`}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
}
