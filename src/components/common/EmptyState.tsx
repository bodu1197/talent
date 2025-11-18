import { IconType } from "react-icons";
import {
  FaInbox,
  FaBriefcase,
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaFileAlt,
  FaExclamationCircle,
} from "react-icons/fa";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

// Icon mapping
const iconComponents: Record<string, IconType> = {
  "fa-inbox": FaInbox,
  "fa-briefcase": FaBriefcase,
  "fa-shopping-cart": FaShoppingCart,
  "fa-heart": FaHeart,
  "fa-star": FaStar,
  "fa-file-alt": FaFileAlt,
  "fa-exclamation-circle": FaExclamationCircle,
};

export default function EmptyState({
  icon = "fa-inbox",
  title,
  description,
  action,
}: EmptyStateProps) {
  const IconComponent = iconComponents[icon] || FaInbox;

  return (
    <div className="text-center py-12">
      <IconComponent
        className="text-6xl text-gray-300 mb-4 mx-auto"
        aria-hidden="true"
      />
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
