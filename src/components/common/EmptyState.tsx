interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ icon = 'fa-inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <i className={`fas ${icon} text-6xl text-gray-300 mb-4`}></i>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="inline-block px-6 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#1a4b7d] transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
