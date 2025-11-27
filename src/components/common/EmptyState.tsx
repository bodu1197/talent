import {
  Inbox,
  Briefcase,
  ShoppingCart,
  Heart,
  Star,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface EmptyStateProps {
  readonly icon?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: {
    readonly label: string;
    readonly href: string;
  };
}

// Icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  'fa-inbox': Inbox,
  'fa-briefcase': Briefcase,
  'fa-shopping-cart': ShoppingCart,
  'fa-heart': Heart,
  'fa-star': Star,
  'fa-file-alt': FileText,
  'fa-exclamation-circle': AlertCircle,
};

export default function EmptyState({
  icon = 'fa-inbox',
  title,
  description,
  action,
}: EmptyStateProps) {
  const IconComponent = iconComponents[icon] || Inbox;

  return (
    <div className="text-center py-12">
      <IconComponent className="w-16 h-16 text-gray-300 mb-4 mx-auto" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
