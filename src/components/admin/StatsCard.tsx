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

interface CardContentProps {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
}

const CardContent = ({ label, value, Icon, iconColorClass, iconBgClass }: CardContentProps) => (
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

export default function StatsCard({
  label,
  value,
  icon: Icon,
  href,
  iconColorClass,
  iconBgClass,
}: StatsCardProps) {
  const cardClasses = 'bg-white rounded-lg border border-gray-200 p-6';

  if (href) {
    return (
      <Link href={href} className={`${cardClasses} hover:border-brand-primary transition-colors`}>
        <CardContent
          label={label}
          value={value}
          Icon={Icon}
          iconColorClass={iconColorClass}
          iconBgClass={iconBgClass}
        />
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent
        label={label}
        value={value}
        Icon={Icon}
        iconColorClass={iconColorClass}
        iconBgClass={iconBgClass}
      />
    </div>
  );
}
